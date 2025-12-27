import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all active trips with their dates
    let trips = await prisma.trip.findMany({
      where: { isActive: true },
      include: {
        tripDates: {
          where: {
            date: { gte: new Date() },
            status: { not: 'CANCELLED' },
          },
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    let fallbackReason: string | null = null

    // If no active trips, fallback to all trips
    if (trips.length === 0) {
      const totalTrips = await prisma.trip.count()
      if (totalTrips > 0) {
        trips = await prisma.trip.findMany({
          include: {
            tripDates: {
              where: {
                date: { gte: new Date() },
                status: { not: 'CANCELLED' },
              },
              orderBy: { date: 'asc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        })
        fallbackReason = 'no_active_trips_showing_all'
        console.log(`[TRIPS] No active trips, showing all ${trips.length} trips`)
      }
    }

    // Parse JSON fields for each trip
    const parsedTrips = trips.map(trip => ({
      id: trip.id,
      name: trip.name,
      slug: trip.slug,
      heroTitle: trip.heroTitle,
      heroSubtitle: trip.heroSubtitle,
      heroImage: trip.heroImage,
      isActive: trip.isActive,
      tripDates: trip.tripDates,
      tripDatesCount: trip.tripDates.length,
    }))

    console.log(`[TRIPS] Returning ${parsedTrips.length} trips`)

    return NextResponse.json({
      trips: parsedTrips,
      debug: {
        totalTrips: parsedTrips.length,
        fallbackReason,
      }
    })
  } catch (error: any) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trips', details: error.message },
      { status: 500 }
    )
  }
}
