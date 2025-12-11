import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if date has bookings
    const bookingsCount = await prisma.booking.count({
      where: {
        tripDateId: params.id,
      },
    })

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: `לא ניתן למחוק תאריך עם ${bookingsCount} הזמנות קיימות` },
        { status: 400 }
      )
    }

    // Delete trip date
    await prisma.tripDate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trip date:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת תאריך' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const tripDate = await prisma.tripDate.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ tripDate })
  } catch (error) {
    console.error('Error updating trip date:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון תאריך' },
      { status: 500 }
    )
  }
}
