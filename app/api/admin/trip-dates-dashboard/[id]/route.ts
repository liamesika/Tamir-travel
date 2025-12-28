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
        bookings: {
          include: {
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

    // Calculate stats
    const participants = tripDate.bookings
      .filter(b => b.depositStatus === 'PAID')
      .reduce((sum, b) => sum + b.participantsCount, 0)

    const paidDeposits = tripDate.bookings.filter(b => b.depositStatus === 'PAID').length
    const paidRemaining = tripDate.bookings.filter(b => b.remainingStatus === 'PAID').length
    const pendingDeposits = tripDate.bookings.filter(b => b.depositStatus === 'PENDING').length

    const revenue = tripDate.bookings.reduce((sum, b) => {
      let amount = 0
      if (b.depositStatus === 'PAID') amount += b.depositAmount
      if (b.remainingStatus === 'PAID') amount += b.remainingAmount
      return sum + amount
    }, 0)

    const pendingRevenue = tripDate.bookings.reduce((sum, b) => {
      let pending = 0
      if (b.depositStatus === 'PENDING') pending += b.depositAmount
      if (b.depositStatus === 'PAID' && b.remainingStatus === 'PENDING') pending += b.remainingAmount
      return sum + pending
    }, 0)

    return NextResponse.json({
      tripDate: {
        ...tripDate,
        stats: {
          participants,
          paidDeposits,
          paidRemaining,
          pendingDeposits,
          bookingsCount: tripDate.bookings.length,
          revenue,
          pendingRevenue,
          availableSpots: tripDate.capacity - participants,
          minReached: participants >= tripDate.minParticipants,
          isSoldOut: participants >= tripDate.capacity
        }
      }
    })
  } catch (error) {
    console.error('Error fetching trip date:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת נתונים' },
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
    const data = await request.json()

    const tripDate = await prisma.tripDate.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.pricePerPerson && { pricePerPerson: parseInt(data.pricePerPerson) }),
        ...(data.date && { date: new Date(data.date) })
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
            participantsCount: true,
            depositStatus: true
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

    // Handle Prisma specific errors
    if (error instanceof Error) {
      // Record not found during update (race condition)
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
