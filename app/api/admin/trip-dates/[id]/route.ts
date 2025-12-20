import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { id } = await params

    const tripDate = await prisma.tripDate.findUnique({
      where: { id },
      include: {
        trip: true,
        bookings: {
          include: {
            user: true,
            payments: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!tripDate) {
      return NextResponse.json(
        { error: 'תאריך טיול לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tripDate })
  } catch (error) {
    console.error('Error fetching trip date:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת תאריך טיול' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { id } = await params
    const updateData = await request.json()

    // Only allow certain fields to be updated
    const allowedFields = ['date', 'capacity', 'pricePerPerson', 'depositAmount', 'status']
    const filteredData: any = {}

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'date') {
          filteredData[field] = new Date(updateData[field])
        } else if (['capacity', 'pricePerPerson', 'depositAmount'].includes(field)) {
          filteredData[field] = parseInt(updateData[field])
        } else {
          filteredData[field] = updateData[field]
        }
      }
    }

    // Validate capacity if changing
    if (filteredData.capacity !== undefined) {
      const tripDate = await prisma.tripDate.findUnique({
        where: { id }
      })

      if (tripDate && filteredData.capacity < tripDate.reservedSpots) {
        return NextResponse.json(
          { error: 'לא ניתן להקטין קיבולת מתחת למספר המקומות השמורים' },
          { status: 400 }
        )
      }
    }

    const tripDate = await prisma.tripDate.update({
      where: { id },
      data: filteredData,
      include: {
        trip: true,
        bookings: true
      }
    })

    return NextResponse.json({ tripDate })
  } catch (error) {
    console.error('Error updating trip date:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון תאריך טיול' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { id } = await params

    // Check if trip date has bookings
    const bookingsCount = await prisma.booking.count({
      where: { tripDateId: id }
    })

    if (bookingsCount > 0) {
      return NextResponse.json(
        { error: 'לא ניתן למחוק תאריך טיול עם הזמנות קיימות' },
        { status: 400 }
      )
    }

    await prisma.tripDate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trip date:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת תאריך טיול' },
      { status: 500 }
    )
  }
}
