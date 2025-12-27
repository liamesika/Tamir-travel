import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/email'
import { requireAdmin } from '@/lib/admin-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  // Check if Resend is configured
  const resendConfigured = process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== 're_your_resend_api_key_here'

  if (!resendConfigured) {
    return NextResponse.json(
      {
        error: 'שירות המייל לא מוגדר',
        details: 'יש להגדיר RESEND_API_KEY בהגדרות הסביבה של Vercel',
        configError: true
      },
      { status: 500 }
    )
  }

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

    // Get trip name
    const tripName = booking.tripDate.trip?.name || 'טיול קוטסוולדס'

    // Format date nicely
    const tripDate = new Date(booking.tripDate.date)
    const formattedDate = tripDate.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Send email
    const emailResult = await EmailService.sendRemainingBalanceRequest({
      fullName: booking.fullName,
      email: booking.email,
      tripName,
      tripDate: formattedDate,
      remainingAmount: Number(Math.round(booking.remainingAmount / 100)),
      remainingDueDate: booking.remainingDueDate
        ? new Date(booking.remainingDueDate).toLocaleDateString('he-IL')
        : formattedDate,
      paymentLink,
      bookingId: booking.id,
    })

    // Update email tracking fields
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
        emailLastTo: booking.email,
        emailLastType: 'remaining',
        emailMessageId: emailResult?.messageId || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'קישור התשלום נשלח בהצלחה',
      emailResult,
    })
  } catch (error: any) {
    console.error('Send payment link error:', error)
    return NextResponse.json(
      {
        error: 'שגיאה בשליחת קישור תשלום',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
