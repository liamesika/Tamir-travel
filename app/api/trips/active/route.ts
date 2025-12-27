import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // First try to find an active trip
    let trip = await prisma.trip.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      include: {
        tripDates: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { date: 'asc' },
        },
      },
    })

    let fallbackReason: string | null = null

    // If no active trip, check total count and fallback
    if (!trip) {
      const tripCount = await prisma.trip.count()

      if (tripCount === 1) {
        // Single trip - show it even if not active
        trip = await prisma.trip.findFirst({
          include: {
            tripDates: {
              where: { status: { not: 'CANCELLED' } },
              orderBy: { date: 'asc' },
            },
          },
        })
        fallbackReason = 'single_trip_not_active'
        console.log(`[TRIPS/ACTIVE] Showing single trip (id: ${trip?.id}) even though isActive=false`)
      } else if (tripCount > 1) {
        // Multiple trips - show most recent
        trip = await prisma.trip.findFirst({
          orderBy: { updatedAt: 'desc' },
          include: {
            tripDates: {
              where: { status: { not: 'CANCELLED' } },
              orderBy: { date: 'asc' },
            },
          },
        })
        fallbackReason = 'no_active_trip_fallback_to_recent'
        console.log(`[TRIPS/ACTIVE] No active trip, falling back to most recent (id: ${trip?.id})`)
      }
    }

    if (!trip) {
      return NextResponse.json({
        trip: null,
        message: 'No trips found in database',
        debug: { totalTrips: 0 }
      })
    }

    // Parse JSON fields safely
    const parsedTrip = {
      ...trip,
      includedItems: safeParseJSON(trip.includedItems, []),
      notIncludedItems: safeParseJSON(trip.notIncludedItems, []),
      itinerarySteps: safeParseJSON(trip.itinerarySteps, []),
      faqItems: safeParseJSON(trip.faqItems, []),
      galleryImages: safeParseJSON(trip.galleryImages, []),
    }

    console.log(`[TRIPS/ACTIVE] Returning trip: id=${trip.id}, slug=${trip.slug}, isActive=${trip.isActive}`)

    return NextResponse.json({
      trip: parsedTrip,
      debug: {
        tripId: trip.id,
        tripSlug: trip.slug,
        isActive: trip.isActive,
        tripDatesCount: trip.tripDates.length,
        fallbackReason,
      }
    })
  } catch (error: any) {
    console.error('Error fetching active trip:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trip', details: error.message },
      { status: 500 }
    )
  }
}

function safeParseJSON(value: string | null, fallback: any): any {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
