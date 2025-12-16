import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const cookie = serialize('admin-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  const response = NextResponse.json({ success: true })
  response.headers.set('Set-Cookie', cookie)

  return response
}
