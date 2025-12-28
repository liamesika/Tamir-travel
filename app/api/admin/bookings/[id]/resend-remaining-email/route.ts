import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { EmailService } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { id: bookingId } = await params

    // Fetch booking with trip date
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tripDate: {
          include: {
            trip: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'הזמנה לא נמצאה' },
        { status: 404 }
      )
    }

    if (booking.cancelledAt) {
      return NextResponse.json(
        { error: 'הזמנה זו בוטלה' },
        { status: 400 }
      )
    }

    if (booking.depositStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'מקדמה לא שולמה עדיין' },
        { status: 400 }
      )
    }

    if (booking.remainingStatus === 'PAID') {
      return NextResponse.json(
        { error: 'יתרה כבר שולמה' },
        { status: 400 }
      )
    }

    if (booking.remainingAmount <= 0) {
      return NextResponse.json(
        { error: 'אין יתרה לתשלום' },
        { status: 400 }
      )
    }

    const tripName = booking.tripDate.trip?.name || 'טיול קוטסוולדס'
    const tripDateFormatted = new Date(booking.tripDate.date).toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const paymentLink = `${appUrl}/payment/remaining/${booking.paymentToken}`

    const remainingDueDate = booking.remainingDueDate
      ? new Date(booking.remainingDueDate).toLocaleDateString('he-IL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : new Date(booking.tripDate.date).toLocaleDateString('he-IL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })

    const emailResult = await EmailService.sendRemainingBalanceRequest({
      fullName: booking.fullName,
      email: booking.email,
      tripName,
      tripDate: tripDateFormatted,
      remainingAmount: booking.remainingAmount / 100,
      remainingDueDate,
      paymentLink,
      bookingId: booking.id
    })

    if (emailResult.success) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          remainingEmailSentAt: new Date(),
          remainingEmailMessageId: emailResult.messageId,
          emailSentAt: new Date(),
          emailLastType: 'remaining',
          emailMessageId: emailResult.messageId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'מייל נשלח בהצלחה',
        messageId: emailResult.messageId
      })
    } else {
      return NextResponse.json(
        { error: emailResult.error || 'שגיאה בשליחת מייל' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error resending email:', error)
    return NextResponse.json(
      { error: 'שגיאה בשליחת מייל' },
      { status: 500 }
    )
  }
}
