import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentService } from '@/lib/payment'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BookingSchema = z.object({
  tripDateId: z.string(),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  participantsCount: z.number().int().min(1).max(10),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = BookingSchema.parse(body)

    const tripDate = await prisma.tripDate.findUnique({
      where: { id: data.tripDateId },
    })

    if (!tripDate) {
      return NextResponse.json(
        { error: 'תאריך טיול לא נמצא' },
        { status: 404 }
      )
    }

    const availableSpots = tripDate.capacity - tripDate.reservedSpots

    if (availableSpots < data.participantsCount) {
      return NextResponse.json(
        { error: `אין מספיק מקומות פנויים. נותרו ${availableSpots} מקומות בלבד` },
        { status: 400 }
      )
    }

    const depositAmount = data.participantsCount * 300 * 100
    const totalPrice = data.participantsCount * tripDate.pricePerPerson * 100
    const remainingAmount = totalPrice - depositAmount

    const booking = await prisma.booking.create({
      data: {
        ...data,
        totalPrice,
        depositAmount,
        remainingAmount,
        depositStatus: 'PENDING',
      },
    })

    const payment = await PaymentService.createDepositPayment({
      bookingId: booking.id,
      amount: depositAmount,
      customerEmail: data.email,
      customerName: data.fullName,
    })

    return NextResponse.json({
      bookingId: booking.id,
      paymentUrl: payment.url,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת ההזמנה' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        tripDate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת ההזמנות' },
      { status: 500 }
    )
  }
}
