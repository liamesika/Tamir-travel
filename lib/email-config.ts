/**
 * Single source of truth for email configuration
 */

export const EMAIL_CONFIG = {
  // Support email - NEVER use the old tamirtours-uk@gmail.com
  SUPPORT_EMAIL: 'tamirtours.uk@gmail.com',

  // Get from email - uses env var or defaults to Resend onboarding for dev
  getFromEmail(): string {
    return process.env.EMAIL_FROM || process.env.ALERT_EMAIL_FROM || `Tamir Trip <${this.SUPPORT_EMAIL}>`
  },

  // Get admin alert email
  getAdminEmail(): string {
    return process.env.ALERT_EMAIL_TO || process.env.ADMIN_EMAIL || ''
  },

  // Check if Resend is properly configured
  isResendConfigured(): boolean {
    const key = process.env.RESEND_API_KEY
    return !!key && key !== 're_your_resend_api_key_here' && key.startsWith('re_')
  },

  // Get app URL
  getAppUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
}
