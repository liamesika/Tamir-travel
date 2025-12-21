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

    // Check if there are any bookings
    const tripDate = await prisma.tripDate.findUnique({
      where: { id },
      include: {
        bookings: {
          select: { id: true }
        }
      }
    })

    if (!tripDate) {
      return NextResponse.json(
        { error: 'תאריך טיול לא נמצא' },
        { status: 404 }
      )
    }

    if (tripDate.bookings.length > 0) {
      return NextResponse.json(
        { error: 'לא ניתן למחוק תאריך עם הזמנות קיימות' },
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
