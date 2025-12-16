import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentService } from '@/lib/payment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'חסר מזהה הזמנה' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tripDate: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'הזמנה לא נמצאה' },
        { status: 404 }
      )
    }

    if (booking.remainingStatus === 'PAID') {
      return NextResponse.json(
        { error: 'יתרת התשלום כבר שולמה' },
        { status: 400 }
      )
    }

    if (booking.remainingAmount <= 0) {
      return NextResponse.json(
        { error: 'אין יתרת תשלום' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session for remaining payment
    const payment = await PaymentService.createRemainingPayment({
      bookingId: booking.id,
      amount: booking.remainingAmount,
      customerEmail: booking.email,
      customerName: booking.fullName,
    })

    return NextResponse.json({
      url: payment.url,
      sessionId: payment.sessionId,
    })
  } catch (error) {
    console.error('Remaining payment error:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת קישור תשלום' },
      { status: 500 }
    )
  }
}
