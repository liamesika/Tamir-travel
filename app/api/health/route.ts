import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ''
  const hasSSL = dbUrl.includes('sslmode=require')
  const isNeon = dbUrl.includes('neon.tech')

  // Mask the password in URL for debug
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':***@')

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      hasSSL,
      isNeon,
      urlPreview: maskedUrl.substring(0, 80) + '...',
    }
  })
}
