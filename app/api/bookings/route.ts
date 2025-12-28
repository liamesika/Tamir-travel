import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentService } from '@/lib/payment'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BookingSchema = z.object({
  tripDateId: z.string(),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  participantsCount: z.number().int().min(1).max(10),
  couponCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = BookingSchema.parse(body)

    const tripDate = await prisma.tripDate.findUnique({
      where: { id: data.tripDateId },
    })

    if (!tripDate) {
      return NextResponse.json(
        { error: 'תאריך טיול לא נמצא' },
        { status: 404 }
      )
    }

    const availableSpots = tripDate.capacity - tripDate.reservedSpots

    if (availableSpots < data.participantsCount) {
      return NextResponse.json(
        { error: `אין מספיק מקומות פנויים. נותרו ${availableSpots} מקומות בלבד` },
        { status: 400 }
      )
    }

    // Validate and apply coupon if provided
    let coupon = null
    let discountAmount = 0
    let couponId = null

    if (data.couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() }
      })

      if (coupon) {
        // Validate coupon is still valid
        const isValid = coupon.isActive &&
          (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) &&
          (!coupon.maxRedemptions || coupon.redemptionCount < coupon.maxRedemptions) &&
          (!coupon.minParticipants || data.participantsCount >= coupon.minParticipants)

        if (isValid) {
          couponId = coupon.id
        } else {
          coupon = null // Invalid coupon, don't apply
        }
      }
    }

    const baseDepositAmount = data.participantsCount * 300 * 100
    if (coupon) {
      discountAmount = Math.round(baseDepositAmount * coupon.percentOff / 100)

      // HARD VALIDATION: Ensure discount cannot exceed deposit amount (no negative payments)
      if (discountAmount > baseDepositAmount) {
        discountAmount = baseDepositAmount
      }

      // Log coupon usage attempt for audit trail
      console.log(`[COUPON] Applying coupon ${coupon.code} (${coupon.percentOff}%) to booking. Discount: ${discountAmount / 100} ILS`)
    }

    // Calculate final amounts with validation
    const depositAmount = Math.max(0, baseDepositAmount - discountAmount) // Ensure never negative
    const totalPrice = data.participantsCount * tripDate.pricePerPerson * 100
    const remainingAmount = Math.max(0, totalPrice - depositAmount) // Ensure never negative

    // NOTE: No coupon stacking - schema only allows single couponCode per booking
    // This is enforced by the data model (single couponId and couponCode fields)

    const booking = await prisma.booking.create({
      data: {
        tripDateId: data.tripDateId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        participantsCount: data.participantsCount,
        totalPrice,
        depositAmount,
        remainingAmount,
        depositStatus: 'PENDING',
        couponId,
        couponCode: coupon?.code || null,
        discountAmount: discountAmount > 0 ? discountAmount : null,
      },
    })

    // Increment coupon redemption count if used and log the usage
    if (couponId && coupon) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { redemptionCount: { increment: 1 } }
      })

      // Log successful coupon usage for audit
      console.log(`[COUPON] Successfully applied coupon ${coupon.code} to booking ${booking.id}. Email: ${data.email}, Participants: ${data.participantsCount}, Discount: ${discountAmount / 100} ILS`)
    }

    const payment = await PaymentService.createDepositPayment({
      bookingId: booking.id,
      amount: depositAmount,
      customerEmail: data.email,
      customerName: data.fullName,
    })

    return NextResponse.json({
      bookingId: booking.id,
      paymentUrl: payment.url,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת ההזמנה' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        tripDate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת ההזמנות' },
      { status: 500 }
    )
  }
}
