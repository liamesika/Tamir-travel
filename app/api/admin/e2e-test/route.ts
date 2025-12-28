import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { PaymentService } from '@/lib/payment'
import { EmailService } from '@/lib/email'
import { randomBytes } from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// E2E Test creates a test booking flow to verify the complete system
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  const testResults: {
    step: string
    status: 'success' | 'failed' | 'skipped'
    message: string
    data?: any
  }[] = []

  let testBookingId: string | null = null
  let testPaymentUrl: string | null = null

  try {
    // Generate test email with unique identifier
    const testId = randomBytes(4).toString('hex')
    const testEmail = `test-${testId}@e2e.test`
    const testPhone = '050-TEST-' + testId.slice(0, 4)

    // STEP 1: Find an available trip date
    const tripDate = await prisma.tripDate.findFirst({
      where: {
        status: 'OPEN',
        cancelledAt: null,
        date: { gte: new Date() }
      },
      include: { trip: true }
    })

    if (!tripDate) {
      testResults.push({
        step: 'Find Trip Date',
        status: 'failed',
        message: 'No available trip dates found. Create a trip date first.'
      })
      return NextResponse.json({ success: false, results: testResults })
    }

    testResults.push({
      step: 'Find Trip Date',
      status: 'success',
      message: `Found trip date: ${new Date(tripDate.date).toLocaleDateString('he-IL')}`,
      data: { tripDateId: tripDate.id, date: tripDate.date }
    })

    // STEP 2: Create test booking
    const testBooking = await prisma.booking.create({
      data: {
        tripDateId: tripDate.id,
        fullName: `E2E Test User ${testId}`,
        email: testEmail,
        phone: testPhone,
        participantsCount: 1,
        totalPrice: tripDate.pricePerPerson * 100,
        depositAmount: 30000, // 300 ILS
        remainingAmount: (tripDate.pricePerPerson - 300) * 100,
        depositStatus: 'PENDING',
        adminNotes: `[E2E TEST] Created at ${new Date().toISOString()}`
      }
    })

    testBookingId = testBooking.id

    testResults.push({
      step: 'Create Test Booking',
      status: 'success',
      message: `Created test booking: ${testBooking.id}`,
      data: { bookingId: testBooking.id, email: testEmail }
    })

    // STEP 3: Create Stripe payment session
    try {
      const payment = await PaymentService.createDepositPayment({
        bookingId: testBooking.id,
        amount: testBooking.depositAmount,
        customerEmail: testEmail,
        customerName: testBooking.fullName
      })

      testPaymentUrl = payment.url

      testResults.push({
        step: 'Create Stripe Session',
        status: 'success',
        message: 'Stripe checkout session created',
        data: { paymentUrl: payment.url }
      })
    } catch (stripeError) {
      testResults.push({
        step: 'Create Stripe Session',
        status: 'failed',
        message: `Stripe error: ${stripeError instanceof Error ? stripeError.message : 'Unknown error'}`
      })
    }

    // STEP 4: Test email sending (if configured)
    if (process.env.RESEND_API_KEY) {
      try {
        // Use admin's email or a test recipient
        const adminEmail = process.env.ADMIN_EMAIL || 'test@example.com'

        const emailResult = await EmailService.sendBookingConfirmation({
          fullName: testBooking.fullName,
          email: adminEmail, // Send to admin for testing
          phone: testPhone,
          tripDate: new Date(tripDate.date).toLocaleDateString('he-IL'),
          participantsCount: 1,
          depositAmount: 300,
          remainingAmount: (tripDate.pricePerPerson - 300),
          remainingDueDate: new Date(tripDate.date).toLocaleDateString('he-IL'),
          bookingId: testBooking.id
        })

        if (emailResult.success) {
          testResults.push({
            step: 'Send Test Email',
            status: 'success',
            message: `Test email sent to ${adminEmail}`,
            data: { messageId: emailResult.messageId }
          })
        } else {
          testResults.push({
            step: 'Send Test Email',
            status: 'failed',
            message: emailResult.error || 'Email sending failed'
          })
        }
      } catch (emailError) {
        testResults.push({
          step: 'Send Test Email',
          status: 'failed',
          message: `Email error: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`
        })
      }
    } else {
      testResults.push({
        step: 'Send Test Email',
        status: 'skipped',
        message: 'Email service not configured (RESEND_API_KEY missing)'
      })
    }

    // STEP 5: Verify Prisma database operations
    const verifyBooking = await prisma.booking.findUnique({
      where: { id: testBooking.id },
      include: { tripDate: true }
    })

    if (verifyBooking) {
      testResults.push({
        step: 'Verify Database',
        status: 'success',
        message: 'Booking verified in database'
      })
    } else {
      testResults.push({
        step: 'Verify Database',
        status: 'failed',
        message: 'Booking not found in database'
      })
    }

    // All steps completed
    const allSuccessful = testResults.every(r => r.status === 'success' || r.status === 'skipped')

    return NextResponse.json({
      success: allSuccessful,
      testBookingId,
      testPaymentUrl,
      results: testResults,
      cleanup: `To clean up, delete booking: ${testBookingId}`
    })

  } catch (error) {
    console.error('[E2E TEST] Error:', error)

    testResults.push({
      step: 'System Error',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    })

    // Try to clean up test booking if created
    if (testBookingId) {
      try {
        await prisma.booking.delete({ where: { id: testBookingId } })
        testResults.push({
          step: 'Cleanup',
          status: 'success',
          message: 'Test booking cleaned up after error'
        })
      } catch {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json({
      success: false,
      results: testResults
    })
  }
}

// DELETE endpoint to clean up test bookings
export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    // Delete all E2E test bookings
    const deleted = await prisma.booking.deleteMany({
      where: {
        OR: [
          { email: { contains: '@e2e.test' } },
          { adminNotes: { contains: '[E2E TEST]' } }
        ]
      }
    })

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} test booking(s)`
    })
  } catch (error) {
    console.error('[E2E TEST] Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to clean up test bookings' },
      { status: 500 }
    )
  }
}
