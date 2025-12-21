import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const trip = await prisma.trip.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      include: {
        tripDates: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!trip) {
      return NextResponse.json({ trip: null, message: 'No active trip found' })
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

    return NextResponse.json({ trip: parsedTrip })
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
