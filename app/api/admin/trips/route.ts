import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const trips = await prisma.trip.findMany({
      include: {
        tripDates: {
          include: {
            bookings: {
              select: {
                id: true,
                depositStatus: true,
                participantsCount: true
              }
            }
          },
          orderBy: {
            date: 'asc'
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Add stats to each trip
    const tripsWithStats = trips.map(trip => {
      const totalBookings = trip.tripDates.reduce(
        (sum, td) => sum + td.bookings.length, 0
      )
      const totalParticipants = trip.tripDates.reduce(
        (sum, td) => sum + td.bookings.reduce((s, b) => s + b.participantsCount, 0), 0
      )
      const totalCapacity = trip.tripDates.reduce(
        (sum, td) => sum + td.capacity, 0
      )

      return {
        ...trip,
        stats: {
          totalBookings,
          totalParticipants,
          totalCapacity,
          tripDatesCount: trip.tripDates.length
        }
      }
    })

    return NextResponse.json({ trips: tripsWithStats })
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת טיולים' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const data = await request.json()

    const {
      name,
      slug,
      heroTitle,
      heroSubtitle,
      heroImage,
      guideTitle,
      guideContent,
      guideImage,
      includedItems,
      notIncludedItems,
      itinerarySteps,
      faqItems,
      galleryImages,
      isActive = true,
    } = data

    if (!name || !slug || !heroTitle || !heroSubtitle) {
      return NextResponse.json(
        { error: 'חסרים שדות חובה' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingTrip = await prisma.trip.findUnique({
      where: { slug },
    })

    if (existingTrip) {
      return NextResponse.json(
        { error: 'סלאג כבר קיים במערכת' },
        { status: 400 }
      )
    }

    const trip = await prisma.trip.create({
      data: {
        name,
        slug,
        heroTitle,
        heroSubtitle,
        heroImage: heroImage || '',
        guideTitle: guideTitle || '',
        guideContent: guideContent || '',
        guideImage: guideImage || '',
        includedItems: includedItems || '',
        notIncludedItems: notIncludedItems || '',
        itinerarySteps: itinerarySteps || '',
        faqItems: faqItems || '',
        galleryImages: galleryImages || '',
        isActive,
      },
    })

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת טיול' },
      { status: 500 }
    )
  }
}
