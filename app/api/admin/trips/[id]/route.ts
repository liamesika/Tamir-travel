import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        tripDates: true,
      },
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'טיול לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error fetching trip:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת טיול' },
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

    const trip = await prisma.trip.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון טיול' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if trip has bookings
    const tripDates = await prisma.tripDate.findMany({
      where: { tripId: params.id },
    })

    const tripDateIds = tripDates.map(td => td.id)

    if (tripDateIds.length > 0) {
      const bookingsCount = await prisma.booking.count({
        where: {
          tripDateId: {
            in: tripDateIds,
          },
        },
      })

      if (bookingsCount > 0) {
        return NextResponse.json(
          { error: 'לא ניתן למחוק טיול עם הזמנות קיימות' },
          { status: 400 }
        )
      }
    }

    // Delete trip dates first
    await prisma.tripDate.deleteMany({
      where: { tripId: params.id },
    })

    // Delete trip
    await prisma.trip.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת טיול' },
      { status: 500 }
    )
  }
}
