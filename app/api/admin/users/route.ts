import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get unique customers from bookings
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Group by email to get unique customers with booking count
    const customerMap = new Map<string, {
      id: string
      email: string
      name: string
      phone: string
      createdAt: Date
      bookingsCount: number
    }>()

    bookings.forEach((booking) => {
      const existing = customerMap.get(booking.email)
      if (existing) {
        existing.bookingsCount++
      } else {
        customerMap.set(booking.email, {
          id: booking.id,
          email: booking.email,
          name: booking.fullName,
          phone: booking.phone,
          createdAt: booking.createdAt,
          bookingsCount: 1,
        })
      }
    })

    const users = Array.from(customerMap.values())

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת משתמשים' },
      { status: 500 }
    )
  }
}
