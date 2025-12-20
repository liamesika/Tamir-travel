import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { searchParams } = new URL(request.url)
    const tripId = searchParams.get('tripId')
    const status = searchParams.get('status')
    const upcoming = searchParams.get('upcoming') === 'true'

    const where: any = {}

    if (tripId) {
      where.tripId = tripId
    }

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (upcoming) {
      where.date = {
        gte: new Date()
      }
    }

    const tripDates = await prisma.tripDate.findMany({
      where,
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        bookings: {
          select: {
            id: true,
            fullName: true,
            depositStatus: true,
            remainingStatus: true,
            participantsCount: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Add stats to each trip date
    const tripDatesWithStats = tripDates.map(td => {
      const confirmedBookings = td.bookings.filter(b => b.depositStatus === 'PAID').length
      const confirmedParticipants = td.bookings
        .filter(b => b.depositStatus === 'PAID')
        .reduce((sum, b) => sum + b.participantsCount, 0)
      const availableSpots = td.capacity - td.reservedSpots

      return {
        ...td,
        stats: {
          totalBookings: td.bookings.length,
          confirmedBookings,
          confirmedParticipants,
          availableSpots,
          occupancyRate: td.capacity > 0 ? Math.round((td.reservedSpots / td.capacity) * 100) : 0
        }
      }
    })

    return NextResponse.json({ tripDates: tripDatesWithStats })
  } catch (error) {
    console.error('Error fetching trip dates:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת תאריכי טיולים' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { tripId, date, capacity, pricePerPerson, depositAmount, status } = await request.json()

    if (!tripId || !date || !capacity || !pricePerPerson) {
      return NextResponse.json(
        { error: 'חסרים שדות חובה' },
        { status: 400 }
      )
    }

    // Verify trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'טיול לא נמצא' },
        { status: 404 }
      )
    }

    const tripDate = await prisma.tripDate.create({
      data: {
        tripId,
        date: new Date(date),
        capacity: parseInt(capacity),
        pricePerPerson: parseInt(pricePerPerson),
        depositAmount: depositAmount ? parseInt(depositAmount) : 300,
        status: status || 'OPEN'
      },
      include: {
        trip: true
      }
    })

    return NextResponse.json({ tripDate })
  } catch (error) {
    console.error('Error creating trip date:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת תאריך טיול' },
      { status: 500 }
    )
  }
}
