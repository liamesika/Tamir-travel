import {
  generateBookingConfirmationMessage,
  generatePaymentConfirmationMessage,
  generateRemainingBalanceMessage,
  generateTripReminderMessage,
  generateTripDetailsMessage,
  WhatsAppBookingData,
  WhatsAppPaymentData,
  WhatsAppRemainingData,
} from './whatsapp-templates'

export interface WhatsAppResponse {
  success: boolean
  messageId?: string
  preview?: string
  error?: string
}

/**
 * WhatsApp Service (placeholder - no actual sending)
 * In production, this will integrate with WhatsApp Business API or services like Twilio, MessageBird, etc.
 */
export class WhatsAppService {
  private static isConfigured(): boolean {
    return !!process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_API_KEY !== 'your_whatsapp_api_key_here'
  }

  /**
   * Format phone number for WhatsApp (international format)
   * Example: 0501234567 -> +972501234567
   */
  private static formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '')

    if (cleaned.startsWith('0')) {
      cleaned = '972' + cleaned.substring(1)
    }

    if (!cleaned.startsWith('972')) {
      cleaned = '972' + cleaned
    }

    return '+' + cleaned
  }

  /**
   * Send booking confirmation via WhatsApp
   */
  static async sendBookingConfirmation(data: WhatsAppBookingData): Promise<WhatsAppResponse> {
    const message = generateBookingConfirmationMessage(data)
    const formattedPhone = this.formatPhoneNumber(data.phone)

    if (!this.isConfigured()) {
      console.log('📱 [WHATSAPP PREVIEW] Booking Confirmation')
      console.log('To:', formattedPhone)
      console.log('---')
      console.log(message)
      console.log('---')

      return {
        success: true,
        messageId: `preview-${Date.now()}-booking`,
        preview: message,
      }
    }

    try {
      // In production with real WhatsApp API:
      // Example with Twilio:
      // const twilio = require('twilio')
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      // const result = await client.messages.create({
      //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      //   to: `whatsapp:${formattedPhone}`,
      //   body: message,
      // })
      // return { success: true, messageId: result.sid }

      // Example with WhatsApp Business API:
      // const response = await fetch('https://api.whatsapp.com/v1/messages', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     to: formattedPhone,
      //     type: 'text',
      //     text: { body: message },
      //   }),
      // })
      // const data = await response.json()
      // return { success: true, messageId: data.messages[0].id }

      return {
        success: true,
        messageId: `mock-${Date.now()}-booking`,
        preview: message,
      }
    } catch (error) {
      console.error('WhatsApp send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send payment confirmation via WhatsApp
   */
  static async sendPaymentConfirmation(data: WhatsAppPaymentData): Promise<WhatsAppResponse> {
    const message = generatePaymentConfirmationMessage(data)
    const formattedPhone = this.formatPhoneNumber(data.phone)

    if (!this.isConfigured()) {
      console.log('📱 [WHATSAPP PREVIEW] Payment Confirmation')
      console.log('To:', formattedPhone)
      console.log('---')
      console.log(message)
      console.log('---')

      return {
        success: true,
        messageId: `preview-${Date.now()}-payment`,
        preview: message,
      }
    }

    try {
      return {
        success: true,
        messageId: `mock-${Date.now()}-payment`,
        preview: message,
      }
    } catch (error) {
      console.error('WhatsApp send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send remaining balance request via WhatsApp
   */
  static async sendRemainingBalanceRequest(data: WhatsAppRemainingData): Promise<WhatsAppResponse> {
    const message = generateRemainingBalanceMessage(data)
    const formattedPhone = this.formatPhoneNumber(data.phone)

    if (!this.isConfigured()) {
      console.log('📱 [WHATSAPP PREVIEW] Remaining Balance Request')
      console.log('To:', formattedPhone)
      console.log('---')
      console.log(message)
      console.log('---')

      return {
        success: true,
        messageId: `preview-${Date.now()}-remaining`,
        preview: message,
      }
    }

    try {
      return {
        success: true,
        messageId: `mock-${Date.now()}-remaining`,
        preview: message,
      }
    } catch (error) {
      console.error('WhatsApp send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send trip reminder via WhatsApp
   */
  static async sendTripReminder(data: {
    fullName: string
    phone: string
    tripDate: string
    daysUntilTrip: number
  }): Promise<WhatsAppResponse> {
    const message = generateTripReminderMessage(data)
    const formattedPhone = this.formatPhoneNumber(data.phone)

    if (!this.isConfigured()) {
      console.log('📱 [WHATSAPP PREVIEW] Trip Reminder')
      console.log('To:', formattedPhone)
      console.log('---')
      console.log(message)
      console.log('---')

      return {
        success: true,
        messageId: `preview-${Date.now()}-reminder`,
        preview: message,
      }
    }

    try {
      return {
        success: true,
        messageId: `mock-${Date.now()}-reminder`,
        preview: message,
      }
    } catch (error) {
      console.error('WhatsApp send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send trip details via WhatsApp
   */
  static async sendTripDetails(data: {
    fullName: string
    phone: string
    tripDate: string
    meetingPoint: string
    meetingTime: string
    equipmentList: string[]
  }): Promise<WhatsAppResponse> {
    const message = generateTripDetailsMessage(data)
    const formattedPhone = this.formatPhoneNumber(data.phone)

    if (!this.isConfigured()) {
      console.log('📱 [WHATSAPP PREVIEW] Trip Details')
      console.log('To:', formattedPhone)
      console.log('---')
      console.log(message)
      console.log('---')

      return {
        success: true,
        messageId: `preview-${Date.now()}-details`,
        preview: message,
      }
    }

    try {
      return {
        success: true,
        messageId: `mock-${Date.now()}-details`,
        preview: message,
      }
    } catch (error) {
      console.error('WhatsApp send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}
