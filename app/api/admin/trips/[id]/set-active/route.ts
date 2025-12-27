import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const tripId = params.id

    // Verify trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    })

    if (!trip) {
      return NextResponse.json(
        { error: 'טיול לא נמצא' },
        { status: 404 }
      )
    }

    // Deactivate all trips and activate only this one
    await prisma.$transaction([
      prisma.trip.updateMany({
        where: { id: { not: tripId } },
        data: { isActive: false },
      }),
      prisma.trip.update({
        where: { id: tripId },
        data: { isActive: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'הטיול הוגדר כיחיד פעיל',
    })
  } catch (error) {
    console.error('Error setting active trip:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון הטיול' },
      { status: 500 }
    )
  }
}
