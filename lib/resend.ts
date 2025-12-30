// Server-only module - DO NOT import in client components
import { Resend } from 'resend'

// Strict validation at module load time
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.ALERT_EMAIL_FROM

// Validate configuration
export function validateResendConfig(): {
  valid: boolean
  resendConfigured: boolean
  fromConfigured: boolean
  errors: string[]
} {
  const errors: string[] = []

  const resendConfigured = !!(
    RESEND_API_KEY &&
    RESEND_API_KEY !== 're_your_resend_api_key_here' &&
    RESEND_API_KEY.startsWith('re_')
  )

  const fromConfigured = !!(
    RESEND_FROM_EMAIL &&
    RESEND_FROM_EMAIL !== 'onboarding@resend.dev' &&
    RESEND_FROM_EMAIL.includes('@')
  )

  if (!resendConfigured) {
    errors.push('RESEND_API_KEY is missing or invalid')
  }

  if (!fromConfigured) {
    errors.push('RESEND_FROM_EMAIL is missing or invalid')
  }

  return {
    valid: resendConfigured && fromConfigured,
    resendConfigured,
    fromConfigured,
    errors
  }
}

// Create Resend instance only if API key is valid
let resendInstance: Resend | null = null

export function getResendInstance(): Resend {
  const config = validateResendConfig()

  if (!config.resendConfigured) {
    console.error('[RESEND] Configuration error:', config.errors.join(', '))
    throw new Error(`Resend not configured: ${config.errors.join(', ')}`)
  }

  if (!resendInstance) {
    resendInstance = new Resend(RESEND_API_KEY!)
    console.log('[RESEND] Instance created successfully')
  }

  return resendInstance
}

// Get the FROM email address
export function getFromEmail(): string {
  const config = validateResendConfig()

  if (!config.fromConfigured) {
    console.error('[RESEND] FROM email not configured')
    throw new Error('RESEND_FROM_EMAIL is not configured')
  }

  return RESEND_FROM_EMAIL!
}

// Check if email is fully configured
export function isEmailConfigured(): boolean {
  const config = validateResendConfig()
  return config.valid
}
