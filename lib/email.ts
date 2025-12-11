import {
  generateBookingConfirmationEmail,
  generatePaymentConfirmationEmail,
  generateRemainingBalanceRequestEmail,
  BookingConfirmationData,
  PaymentConfirmationData,
  RemainingBalanceRequestData,
} from './email-templates'

export interface EmailResponse {
  success: boolean
  messageId?: string
  preview?: string
  error?: string
}

/**
 * Email Service using Resend (placeholder - no actual sending)
 * In production, this will send real emails using Resend API
 */
export class EmailService {
  private static isConfigured(): boolean {
    return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_resend_api_key_here'
  }

  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmation(data: BookingConfirmationData): Promise<EmailResponse> {
    const html = generateBookingConfirmationEmail(data)

    if (!this.isConfigured()) {
      console.log('📧 [EMAIL PREVIEW] Booking Confirmation Email')
      console.log('To:', data.email)
      console.log('Subject: אישור הזמנה - תמיר טריפ')
      console.log('---')
      console.log('Preview:', html.substring(0, 200) + '...')

      return {
        success: true,
        messageId: `preview-${Date.now()}-booking`,
        preview: html,
      }
    }

    try {
      // In production with real Resend API key:
      // const { Resend } = require('resend')
      // const resend = new Resend(process.env.RESEND_API_KEY)
      // const result = await resend.emails.send({
      //   from: 'תמיר טריפ <bookings@tamir-trip.com>',
      //   to: data.email,
      //   subject: 'אישור הזמנה - תמיר טריפ',
      //   html,
      // })
      // return { success: true, messageId: result.id }

      return {
        success: true,
        messageId: `mock-${Date.now()}-booking`,
        preview: html,
      }
    } catch (error) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmation(data: PaymentConfirmationData): Promise<EmailResponse> {
    const html = generatePaymentConfirmationEmail(data)

    if (!this.isConfigured()) {
      console.log('📧 [EMAIL PREVIEW] Payment Confirmation Email')
      console.log('To:', data.email)
      console.log('Subject: אישור תשלום - תמיר טריפ')
      console.log('---')
      console.log('Preview:', html.substring(0, 200) + '...')

      return {
        success: true,
        messageId: `preview-${Date.now()}-payment`,
        preview: html,
      }
    }

    try {
      // In production with real Resend API key:
      // const { Resend } = require('resend')
      // const resend = new Resend(process.env.RESEND_API_KEY)
      // const result = await resend.emails.send({
      //   from: 'תמיר טריפ <payments@tamir-trip.com>',
      //   to: data.email,
      //   subject: 'אישור תשלום - תמיר טריפ',
      //   html,
      // })
      // return { success: true, messageId: result.id }

      return {
        success: true,
        messageId: `mock-${Date.now()}-payment`,
        preview: html,
      }
    } catch (error) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send remaining balance request email
   */
  static async sendRemainingBalanceRequest(data: RemainingBalanceRequestData): Promise<EmailResponse> {
    const html = generateRemainingBalanceRequestEmail(data)

    if (!this.isConfigured()) {
      console.log('📧 [EMAIL PREVIEW] Remaining Balance Request Email')
      console.log('To:', data.email)
      console.log('Subject: תזכורת לתשלום יתרה - תמיר טריפ')
      console.log('---')
      console.log('Preview:', html.substring(0, 200) + '...')

      return {
        success: true,
        messageId: `preview-${Date.now()}-remaining`,
        preview: html,
      }
    }

    try {
      // In production with real Resend API key:
      // const { Resend } = require('resend')
      // const resend = new Resend(process.env.RESEND_API_KEY)
      // const result = await resend.emails.send({
      //   from: 'תמיר טריפ <reminders@tamir-trip.com>',
      //   to: data.email,
      //   subject: 'תזכורת לתשלום יתרה - תמיר טריפ',
      //   html,
      // })
      // return { success: true, messageId: result.id }

      return {
        success: true,
        messageId: `mock-${Date.now()}-remaining`,
        preview: html,
      }
    } catch (error) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
