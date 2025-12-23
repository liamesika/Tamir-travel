import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST - Send communication (email or log WhatsApp)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { type } = body // 'email' or 'whatsapp'

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tripDate: {
          include: {
            trip: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'הזמנה לא נמצאה' },
        { status: 404 }
      )
    }

    // Generate payment link
    const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/payment/${booking.paymentToken}`
    const tripDate = new Date(booking.tripDate.date)
    const formattedDate = tripDate.toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // Determine what payment is needed
    let amountDue = 0
    let paymentType = ''

    if (booking.depositStatus === 'PENDING') {
      amountDue = booking.depositAmount
      paymentType = 'מקדמה'
    } else if (booking.depositStatus === 'PAID' && booking.remainingStatus === 'PENDING') {
      amountDue = booking.remainingAmount
      paymentType = 'יתרת תשלום'
    } else {
      return NextResponse.json(
        { error: 'אין תשלום ממתין' },
        { status: 400 }
      )
    }

    const formattedAmount = `₪${Math.round(amountDue / 100).toLocaleString('he-IL')}`

    if (type === 'whatsapp') {
      // Generate WhatsApp message
      const message = `שלום ${booking.fullName}! 👋

זוהי תזכורת לגבי ה${paymentType} עבור הטיול שלנו.

📅 תאריך הטיול: ${formattedDate}
👥 מספר משתתפים: ${booking.participantsCount}
💰 סכום לתשלום: ${formattedAmount}

לתשלום מאובטח לחצו על הקישור:
${paymentLink}

בברכה,
תמיר טריפ 🌍`

      // Format phone for WhatsApp
      let phone = booking.phone.replace(/\D/g, '')
      if (phone.startsWith('0')) {
        phone = '972' + phone.slice(1)
      } else if (!phone.startsWith('972')) {
        phone = '972' + phone
      }

      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

      // Mark as WhatsApp sent
      await prisma.booking.update({
        where: { id },
        data: { whatsappSent: true },
      })

      return NextResponse.json({
        success: true,
        whatsappUrl,
        message: 'קישור וואטסאפ נוצר בהצלחה',
      })
    } else if (type === 'email') {
      // Send email
      const emailResult = await EmailService.sendRemainingBalanceRequest({
        fullName: booking.fullName,
        email: booking.email,
        tripDate: formattedDate,
        remainingAmount: Math.round(amountDue / 100),
        remainingDueDate: booking.remainingDueDate
          ? new Date(booking.remainingDueDate).toLocaleDateString('he-IL')
          : formattedDate,
        paymentLink,
        bookingId: booking.id,
      })

      // Mark as email sent
      await prisma.booking.update({
        where: { id },
        data: { emailSent: true },
      })

      return NextResponse.json({
        success: true,
        message: 'אימייל נשלח בהצלחה',
        emailResult,
      })
    }

    return NextResponse.json(
      { error: 'סוג תקשורת לא חוקי' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Communication error:', error)
    return NextResponse.json(
      { error: 'שגיאה בשליחה' },
      { status: 500 }
    )
  }
}

// GET - Get communication status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        emailSent: true,
        whatsappSent: true,
        depositStatus: true,
        remainingStatus: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'הזמנה לא נמצאה' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Get communication status error:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת סטטוס' },
      { status: 500 }
    )
  }
}
