import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const admin = await validateAdmin(email, password)

    if (!admin) {
      return NextResponse.json(
        { error: 'אימייל או סיסמה שגויים' },
        { status: 401 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('admin-session', JSON.stringify(admin), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({ success: true, admin })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'שגיאה בהתחברות' },
      { status: 500 }
    )
  }
}
