import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET all coupons
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    })

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת קופונים' },
      { status: 500 }
    )
  }
}

// POST create new coupon
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const data = await request.json()
    const {
      code,
      description,
      percentOff,
      isActive = true,
      expiresAt,
      maxRedemptions,
      minParticipants,
      createInStripe = false
    } = data

    // Validate required fields
    if (!code || !percentOff) {
      return NextResponse.json(
        { error: 'קוד ואחוז הנחה הם שדות חובה' },
        { status: 400 }
      )
    }

    // Validate percentOff
    const percent = parseInt(percentOff)
    if (isNaN(percent) || percent < 1 || percent > 100) {
      return NextResponse.json(
        { error: 'אחוז הנחה חייב להיות בין 1 ל-100' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'קוד קופון כבר קיים' },
        { status: 400 }
      )
    }

    let stripeCouponId: string | null = null
    let stripePromoCodeId: string | null = null

    // Create in Stripe if requested
    if (createInStripe && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = getStripe()

        // Create Stripe coupon
        const stripeCoupon = await stripe.coupons.create({
          percent_off: percent,
          duration: 'once',
          name: code.toUpperCase(),
          metadata: {
            description: description || '',
            source: 'admin_panel'
          }
        })

        stripeCouponId = stripeCoupon.id

        // Create promotion code for the coupon using proper Stripe API
        const promoCodeParams: Record<string, unknown> = {
          coupon: stripeCoupon.id,
          code: code.toUpperCase(),
        }
        if (maxRedemptions) {
          promoCodeParams.max_redemptions = parseInt(maxRedemptions)
        }
        if (expiresAt) {
          promoCodeParams.expires_at = Math.floor(new Date(expiresAt).getTime() / 1000)
        }

        const promoCode = await stripe.promotionCodes.create(promoCodeParams as any)
        stripePromoCodeId = promoCode.id
      } catch (stripeError) {
        console.error('Stripe coupon creation failed:', stripeError)
        // Continue without Stripe integration
      }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        percentOff: percent,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
        minParticipants: minParticipants ? parseInt(minParticipants) : null,
        stripeCouponId,
        stripePromoCodeId
      }
    })

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת קופון' },
      { status: 500 }
    )
  }
}
