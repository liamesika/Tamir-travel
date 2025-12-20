import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ''
  const hasSSL = dbUrl.includes('sslmode=require')
  const isNeon = dbUrl.includes('neon.tech')

  // Mask the password in URL for debug
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':***@')

  let dbTest = 'not_tested'
  if (dbUrl) {
    try {
      const sql = neon(dbUrl)
      const result = await sql`SELECT 1 as test`
      dbTest = 'connected'
    } catch (e: any) {
      dbTest = `error: ${e.message}`
    }
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      hasSSL,
      isNeon,
      urlPreview: maskedUrl.substring(0, 80) + '...',
    },
    dbTest
  })
}
