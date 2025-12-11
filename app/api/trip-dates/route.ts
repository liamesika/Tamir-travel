import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tripDates = await prisma.tripDate.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json({ tripDates })
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
