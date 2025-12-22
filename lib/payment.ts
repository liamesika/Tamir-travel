import { getStripe } from './stripe'
import { prisma } from './prisma'
import { EmailService } from './email'

export interface CreateDepositPaymentParams {
  bookingId: string
  amount: number
  customerEmail: string
  customerName: string
}

export interface CreateRemainingPaymentParams {
  bookingId: string
  amount: number
  customerEmail: string
  customerName: string
}

export class PaymentService {
  static async createDepositPayment({
    bookingId,
    amount,
    customerEmail,
    customerName,
  }: CreateDepositPaymentParams) {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ils',
            product_data: {
              name: 'מקדמה לטיול',
              description: `מקדמה לטיול - ${customerName}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?bookingId=${bookingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancelled?bookingId=${bookingId}`,
      customer_email: customerEmail,
      metadata: {
        bookingId,
      },
    })

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentIntentId: session.id,
      },
    })

    return {
      url: session.url,
      sessionId: session.id,
    }
  }

  static async createRemainingPayment({
    bookingId,
    amount,
    customerEmail,
    customerName,
  }: CreateRemainingPaymentParams) {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ils',
            product_data: {
              name: 'יתרת תשלום לטיול',
              description: `יתרת תשלום לטיול - ${customerName}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?bookingId=${bookingId}&type=remaining`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancelled?bookingId=${bookingId}`,
      customer_email: customerEmail,
      metadata: {
        bookingId,
        paymentType: 'remaining',
      },
    })

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        remainingPaymentIntentId: session.id,
      },
    })

    return {
      url: session.url,
      sessionId: session.id,
    }
  }

  /**
   * Check and send alerts for min/max participants reached
   * Uses atomic updates to ensure alerts are sent only once
   */
  private static async checkAndSendAlerts(tripDateId: string) {
    // Get fresh trip date data with stats
    const tripDate = await prisma.tripDate.findUnique({
      where: { id: tripDateId },
      include: {
        bookings: {
          where: {
            depositStatus: 'PAID'
          }
        }
      }
    })

    if (!tripDate) {
      console.error('Trip date not found for alerts:', tripDateId)
      return
    }

    // Calculate confirmed participant count (sum of participantsCount from paid bookings)
    const confirmedParticipants = tripDate.bookings.reduce(
      (sum, b) => sum + b.participantsCount,
      0
    )

    const paidDeposits = tripDate.bookings.length
    const totalBookings = await prisma.booking.count({
      where: { tripDateId, depositStatus: { not: 'CANCELLED' } }
    })

    const alertData = {
      tripDateId: tripDate.id,
      tripDate: tripDate.date.toISOString(),
      currentCount: confirmedParticipants,
      capacity: tripDate.capacity,
      minParticipants: tripDate.minParticipants,
      paidDeposits,
      totalBookings
    }

    // Check MIN reached (atomic update to prevent duplicate alerts)
    if (confirmedParticipants >= tripDate.minParticipants && !tripDate.minReachedAt) {
      const minUpdate = await prisma.tripDate.updateMany({
        where: {
          id: tripDateId,
          minReachedAt: null  // Only update if not already set
        },
        data: {
          minReachedAt: new Date()
        }
      })

      // Only send email if we were the one to set minReachedAt (race condition safety)
      if (minUpdate.count === 1) {
        console.log(`✅ MIN REACHED: Trip ${tripDateId} - ${confirmedParticipants}/${tripDate.minParticipants}`)
        try {
          await EmailService.sendMinReachedAlert(alertData)
        } catch (err) {
          console.error('Failed to send min reached alert:', err)
        }
      }
    }

    // Check MAX reached / SOLD OUT (atomic update to prevent duplicate alerts)
    if (confirmedParticipants >= tripDate.capacity && !tripDate.maxReachedAt) {
      const maxUpdate = await prisma.tripDate.updateMany({
        where: {
          id: tripDateId,
          maxReachedAt: null  // Only update if not already set
        },
        data: {
          maxReachedAt: new Date(),
          status: 'SOLD_OUT'
        }
      })

      // Only send email if we were the one to set maxReachedAt (race condition safety)
      if (maxUpdate.count === 1) {
        console.log(`🎉 SOLD OUT: Trip ${tripDateId} - ${confirmedParticipants}/${tripDate.capacity}`)
        try {
          await EmailService.sendSoldOutAlert(alertData)
        } catch (err) {
          console.error('Failed to send sold out alert:', err)
        }
      }
    }
  }

  static async handleWebhook(payload: string, signature: string) {
    const stripe = getStripe()
    let event: any

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const bookingId = session.metadata.bookingId
      const paymentType = session.metadata.paymentType || 'deposit'

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { tripDate: true },
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      // Create Payment record for successful payment
      const paymentAmount = session.amount_total || (paymentType === 'remaining' ? booking.remainingAmount : booking.depositAmount)

      await prisma.payment.create({
        data: {
          bookingId,
          provider: 'stripe',
          type: paymentType,
          amount: paymentAmount,
          currency: 'ILS',
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          status: 'succeeded',
          metadata: JSON.stringify({
            customerEmail: session.customer_email,
            paymentMethod: session.payment_method_types?.[0] || 'card',
          }),
        },
      })

      if (paymentType === 'remaining') {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            remainingStatus: 'PAID',
            remainingPaidAt: new Date(),
          },
        })

        return { status: 'REMAINING_PAID' }
      }

      const tripDate = await prisma.tripDate.findUnique({
        where: { id: booking.tripDateId },
      })

      if (!tripDate) {
        throw new Error('Trip date not found')
      }

      const availableSpots = tripDate.capacity - tripDate.reservedSpots

      if (availableSpots < booking.participantsCount) {
        // Update payment status to refunded since we'll need to refund
        await prisma.payment.updateMany({
          where: {
            bookingId,
            stripeSessionId: session.id,
          },
          data: {
            status: 'refunded',
            metadata: JSON.stringify({
              reason: 'CAPACITY_EXCEEDED',
              refundedAt: new Date().toISOString(),
            }),
          },
        })

        await prisma.booking.update({
          where: { id: bookingId },
          data: { depositStatus: 'CANCELLED' },
        })
        console.error(`Booking ${bookingId} cancelled due to insufficient capacity`)
        return { status: 'CANCELLED', reason: 'CAPACITY_EXCEEDED' }
      }

      await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: { depositStatus: 'PAID' },
        }),
        prisma.tripDate.update({
          where: { id: booking.tripDateId },
          data: {
            reservedSpots: {
              increment: booking.participantsCount,
            },
          },
        }),
      ])

      // After successful deposit payment, check for min/max alerts
      // Run asynchronously to not block the webhook response
      this.checkAndSendAlerts(booking.tripDateId).catch(err => {
        console.error('Error checking alerts:', err)
      })

      return { status: 'DEPOSIT_PAID' }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object
      const bookingId = session.metadata.bookingId
      const paymentType = session.metadata.paymentType || 'deposit'

      // Create failed payment record
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      })

      if (booking) {
        await prisma.payment.create({
          data: {
            bookingId,
            provider: 'stripe',
            type: paymentType,
            amount: paymentType === 'remaining' ? booking.remainingAmount : booking.depositAmount,
            currency: 'ILS',
            stripeSessionId: session.id,
            status: 'failed',
            metadata: JSON.stringify({
              reason: 'SESSION_EXPIRED',
              expiredAt: new Date().toISOString(),
            }),
          },
        })
      }

      if (paymentType === 'remaining') {
        return { status: 'REMAINING_EXPIRED' }
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: { depositStatus: 'CANCELLED' },
      })

      return { status: 'CANCELLED', reason: 'SESSION_EXPIRED' }
    }

    return { status: 'UNHANDLED_EVENT' }
  }
}
