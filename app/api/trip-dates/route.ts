import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // First, try to find active trips
    let trips = await prisma.trip.findMany({
      where: { isActive: true },
      include: {
        tripDates: {
          where: {
            date: { gte: new Date() },
            status: { not: 'CANCELLED' },
            cancelledAt: null, // Exclude soft-deleted dates
          },
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Flatten trip dates with trip info for booking form
    const tripDates = trips.flatMap(trip =>
      trip.tripDates.map(td => ({
        ...td,
        tripId: trip.id,
        tripName: trip.name,
        tripSlug: trip.slug,
      }))
    )

    return NextResponse.json({
      tripDates,
      trips: trips.map(t => ({ id: t.id, name: t.name, slug: t.slug, isActive: t.isActive })),
    })
  } catch (error) {
    console.error('Fetch trip dates error:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת תאריכי הטיולים' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const tripDate = await prisma.tripDate.create({
      data: {
        date: new Date(body.date),
        capacity: body.capacity,
        pricePerPerson: body.pricePerPerson,
        depositAmount: body.depositAmount || 300,
        reservedSpots: 0,
        tripId: body.tripId,
      },
    })

    return NextResponse.json({ tripDate })
  } catch (error) {
    console.error('Create trip date error:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת תאריך טיול' },
      { status: 500 }
    )
  }
}
