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
                status: { not: 'CANCELLED' },
              },
              orderBy: { date: 'asc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        })
        fallbackReason = 'no_active_trips_showing_all'
      }
    }

    // Parse JSON fields for each trip with full tripDates
    const parsedTrips = trips.map(trip => ({
      id: trip.id,
      name: trip.name,
      slug: trip.slug,
      heroTitle: trip.heroTitle,
      heroSubtitle: trip.heroSubtitle,
      heroImage: trip.heroImage,
      isActive: trip.isActive,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      tripDates: trip.tripDates.map(td => ({
        id: td.id,
        date: td.date,
        capacity: td.capacity,
        reservedSpots: td.reservedSpots,
        pricePerPerson: td.pricePerPerson,
        status: td.status,
      })),
      tripDatesCount: trip.tripDates.length,
    }))

    return new NextResponse(
      JSON.stringify({
        trips: parsedTrips,
        meta: {
          totalTrips: parsedTrips.length,
          fallbackReason,
        }
      }, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch trips', details: errorMessage }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    )
  }
}
