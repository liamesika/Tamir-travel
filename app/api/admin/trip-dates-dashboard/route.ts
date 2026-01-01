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
    // Get all trip dates with bookings
    const tripDates = await prisma.tripDate.findMany({
      include: {
        bookings: {
          select: {
            id: true,
            participantsCount: true,
            depositStatus: true,
            remainingStatus: true,
            depositAmount: true,
            remainingAmount: true,
            totalPrice: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Calculate stats for each trip date
    const tripDatesWithStats = tripDates.map(td => {
      const participants = td.bookings
        .filter(b => b.depositStatus === 'PAID')
        .reduce((sum, b) => sum + b.participantsCount, 0)

      const paidDeposits = td.bookings.filter(b => b.depositStatus === 'PAID').length
      const paidRemaining = td.bookings.filter(b => b.remainingStatus === 'PAID').length
      const bookingsCount = td.bookings.length

      const revenue = td.bookings.reduce((sum, b) => {
        let amount = 0
        if (b.depositStatus === 'PAID') amount += b.depositAmount
        if (b.remainingStatus === 'PAID') amount += b.remainingAmount
        return sum + amount
      }, 0)

      return {
        id: td.id,
        date: td.date.toISOString(),
        pricePerPerson: td.pricePerPerson,
        depositAmount: td.depositAmount,
        capacity: td.capacity,
        minParticipants: td.minParticipants,
        minReachedAt: td.minReachedAt?.toISOString() || null,
        status: td.status,
        participants,
        paidDeposits,
        paidRemaining,
        bookingsCount,
        revenue
      }
    })

    // Calculate overall stats
    const now = new Date()
    const totalParticipants = tripDatesWithStats.reduce((sum, td) => sum + td.participants, 0)
    const totalRevenue = tripDatesWithStats.reduce((sum, td) => sum + td.revenue, 0)

    // Calculate pending payments (deposits + remaining that are pending)
    const allBookings = await prisma.booking.findMany({
      select: {
        depositStatus: true,
        depositAmount: true,
        remainingStatus: true,
        remainingAmount: true,
        couponCode: true,
        discountAmount: true
      }
    })

    const pendingPayments = allBookings.reduce((sum, b) => {
      let pending = 0
      if (b.depositStatus === 'PENDING') pending += b.depositAmount
      if (b.depositStatus === 'PAID' && b.remainingStatus === 'PENDING') pending += b.remainingAmount
      return sum + pending
    }, 0)

    const upcomingDates = tripDates.filter(td => new Date(td.date) >= now && td.status !== 'CANCELLED').length

    // Calculate coupon analytics
    const couponBookings = allBookings.filter(b => b.couponCode && b.discountAmount)
    const totalCouponBookings = couponBookings.length
    const totalDiscountAmount = couponBookings.reduce((sum, b) => sum + (b.discountAmount || 0), 0)

    // Get top used coupon
    const couponUsage: { [code: string]: number } = {}
    couponBookings.forEach(b => {
      if (b.couponCode) {
        couponUsage[b.couponCode] = (couponUsage[b.couponCode] || 0) + 1
      }
    })
    const topCoupon = Object.entries(couponUsage).sort((a, b) => b[1] - a[1])[0] || null

    return NextResponse.json({
      tripDates: tripDatesWithStats,
      stats: {
        totalParticipants,
        totalRevenue,
        pendingPayments,
        upcomingDates,
        couponStats: {
          totalCouponBookings,
          totalDiscountAmount,
          topCoupon: topCoupon ? { code: topCoupon[0], count: topCoupon[1] } : null
        }
      }
    })
  } catch (error) {
    console.error('Error fetching trip dates dashboard:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת נתונים' },
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
    const { date, pricePerPerson } = await request.json()

    if (!date || !pricePerPerson) {
      return NextResponse.json(
        { error: 'נא למלא את כל השדות' },
        { status: 400 }
      )
    }

    // Get or create the default trip
    let trip = await prisma.trip.findFirst({
      where: { isActive: true }
    })

    if (!trip) {
      // Create default trip if none exists
      trip = await prisma.trip.create({
        data: {
          name: 'לונדון שלא הכרתם',
          slug: 'london-nature',
          heroTitle: 'מחוץ ללונדון',
          heroSubtitle: 'טיול טבע ומורשת ייחודי באנגליה',
          guideTitle: 'תמיר',
          guideContent: 'מדריך טיולים מנוסה',
          includedItems: '[]',
          notIncludedItems: '[]',
          itinerarySteps: '[]',
          faqItems: '[]',
          isActive: true
        }
      })
    }

    const tripDate = await prisma.tripDate.create({
      data: {
        tripId: trip.id,
        date: new Date(date),
        pricePerPerson: parseInt(pricePerPerson),
        capacity: 30,
        minParticipants: 15,
        depositAmount: 30000, // 300 ILS in agorot
        status: 'OPEN'
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
