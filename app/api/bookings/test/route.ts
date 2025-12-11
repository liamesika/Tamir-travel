import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripDateId, fullName, email, phone, participantsCount } = body

    // Validate required fields
    if (!tripDateId || !fullName || !email || !phone || !participantsCount) {
      return NextResponse.json(
        { error: 'כל השדות נדרשים' },
        { status: 400 }
      )
    }

    // Get trip date
    const tripDate = await prisma.tripDate.findUnique({
      where: { id: tripDateId },
    })

    if (!tripDate) {
      return NextResponse.json(
        { error: 'תאריך טיול לא נמצא' },
        { status: 404 }
      )
    }

    // Check available spots
    const availableSpots = tripDate.capacity - tripDate.reservedSpots
    if (availableSpots < participantsCount) {
      return NextResponse.json(
        { error: 'אין מספיק מקומות פנויים' },
        { status: 400 }
      )
    }

    const depositAmount = tripDate.depositAmount * participantsCount
    const totalPrice = tripDate.pricePerPerson * participantsCount
    const remainingAmount = totalPrice - depositAmount

    // Create booking without Stripe payment
    const booking = await prisma.booking.create({
      data: {
        tripDateId,
        fullName,
        email,
        phone,
        participantsCount,
        depositAmount,
        totalPrice,
        remainingAmount,
        depositStatus: 'PENDING',
        remainingStatus: 'PENDING',
      },
    })

    // Update reserved spots
    await prisma.tripDate.update({
      where: { id: tripDateId },
      data: {
        reservedSpots: {
          increment: participantsCount,
        },
      },
    })

    return NextResponse.json({
      booking,
      message: 'הזמנה נשמרה בהצלחה (ללא תשלום)',
    })
  } catch (error) {
    console.error('Test booking error:', error)
    return NextResponse.json(
      { error: 'שגיאה בשמירת ההזמנה' },
      { status: 500 }
    )
  }
}
