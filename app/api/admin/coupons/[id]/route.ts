import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET single coupon
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

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        bookings: {
          select: {
            id: true,
            fullName: true,
            email: true,
            totalPrice: true,
            discountAmount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'קופון לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת קופון' },
      { status: 500 }
    )
  }
}

// PATCH update coupon
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

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id }
    })

    if (!existingCoupon) {
      return NextResponse.json(
        { error: 'קופון לא נמצא' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: Record<string, any> = {}

    if (data.description !== undefined) updateData.description = data.description
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null
    if (data.maxRedemptions !== undefined) updateData.maxRedemptions = data.maxRedemptions ? parseInt(data.maxRedemptions) : null
    if (data.minParticipants !== undefined) updateData.minParticipants = data.minParticipants ? parseInt(data.minParticipants) : null

    // Don't allow changing code or percentOff after creation
    if (data.percentOff !== undefined && data.percentOff !== existingCoupon.percentOff) {
      return NextResponse.json(
        { error: 'לא ניתן לשנות אחוז הנחה לאחר יצירת הקופון' },
        { status: 400 }
      )
    }

    // Update Stripe coupon if exists and isActive changed
    if (existingCoupon.stripePromoCodeId && data.isActive !== undefined && data.isActive !== existingCoupon.isActive) {
      try {
        const stripe = getStripe()
        await stripe.promotionCodes.update(existingCoupon.stripePromoCodeId, {
          active: data.isActive
        })
      } catch (stripeError) {
        console.error('Failed to update Stripe promo code:', stripeError)
      }
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון קופון' },
      { status: 500 }
    )
  }
}

// DELETE coupon
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

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: { select: { bookings: true } }
      }
    })

    if (!coupon) {
      return NextResponse.json(
        { error: 'קופון לא נמצא' },
        { status: 404 }
      )
    }

    // If coupon has been used, just deactivate it
    if (coupon._count.bookings > 0) {
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false }
      })

      return NextResponse.json({
        message: 'קופון בוטל (לא נמחק כי יש הזמנות משויכות)',
        deactivated: true
      })
    }

    // Delete Stripe coupon if exists
    if (coupon.stripeCouponId) {
      try {
        const stripe = getStripe()
        await stripe.coupons.del(coupon.stripeCouponId)
      } catch (stripeError) {
        console.error('Failed to delete Stripe coupon:', stripeError)
      }
    }

    await prisma.coupon.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'קופון נמחק בהצלחה' })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת קופון' },
      { status: 500 }
    )
  }
}
