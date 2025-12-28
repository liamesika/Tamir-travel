import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { code, participantsCount } = await request.json()

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'נא להזין קוד קופון' },
        { status: 400 }
      )
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        error: 'קוד קופון לא תקין'
      })
    }

    // Check if active
    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        error: 'קופון לא פעיל'
      })
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: 'קופון פג תוקף'
      })
    }

    // Check max redemptions
    if (coupon.maxRedemptions && coupon.redemptionCount >= coupon.maxRedemptions) {
      return NextResponse.json({
        valid: false,
        error: 'קופון הגיע למקסימום שימושים'
      })
    }

    // Check min participants
    if (coupon.minParticipants && participantsCount && participantsCount < coupon.minParticipants) {
      return NextResponse.json({
        valid: false,
        error: `קופון זה תקף ל-${coupon.minParticipants} משתתפים או יותר`
      })
    }

    // Log successful validation for audit trail
    console.log(`[COUPON] Validation successful: ${coupon.code} (${coupon.percentOff}% off, ${participantsCount || 'unknown'} participants)`)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        percentOff: coupon.percentOff,
        description: coupon.description
      }
    })
  } catch (error) {
    console.error('[COUPON] Error validating coupon:', error)
    return NextResponse.json(
      { valid: false, error: 'שגיאה באימות קופון' },
      { status: 500 }
    )
  }
}
