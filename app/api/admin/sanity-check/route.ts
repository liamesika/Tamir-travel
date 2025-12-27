import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SanityCheckResult {
  status: 'ok' | 'warning' | 'error'
  message: string
  details?: any
}

export async function GET(request: NextRequest) {
  // Require admin authentication
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  const checks: Record<string, SanityCheckResult> = {}

  // 1. Check DATABASE_URL
  checks.database = {
    status: process.env.DATABASE_URL ? 'ok' : 'error',
    message: process.env.DATABASE_URL ? 'Database URL configured' : 'DATABASE_URL not set',
  }

  // 2. Check NEXT_PUBLIC_APP_URL
  checks.appUrl = {
    status: process.env.NEXT_PUBLIC_APP_URL ? 'ok' : 'warning',
    message: process.env.NEXT_PUBLIC_APP_URL
      ? `App URL: ${process.env.NEXT_PUBLIC_APP_URL}`
      : 'NEXT_PUBLIC_APP_URL not set (will use localhost)',
  }

  // 3. Check Stripe keys
  checks.stripe = {
    status: process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET ? 'ok' : 'warning',
    message:
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
        ? 'Stripe keys configured'
        : 'Stripe keys missing - payments will not work',
    details: {
      secretKey: !!process.env.STRIPE_SECRET_KEY,
      webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      publishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
  }

  // 4. Check Resend (email) configuration
  const resendConfigured = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_resend_api_key_here'
  checks.email = {
    status: resendConfigured ? 'ok' : 'warning',
    message: resendConfigured
      ? 'Resend email configured'
      : 'Resend not configured - emails will be previewed only',
    details: {
      apiKey: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_resend_api_key_here',
      fromEmail: process.env.ALERT_EMAIL_FROM || 'Not set',
      adminEmail: process.env.ALERT_EMAIL_TO || 'Not set',
    },
  }

  // 5. Check active trips count
  try {
    const activeTrips = await prisma.trip.count({ where: { isActive: true } })
    const totalTrips = await prisma.trip.count()

    checks.trips = {
      status: activeTrips > 0 ? 'ok' : totalTrips > 0 ? 'warning' : 'error',
      message:
        activeTrips > 0
          ? `${activeTrips} active trip(s) found`
          : totalTrips > 0
          ? `No active trips but ${totalTrips} total trip(s) exist (will show fallback)`
          : 'No trips in database - homepage will show default content',
      details: {
        activeTrips,
        totalTrips,
      },
    }
  } catch (error) {
    checks.trips = {
      status: 'error',
      message: 'Failed to query trips',
      details: { error: String(error) },
    }
  }

  // 6. Check trip dates
  try {
    const upcomingDates = await prisma.tripDate.count({
      where: {
        date: { gte: new Date() },
        status: { not: 'CANCELLED' },
      },
    })

    checks.tripDates = {
      status: upcomingDates > 0 ? 'ok' : 'warning',
      message: upcomingDates > 0 ? `${upcomingDates} upcoming trip date(s)` : 'No upcoming trip dates',
      details: { upcomingDates },
    }
  } catch (error) {
    checks.tripDates = {
      status: 'error',
      message: 'Failed to query trip dates',
      details: { error: String(error) },
    }
  }

  // 7. Check bookings
  try {
    const totalBookings = await prisma.booking.count()
    const paidDeposits = await prisma.booking.count({ where: { depositStatus: 'PAID' } })
    const pendingDeposits = await prisma.booking.count({ where: { depositStatus: 'PENDING' } })

    checks.bookings = {
      status: 'ok',
      message: `${totalBookings} booking(s), ${paidDeposits} paid, ${pendingDeposits} pending`,
      details: { totalBookings, paidDeposits, pendingDeposits },
    }
  } catch (error) {
    checks.bookings = {
      status: 'error',
      message: 'Failed to query bookings',
      details: { error: String(error) },
    }
  }

  // 8. Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.dbConnection = {
      status: 'ok',
      message: 'Database connection successful',
    }
  } catch (error) {
    checks.dbConnection = {
      status: 'error',
      message: 'Database connection failed',
      details: { error: String(error) },
    }
  }

  // Overall status
  const hasErrors = Object.values(checks).some((c) => c.status === 'error')
  const hasWarnings = Object.values(checks).some((c) => c.status === 'warning')

  return NextResponse.json({
    overallStatus: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks,
  })
}
