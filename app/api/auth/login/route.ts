import { NextRequest, NextResponse } from 'next/server'
import { validateAdmin } from '@/lib/auth'
import { serialize } from 'cookie'

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

    const cookie = serialize('admin-session', JSON.stringify(admin), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    const response = NextResponse.json({ success: true, admin })
    response.headers.set('Set-Cookie', cookie)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'שגיאה בהתחברות' },
      { status: 500 }
    )
  }
}
