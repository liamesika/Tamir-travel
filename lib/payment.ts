import { getStripe } from './stripe'
import { prisma } from './prisma'

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

      return { status: 'DEPOSIT_PAID' }
    } else if (event.type === 'checkout.session.expired') {
      const session = event.data.object
      const bookingId = session.metadata.bookingId
      const paymentType = session.metadata.paymentType || 'deposit'

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
