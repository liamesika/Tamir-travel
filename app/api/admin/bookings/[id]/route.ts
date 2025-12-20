import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tripDate: {
          include: {
            trip: true
          }
        },
        user: true,
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'הזמנה לא נמצאה' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הזמנה' },
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
    const updateData = await request.json()

    // Only allow certain fields to be updated
    const allowedFields = ['adminNotes', 'depositStatus', 'remainingStatus']
    const filteredData: any = {}

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    }

    // If marking remaining as paid, set the paidAt date
    if (filteredData.remainingStatus === 'PAID') {
      filteredData.remainingPaidAt = new Date()
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: filteredData,
      include: {
        tripDate: true,
        payments: true
      }
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון הזמנה' },
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

    // Get booking to update reserved spots
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { tripDate: true }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'הזמנה לא נמצאה' },
        { status: 404 }
      )
    }

    // Delete related payments first
    await prisma.payment.deleteMany({
      where: { bookingId: id }
    })

    // Delete the booking
    await prisma.booking.delete({
      where: { id }
    })

    // Update reserved spots if deposit was paid
    if (booking.depositStatus === 'PAID') {
      await prisma.tripDate.update({
        where: { id: booking.tripDateId },
        data: {
          reservedSpots: {
            decrement: booking.participantsCount
          }
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת הזמנה' },
      { status: 500 }
    )
  }
}
