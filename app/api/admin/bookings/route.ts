import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Check admin authentication
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const tripDateId = searchParams.get('tripDateId')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (status && status !== 'ALL') {
      where.depositStatus = status
    }

    if (tripDateId && tripDateId !== 'ALL') {
      where.tripDateId = tripDateId
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.booking.count({ where })

    // Get bookings with related data
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        tripDate: {
          include: {
            trip: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הזמנות' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  // Check admin authentication
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { bookingId, ...updateData } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'חסר מזהה הזמנה' },
        { status: 400 }
      )
    }

    // Only allow certain fields to be updated
    const allowedFields = ['adminNotes', 'depositStatus', 'remainingStatus']
    const filteredData: any = {}

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
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
