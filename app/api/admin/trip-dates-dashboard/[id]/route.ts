import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { getStripe } from '@/lib/stripe'
import { EmailService } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPPORT_EMAIL = 'tamirtours.uk@gmail.com'
const SUPPORT_PHONE = '+972502823333'

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

    // Check if TripDate exists with all bookings and payments
    const tripDate = await prisma.tripDate.findUnique({
      where: { id },
      include: {
        trip: true,
        bookings: {
          include: {
            payments: true
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

    // Already cancelled - idempotent check
    if (tripDate.cancelledAt) {
      return NextResponse.json(
        { error: 'תאריך זה כבר בוטל', code: 'ALREADY_CANCELLED' },
        { status: 400 }
      )
    }

    const tripName = tripDate.trip?.name || 'טיול קוטסוולדס'
    const tripDateFormatted = new Date(tripDate.date).toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // Get active bookings (non-cancelled)
    const activeBookings = tripDate.bookings.filter(b => !b.cancelledAt)

    // Results tracking
    const results = {
      totalBookings: activeBookings.length,
      refundsProcessed: 0,
      refundsFailed: 0,
      emailsSent: 0,
      emailsFailed: 0,
      totalRefundAmount: 0,
      whatsappLinks: [] as { bookingId: string; fullName: string; phone: string; link: string }[]
    }

    // Process each active booking
    for (const booking of activeBookings) {
      try {
        // Skip if already cancelled (idempotent)
        if (booking.cancelledAt) {
          continue
        }

        // Calculate total paid amount for refund
        const successfulPayments = booking.payments.filter(
          p => p.status === 'succeeded' && p.type !== 'refund'
        )

        // Skip if no payments to refund
        let totalPaidAmount = 0
        for (const payment of successfulPayments) {
          totalPaidAmount += payment.amount
        }

        // Process Stripe refunds for each payment
        if (totalPaidAmount > 0 && process.env.STRIPE_SECRET_KEY) {
          const stripe = getStripe()

          for (const payment of successfulPayments) {
            // Skip if already refunded (idempotent)
            const existingRefund = await prisma.payment.findFirst({
              where: {
                bookingId: booking.id,
                type: 'refund',
                stripePaymentIntentId: payment.stripePaymentIntentId,
                status: 'succeeded'
              }
            })

            if (existingRefund) {
              console.log(`Refund already exists for payment ${payment.id}, skipping`)
              continue
            }

            try {
              // Create Stripe refund
              if (payment.stripePaymentIntentId) {
                const refund = await stripe.refunds.create({
                  payment_intent: payment.stripePaymentIntentId,
                  reason: 'requested_by_customer',
                  metadata: {
                    bookingId: booking.id,
                    tripDateId: tripDate.id,
                    reason: 'Trip date cancelled by organizer'
                  }
                })

                // Create refund payment record
                await prisma.payment.create({
                  data: {
                    bookingId: booking.id,
                    provider: 'stripe',
                    type: 'refund',
                    amount: payment.amount,
                    currency: 'ILS',
                    stripePaymentIntentId: payment.stripePaymentIntentId,
                    stripeRefundId: refund.id,
                    status: 'succeeded',
                    metadata: JSON.stringify({
                      originalPaymentId: payment.id,
                      reason: 'Trip date cancelled by organizer',
                      refundedAt: new Date().toISOString()
                    })
                  }
                })

                results.totalRefundAmount += payment.amount
                results.refundsProcessed++
              }
            } catch (stripeError) {
              console.error(`Stripe refund failed for payment ${payment.id}:`, stripeError)
              results.refundsFailed++
            }
          }
        }

        // Update booking status
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            cancelledAt: new Date(),
            cancelReason: 'Trip date cancelled by organizer',
            depositStatus: totalPaidAmount > 0 ? 'REFUNDED' : 'CANCELLED',
            remainingStatus: booking.remainingStatus === 'PAID' ? 'REFUNDED' : 'CANCELLED',
            refundedAt: totalPaidAmount > 0 ? new Date() : null,
            refundAmount: totalPaidAmount > 0 ? totalPaidAmount : null
          }
        })

        // Send cancellation email (only if not already sent - check emailLastType)
        if (booking.emailLastType !== 'cancellation') {
          try {
            const emailResult = await EmailService.sendTripCancellation({
              fullName: booking.fullName,
              email: booking.email,
              tripName,
              tripDate: tripDateFormatted,
              refundAmount: totalPaidAmount,
              bookingId: booking.id,
              supportEmail: SUPPORT_EMAIL,
              supportPhone: SUPPORT_PHONE
            })

            if (emailResult.success) {
              await prisma.booking.update({
                where: { id: booking.id },
                data: {
                  emailSentAt: new Date(),
                  emailLastType: 'cancellation',
                  emailMessageId: emailResult.messageId
                }
              })
              results.emailsSent++
            } else {
              results.emailsFailed++
            }
          } catch (emailError) {
            console.error(`Email failed for booking ${booking.id}:`, emailError)
            results.emailsFailed++
          }
        }

        // Generate WhatsApp link for admin follow-up
        const phone = booking.phone.replace(/\D/g, '')
        const whatsappMessage = encodeURIComponent(
          `שלום ${booking.fullName}, זה צוות תמיר טריפ. הטיול בתאריך ${tripDateFormatted} בוטל והחזר כספי מלא בוצע לחשבונך. אנחנו מצטערים על אי הנוחות ומקווים לראותך בטיול אחר!`
        )
        results.whatsappLinks.push({
          bookingId: booking.id,
          fullName: booking.fullName,
          phone: booking.phone,
          link: `https://wa.me/${phone}?text=${whatsappMessage}`
        })

      } catch (bookingError) {
        console.error(`Error processing booking ${booking.id}:`, bookingError)
      }
    }

    // Update TripDate: soft-delete and reset reservedSpots
    const updatedTripDate = await prisma.tripDate.update({
      where: { id },
      data: {
        cancelledAt: new Date(),
        status: 'CANCELLED',
        reservedSpots: 0 // Reset capacity since all bookings are cancelled
      }
    })

    return NextResponse.json({
      success: true,
      tripDate: updatedTripDate,
      message: 'תאריך הטיול בוטל בהצלחה',
      results: {
        ...results,
        totalRefundAmountFormatted: `₪${(results.totalRefundAmount / 100).toLocaleString('he-IL')}`
      }
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
