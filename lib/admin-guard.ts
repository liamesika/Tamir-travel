import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from './prisma'

export interface AdminSession {
  id: string
  email: string
  name: string
  role?: string
}

/**
 * Get the current admin session from cookies
 * Returns null if not authenticated
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin-session')

    if (!sessionCookie?.value) {
      return null
    }

    const session = JSON.parse(sessionCookie.value) as AdminSession

    // Verify the admin still exists in the database
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!admin) {
      return null
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  } catch (error) {
    console.error('Error getting admin session:', error)
    return null
  }
}

/**
 * Require admin authentication for API routes
 * Returns an error response if not authenticated
 */
export async function requireAdmin(): Promise<{ session: AdminSession } | { error: NextResponse }> {
  const session = await getAdminSession()

  if (!session) {
    return {
      error: NextResponse.json(
        { error: 'לא מורשה - נדרשת התחברות מנהל' },
        { status: 401 }
      )
    }
  }

  return { session }
}

/**
 * Check if current user has admin role (not just viewer)
 */
export async function requireAdminRole(): Promise<{ session: AdminSession } | { error: NextResponse }> {
  const result = await requireAdmin()

  if ('error' in result) {
    return result
  }

  if (result.session.role === 'viewer') {
    return {
      error: NextResponse.json(
        { error: 'אין לך הרשאה לבצע פעולה זו' },
        { status: 403 }
      )
    }
  }

  return result
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message = 'לא מורשה - נדרשת התחברות מנהל') {
  return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Helper to create forbidden response
 */
export function forbiddenResponse(message = 'אין לך הרשאה לבצע פעולה זו') {
  return NextResponse.json({ error: message }, { status: 403 })
}
