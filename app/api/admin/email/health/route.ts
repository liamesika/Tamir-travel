import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { validateResendConfig, getResendInstance } from '@/lib/resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const config = validateResendConfig()

    // Additional check: try to create instance to verify API key is valid
    let instanceCreated = false
    let instanceError: string | null = null

    if (config.resendConfigured) {
      try {
        getResendInstance()
        instanceCreated = true
      } catch (error) {
        instanceError = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      resendConfigured: config.resendConfigured,
      fromConfigured: config.fromConfigured,
      valid: config.valid,
      instanceCreated,
      instanceError,
      errors: config.errors,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[EMAIL HEALTH] Error:', error)
    return NextResponse.json(
      {
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
