import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { paymentToken: params.token },
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
        { error: 'לינק תשלום לא תקין או פג תוקפו' },
        { status: 404 }
      )
    }

    // Check if deposit was paid
    if (booking.depositStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'יש לשלם תחילה את המקדמה' },
        { status: 400 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Verify token error:', error)
    return NextResponse.json(
      { error: 'שגיאה באימות לינק תשלום' },
      { status: 500 }
    )
  }
}
