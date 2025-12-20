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
    // Get all bookings with related data
    const bookings = await prisma.booking.findMany({
      include: {
        tripDate: {
          include: {
            trip: true
          }
        },
        payments: true
      }
    })

    // Get all trip dates
    const tripDates = await prisma.tripDate.findMany({
      where: {
        date: {
          gte: new Date()
        }
      },
      include: {
        trip: true,
        bookings: {
          where: {
            depositStatus: 'PAID'
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Get all users
    const usersCount = await prisma.user.count()

    // Get all payments
    const payments = await prisma.payment.findMany({
      where: {
        status: 'succeeded'
      }
    })

    // Calculate stats
    const totalBookings = bookings.length
    const paidDeposits = bookings.filter(b => b.depositStatus === 'PAID').length
    const pendingDeposits = bookings.filter(b => b.depositStatus === 'PENDING').length
    const cancelledBookings = bookings.filter(b => b.depositStatus === 'CANCELLED').length

    const fullyPaidBookings = bookings.filter(
      b => b.depositStatus === 'PAID' && b.remainingStatus === 'PAID'
    ).length

    const totalParticipants = bookings
      .filter(b => b.depositStatus === 'PAID')
      .reduce((sum, b) => sum + b.participantsCount, 0)

    // Revenue calculations
    const depositRevenue = bookings
      .filter(b => b.depositStatus === 'PAID')
      .reduce((sum, b) => sum + b.depositAmount, 0)

    const remainingRevenue = bookings
      .filter(b => b.remainingStatus === 'PAID')
      .reduce((sum, b) => sum + b.remainingAmount, 0)

    const pendingRemaining = bookings
      .filter(b => b.depositStatus === 'PAID' && b.remainingStatus === 'PENDING')
      .reduce((sum, b) => sum + b.remainingAmount, 0)

    const totalRevenue = depositRevenue + remainingRevenue

    // Upcoming trips stats
    const upcomingTrips = tripDates.map(td => ({
      id: td.id,
      date: td.date,
      tripName: td.trip?.name || 'טיול',
      capacity: td.capacity,
      reservedSpots: td.reservedSpots,
      availableSpots: td.capacity - td.reservedSpots,
      status: td.status,
      bookingsCount: td.bookings.length,
      occupancyRate: td.capacity > 0 ? Math.round((td.reservedSpots / td.capacity) * 100) : 0
    }))

    // Recent bookings (last 10)
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(b => ({
        id: b.id,
        fullName: b.fullName,
        email: b.email,
        participantsCount: b.participantsCount,
        depositStatus: b.depositStatus,
        remainingStatus: b.remainingStatus,
        tripDate: b.tripDate?.date,
        tripName: b.tripDate?.trip?.name,
        createdAt: b.createdAt
      }))

    // Payment status distribution
    const paymentDistribution = {
      fullyPaid: fullyPaidBookings,
      depositOnly: paidDeposits - fullyPaidBookings,
      pending: pendingDeposits,
      cancelled: cancelledBookings
    }

    // Monthly revenue (last 6 months)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const monthlyRevenue: { month: string; revenue: number; bookings: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const monthBookings = bookings.filter(b => {
        const createdAt = new Date(b.createdAt)
        return createdAt >= monthStart && createdAt <= monthEnd && b.depositStatus === 'PAID'
      })

      const revenue = monthBookings.reduce((sum, b) =>
        sum + b.depositAmount + (b.remainingStatus === 'PAID' ? b.remainingAmount : 0), 0
      )

      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' }),
        revenue,
        bookings: monthBookings.length
      })
    }

    return NextResponse.json({
      stats: {
        totalBookings,
        paidDeposits,
        pendingDeposits,
        cancelledBookings,
        fullyPaidBookings,
        totalParticipants,
        usersCount
      },
      revenue: {
        depositRevenue,
        remainingRevenue,
        pendingRemaining,
        totalRevenue,
        projectedTotal: totalRevenue + pendingRemaining
      },
      upcomingTrips,
      recentBookings,
      paymentDistribution,
      monthlyRevenue
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת נתוני דשבורד' },
      { status: 500 }
    )
  }
}
