import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { EMAIL_CONFIG } from '@/lib/email-config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SanityCheckResult {
  status: 'ok' | 'warning' | 'error'
  message: string
  details?: Record<string, unknown>
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  const checks: Record<string, SanityCheckResult> = {}

  // 1. Database URL
  checks.database = {
    status: process.env.DATABASE_URL ? 'ok' : 'error',
    message: process.env.DATABASE_URL ? 'Database URL configured' : 'DATABASE_URL not set',
  }

  // 2. App URL
  checks.appUrl = {
    status: process.env.NEXT_PUBLIC_APP_URL ? 'ok' : 'warning',
    message: process.env.NEXT_PUBLIC_APP_URL
      ? `App URL: ${process.env.NEXT_PUBLIC_APP_URL}`
      : 'NEXT_PUBLIC_APP_URL not set',
  }

  // 3. Stripe - detailed check for each key
  const stripeSecretKey = !!process.env.STRIPE_SECRET_KEY
  const stripeWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET
  const stripePublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const stripeAllConfigured = stripeSecretKey && stripeWebhookSecret && stripePublishableKey

  const missingStripeKeys: string[] = []
  if (!stripeSecretKey) missingStripeKeys.push('STRIPE_SECRET_KEY')
  if (!stripeWebhookSecret) missingStripeKeys.push('STRIPE_WEBHOOK_SECRET')
  if (!stripePublishableKey) missingStripeKeys.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')

  checks.stripe = {
    status: stripeAllConfigured ? 'ok' : 'error',
    message: stripeAllConfigured
      ? 'All Stripe keys configured'
      : `Missing Stripe keys: ${missingStripeKeys.join(', ')}`,
    details: {
      STRIPE_SECRET_KEY: stripeSecretKey,
      STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: stripePublishableKey,
      missingKeys: missingStripeKeys,
    },
  }

  // 4. Email configuration - use centralized config
  const resendConfigured = EMAIL_CONFIG.isResendConfigured()
  const fromEmail = EMAIL_CONFIG.getFromEmail()
  const adminEmail = EMAIL_CONFIG.getAdminEmail()

  checks.email = {
    status: resendConfigured ? 'ok' : 'warning',
    message: resendConfigured
      ? 'Resend email configured'
      : 'Resend not configured - emails will be previewed only',
    details: {
      resendApiKeySet: !!process.env.RESEND_API_KEY,
      resendConfigured,
      fromEmail,
      adminEmail: adminEmail || 'Not set (ALERT_EMAIL_TO)',
      supportEmail: EMAIL_CONFIG.SUPPORT_EMAIL,
      envVars: {
        EMAIL_FROM: process.env.EMAIL_FROM || 'not set',
        ALERT_EMAIL_FROM: process.env.ALERT_EMAIL_FROM || 'not set',
        ALERT_EMAIL_TO: process.env.ALERT_EMAIL_TO || 'not set',
      }
    },
  }

  // 5. Active trips
  try {
    const activeTrips = await prisma.trip.count({ where: { isActive: true } })
    const totalTrips = await prisma.trip.count()

    checks.trips = {
      status: activeTrips > 0 ? 'ok' : totalTrips > 0 ? 'warning' : 'error',
      message:
        activeTrips > 0
          ? `${activeTrips} active trip(s) found`
          : totalTrips > 0
          ? `No active trips but ${totalTrips} total trip(s) exist`
          : 'No trips in database',
      details: { activeTrips, totalTrips },
    }
  } catch (error) {
    checks.trips = {
      status: 'error',
      message: 'Failed to query trips',
      details: { error: String(error) },
    }
  }

  // 6. Trip dates - fix timezone issue by using start of today UTC
  try {
    const now = new Date()
    // Set to start of today to avoid timezone issues
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0))

    const allDates = await prisma.tripDate.findMany({
      select: {
        id: true,
        date: true,
        status: true,
      },
      orderBy: { date: 'asc' },
    })

    const upcomingDates = allDates.filter(d => {
      const dateTime = new Date(d.date).getTime()
      const todayTime = todayStart.getTime()
      return dateTime >= todayTime && d.status !== 'CANCELLED'
    })

    const openDates = upcomingDates.filter(d => d.status === 'OPEN')

    checks.tripDates = {
      status: upcomingDates.length > 0 ? 'ok' : 'warning',
      message: upcomingDates.length > 0
        ? `${upcomingDates.length} upcoming date(s), ${openDates.length} open`
        : 'No upcoming trip dates',
      details: {
        totalDates: allDates.length,
        upcomingDates: upcomingDates.length,
        openDates: openDates.length,
        serverTime: now.toISOString(),
        todayStart: todayStart.toISOString(),
        allDatesInfo: allDates.map(d => ({
          id: d.id,
          date: d.date,
          status: d.status,
          isUpcoming: new Date(d.date).getTime() >= todayStart.getTime(),
        })),
      },
    }
  } catch (error) {
    checks.tripDates = {
      status: 'error',
      message: 'Failed to query trip dates',
      details: { error: String(error) },
    }
  }

  // 7. Bookings
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

  // 8. Database connection
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

  const hasErrors = Object.values(checks).some((c) => c.status === 'error')
  const hasWarnings = Object.values(checks).some((c) => c.status === 'warning')

  return new NextResponse(
    JSON.stringify({
      overallStatus: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      checks,
    }, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  )
}
