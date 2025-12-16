import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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

    if (booking.depositStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'המקדמה עדיין לא שולמה' },
        { status: 400 }
      )
    }

    if (booking.remainingStatus === 'PAID') {
      return NextResponse.json(
        { error: 'התשלום המלא כבר בוצע' },
        { status: 400 }
      )
    }

    // Generate payment link
    const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/payment/${booking.paymentToken}`

    // Send email
    const tripDate = new Date(booking.tripDate.date)
    const emailResult = await EmailService.sendRemainingBalanceRequest({
      fullName: booking.fullName,
      email: booking.email,
      tripDate: tripDate.toLocaleDateString('he-IL'),
      remainingAmount: Number(Math.round(booking.remainingAmount / 100)),
      remainingDueDate: booking.remainingDueDate
        ? new Date(booking.remainingDueDate).toLocaleDateString('he-IL')
        : tripDate.toLocaleDateString('he-IL'),
      paymentLink,
      bookingId: booking.id,
    })

    // Update emailSent flag
    await prisma.booking.update({
      where: { id: params.id },
      data: { emailSent: true },
    })

    return NextResponse.json({
      success: true,
      message: 'קישור התשלום נשלח בהצלחה',
      emailResult,
    })
  } catch (error) {
    console.error('Send payment link error:', error)
    return NextResponse.json(
      { error: 'שגיאה בשליחת קישור תשלום' },
      { status: 500 }
    )
  }
}
