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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ]
    }

    // Get total count
    const total = await prisma.user.count({ where })

    // Get users with their bookings
    const users = await prisma.user.findMany({
      where,
      include: {
        bookings: {
          include: {
            tripDate: {
              include: {
                trip: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Calculate stats for each user
    const usersWithStats = users.map(user => {
      const totalSpent = user.bookings
        .filter(b => b.depositStatus === 'PAID')
        .reduce((sum, b) => sum + b.depositAmount + (b.remainingStatus === 'PAID' ? b.remainingAmount : 0), 0)

      const totalParticipants = user.bookings.reduce((sum, b) => sum + b.participantsCount, 0)

      return {
        ...user,
        stats: {
          bookingsCount: user.bookings.length,
          totalSpent,
          totalParticipants
        }
      }
    })

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת משתמשים' },
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
    const { fullName, email, phone, whatsapp, notes } = await request.json()

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'שם ואימייל נדרשים' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'משתמש עם אימייל זה כבר קיים' },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        whatsapp,
        notes
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת משתמש' },
      { status: 500 }
    )
  }
}
