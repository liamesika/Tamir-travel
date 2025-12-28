import { NextRequest, NextResponse } from 'next/server'
import {
  generateBookingConfirmationMessage,
  generatePaymentConfirmationMessage,
  generateRemainingBalanceMessage,
  generateTripReminderMessage,
  generateTripDetailsMessage,
} from '@/lib/whatsapp-templates'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type')

  const sampleBookingData = {
    fullName: 'ישראל ישראלי',
    phone: '050-1234567',
    tripDate: '15 בינואר 2025',
    participantsCount: 2,
    depositAmount: 600,
    remainingAmount: 400,
    bookingId: 'BOOK-12345',
  }

  const samplePaymentData = {
    fullName: 'ישראל ישראלי',
    phone: '050-1234567',
    tripDate: '15 בינואר 2025',
    amountPaid: 600,
    paymentType: 'deposit' as const,
  }

  const sampleRemainingData = {
    fullName: 'ישראל ישראלי',
    phone: '050-1234567',
    tripDate: '15 בינואר 2025',
    remainingAmount: 400,
    remainingDueDate: '10 בינואר 2025',
    paymentLink: 'https://tamir-trip.com/payment/remaining/BOOK-12345',
  }

  const sampleReminderData = {
    fullName: 'ישראל ישראלי',
    phone: '050-1234567',
    tripDate: '15 בינואר 2025',
    daysUntilTrip: 7,
  }

  const sampleDetailsData = {
    fullName: 'ישראל ישראלי',
    phone: '050-1234567',
    tripDate: '15 בינואר 2025',
    meetingPoint: 'חניון הכניסה לגן לאומי עין גדי',
    meetingTime: '08:00',
    equipmentList: [
      'נעלי הליכה נוחות',
      'כובע והגנת שמש',
      '2 ליטר מים לאדם',
      'אוכל קל וחטיפים',
      'בגד ים (לעונות החמות)',
      'מצלמה (רצוי)',
    ],
  }

  let message: string

  switch (type) {
    case 'booking':
      message = generateBookingConfirmationMessage(sampleBookingData)
      break
    case 'payment-deposit':
      message = generatePaymentConfirmationMessage(samplePaymentData)
      break
    case 'payment-remaining':
      message = generatePaymentConfirmationMessage({
        ...samplePaymentData,
        paymentType: 'remaining',
        amountPaid: 400,
      })
      break
    case 'remaining':
      message = generateRemainingBalanceMessage(sampleRemainingData)
      break
    case 'reminder':
      message = generateTripReminderMessage(sampleReminderData)
      break
    case 'details':
      message = generateTripDetailsMessage(sampleDetailsData)
      break
    default:
      return NextResponse.json(
        {
          error: 'Invalid type. Use: booking, payment-deposit, payment-remaining, remaining, reminder, or details',
        },
        { status: 400 }
      )
  }

  return NextResponse.json({
    type,
    message,
    formatted_phone: '+972502823333',
  })
}
