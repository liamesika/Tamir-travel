import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            tripDate: {
              include: {
                trip: true
              }
            },
            payments: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'משתמש לא נמצא' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת משתמש' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { id } = await params
    const updateData = await request.json()

    // Only allow certain fields to be updated
    const allowedFields = ['fullName', 'email', 'phone', 'whatsapp', 'notes']
    const filteredData: any = {}

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    }

    // Check if email already exists (if changing email)
    if (filteredData.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: filteredData.email,
          NOT: { id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'משתמש עם אימייל זה כבר קיים' },
          { status: 400 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: filteredData,
      include: {
        bookings: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון משתמש' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { id } = await params

    // Check if user has bookings
    const user = await prisma.user.findUnique({
      where: { id },
      include: { bookings: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'משתמש לא נמצא' },
        { status: 404 }
      )
    }

    if (user.bookings.length > 0) {
      return NextResponse.json(
        { error: 'לא ניתן למחוק משתמש עם הזמנות קיימות' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת משתמש' },
      { status: 500 }
    )
  }
}
