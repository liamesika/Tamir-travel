import { NextRequest, NextResponse } from 'next/server'
import {
  generateBookingConfirmationEmail,
  generatePaymentConfirmationEmail,
  generateRemainingBalanceRequestEmail,
} from '@/lib/email-templates'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')

  const sampleBookingData = {
    fullName: 'ישראל ישראלי',
    email: 'israel@example.com',
    phone: '050-1234567',
    tripDate: '15 בינואר 2025',
    participantsCount: 2,
    depositAmount: 600,
    remainingAmount: 400,
    remainingDueDate: '10 בינואר 2025',
    bookingId: 'BOOK-12345',
  }

  const samplePaymentData = {
    fullName: 'ישראל ישראלי',
    email: 'israel@example.com',
    tripDate: '15 בינואר 2025',
    amountPaid: 600,
    paymentType: 'deposit' as const,
    bookingId: 'BOOK-12345',
  }

  const sampleRemainingData = {
    fullName: 'ישראל ישראלי',
    email: 'israel@example.com',
    tripDate: '15 בינואר 2025',
    remainingAmount: 400,
    remainingDueDate: '10 בינואר 2025',
    paymentLink: 'https://tamir-trip.com/payment/remaining/BOOK-12345',
    bookingId: 'BOOK-12345',
  }

  let html: string

  switch (type) {
    case 'booking':
      html = generateBookingConfirmationEmail(sampleBookingData)
      break
    case 'payment-deposit':
      html = generatePaymentConfirmationEmail(samplePaymentData)
      break
    case 'payment-remaining':
      html = generatePaymentConfirmationEmail({
        ...samplePaymentData,
        paymentType: 'remaining',
        amountPaid: 400,
      })
      break
    case 'remaining':
      html = generateRemainingBalanceRequestEmail(sampleRemainingData)
      break
    default:
      return NextResponse.json(
        {
          error: 'Invalid type. Use: booking, payment-deposit, payment-remaining, or remaining',
        },
        { status: 400 }
      )
  }

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
