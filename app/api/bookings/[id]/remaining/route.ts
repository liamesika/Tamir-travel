import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    if (status !== 'PAID') {
      return NextResponse.json(
        { error: 'סטטוס לא תקין' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'הזמנה לא נמצאה' },
        { status: 404 }
      )
    }

    if (booking.remainingStatus === 'PAID') {
      return NextResponse.json(
        { error: 'היתרה כבר שולמה' },
        { status: 400 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        remainingStatus: 'PAID',
        remainingPaidAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('Error updating remaining status:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון סטטוס' },
      { status: 500 }
    )
  }
}
