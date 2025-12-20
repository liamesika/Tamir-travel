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

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        tripDates: {
          include: {
            bookings: {
              select: {
                id: true,
                fullName: true,
                depositStatus: true,
                remainingStatus: true,
                participantsCount: true
              }
            }
          },
          orderBy: {
            date: 'asc'
          }
        },
      },
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'טיול לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error fetching trip:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת טיול' },
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
    const data = await request.json()

    // Only allow certain fields to be updated
    const allowedFields = [
      'name', 'slug', 'heroTitle', 'heroSubtitle', 'heroImage',
      'guideTitle', 'guideContent', 'guideImage',
      'includedItems', 'notIncludedItems', 'itinerarySteps',
      'faqItems', 'galleryImages', 'isActive'
    ]

    const filteredData: any = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        filteredData[field] = data[field]
      }
    }

    // Check slug uniqueness if changing
    if (filteredData.slug) {
      const existingTrip = await prisma.trip.findFirst({
        where: {
          slug: filteredData.slug,
          NOT: { id }
        }
      })

      if (existingTrip) {
        return NextResponse.json(
          { error: 'סלאג כבר קיים במערכת' },
          { status: 400 }
        )
      }
    }

    const trip = await prisma.trip.update({
      where: { id },
      data: filteredData,
      include: {
        tripDates: true
      }
    })

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון טיול' },
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

    // Check if trip has bookings
    const tripDates = await prisma.tripDate.findMany({
      where: { tripId: id },
    })

    const tripDateIds = tripDates.map(td => td.id)

    if (tripDateIds.length > 0) {
      const bookingsCount = await prisma.booking.count({
        where: {
          tripDateId: {
            in: tripDateIds,
          },
        },
      })

      if (bookingsCount > 0) {
        return NextResponse.json(
          { error: 'לא ניתן למחוק טיול עם הזמנות קיימות' },
          { status: 400 }
        )
      }
    }

    // Delete trip dates first
    await prisma.tripDate.deleteMany({
      where: { tripId: id },
    })

    // Delete trip
    await prisma.trip.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת טיול' },
      { status: 500 }
    )
  }
}
