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

    // Check if TripDate exists
    const tripDate = await prisma.tripDate.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            cancelledAt: null // Only count non-cancelled bookings
          },
          select: {
            id: true,
            participantsCount: true
          }
        }
      }
    })

    if (!tripDate) {
      return NextResponse.json(
        { error: 'תאריך טיול לא נמצא', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Already cancelled
    if (tripDate.cancelledAt) {
      return NextResponse.json(
        { error: 'תאריך זה כבר בוטל', code: 'ALREADY_CANCELLED' },
        { status: 400 }
      )
    }

    // Check for active bookings (non-cancelled)
    const activeBookings = tripDate.bookings
    if (activeBookings.length > 0) {
      return NextResponse.json(
        {
          error: 'לא ניתן לבטל תאריך עם הזמנות פעילות',
          code: 'HAS_ACTIVE_BOOKINGS',
          bookingsCount: activeBookings.length,
          participantsCount: activeBookings.reduce((sum, b) => sum + b.participantsCount, 0)
        },
        { status: 409 }
      )
    }

    // Soft-delete: set cancelledAt and update status
    const updatedTripDate = await prisma.tripDate.update({
      where: { id },
      data: {
        cancelledAt: new Date(),
        status: 'CANCELLED'
      }
    })

    return NextResponse.json({
      success: true,
      tripDate: updatedTripDate,
      message: 'תאריך הטיול בוטל בהצלחה'
    })
  } catch (error) {
    console.error('Error cancelling trip date:', error)

    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: 'תאריך טיול לא נמצא', code: 'NOT_FOUND' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'שגיאה בביטול תאריך טיול', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
