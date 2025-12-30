import {
  generateBookingConfirmationEmail,
  generatePaymentConfirmationEmail,
  generateRemainingBalanceRequestEmail,
  generateTripCancellationEmail,
  BookingConfirmationData,
  PaymentConfirmationData,
  RemainingBalanceRequestData,
  TripCancellationData,
} from './email-templates'
import { getResendInstance, getFromEmail, isEmailConfigured } from './resend'

export interface EmailResponse {
  success: boolean
  messageId?: string
  preview?: string
  error?: string
}

export interface AdminAlertData {
  tripDateId: string
  tripDate: string
  currentCount: number
  capacity: number
  minParticipants: number
  paidDeposits: number
  totalBookings: number
}

/**
 * Email Service using Resend
 */
export class EmailService {
  private static getAdminEmail(): string {
    return process.env.ALERT_EMAIL_TO || ''
  }

  private static getAppUrl(): string {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  private static formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  /**
   * Send admin alert when minimum participants reached
   */
  static async sendMinReachedAlert(data: AdminAlertData): Promise<EmailResponse> {
    const adminEmail = this.getAdminEmail()
    if (!adminEmail) {
      console.log('⚠️ ALERT_EMAIL_TO not configured, skipping min reached alert')
      return { success: false, error: 'ALERT_EMAIL_TO not configured' }
    }

    const subject = `מינימום משתתפים הושג! ${this.formatDate(data.tripDate)} (${data.currentCount}/${data.capacity})`
    const adminUrl = `${this.getAppUrl()}/admin/trip-dates/${data.tripDateId}`

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .stat-box { background: white; border-radius: 8px; padding: 15px; margin: 10px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-label { color: #6b7280; font-size: 14px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #111827; }
    .btn { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .success-icon { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✅</div>
      <h1>מינימום משתתפים הושג!</h1>
      <p>${this.formatDate(data.tripDate)}</p>
    </div>
    <div class="content">
      <p>שלום תמיר,</p>
      <p>חדשות טובות! הטיול בתאריך <strong>${this.formatDate(data.tripDate)}</strong> הגיע למינימום המשתתפים הנדרש.</p>

      <div class="stat-box">
        <div class="stat-label">משתתפים מאושרים</div>
        <div class="stat-value">${data.currentCount} / ${data.capacity}</div>
      </div>

      <div class="stat-box">
        <div class="stat-label">מקדמות ששולמו</div>
        <div class="stat-value">${data.paidDeposits}</div>
      </div>

      <div class="stat-box">
        <div class="stat-label">סה"כ הזמנות</div>
        <div class="stat-value">${data.totalBookings}</div>
      </div>

      <p><strong>מה עכשיו?</strong></p>
      <p>הגיע הזמן לשלוח ללקוחות קישורים להשלמת התשלום!</p>

      <a href="${adminUrl}" class="btn">צפה בפרטי הטיול</a>
    </div>
  </div>
</body>
</html>
`

    const text = `
מינימום משתתפים הושג!

תאריך: ${this.formatDate(data.tripDate)}
משתתפים: ${data.currentCount}/${data.capacity}
מקדמות ששולמו: ${data.paidDeposits}
סה"כ הזמנות: ${data.totalBookings}

צפה בפרטים: ${adminUrl}
`

    return this.sendEmail({
      to: adminEmail,
      subject,
      html,
      text
    })
  }

  /**
   * Send admin alert when trip is sold out
   */
  static async sendSoldOutAlert(data: AdminAlertData): Promise<EmailResponse> {
    const adminEmail = this.getAdminEmail()
    if (!adminEmail) {
      console.log('⚠️ ALERT_EMAIL_TO not configured, skipping sold out alert')
      return { success: false, error: 'ALERT_EMAIL_TO not configured' }
    }

    const subject = `🎉 נמכר! ${this.formatDate(data.tripDate)} (${data.currentCount}/${data.capacity})`
    const adminUrl = `${this.getAppUrl()}/admin/trip-dates/${data.tripDateId}`

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .stat-box { background: white; border-radius: 8px; padding: 15px; margin: 10px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-label { color: #6b7280; font-size: 14px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #111827; }
    .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
    .celebration-icon { font-size: 48px; margin-bottom: 10px; }
    .sold-out-badge { background: #dc2626; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; display: inline-block; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="celebration-icon">🎉</div>
      <h1>הטיול נמכר במלואו!</h1>
      <p>${this.formatDate(data.tripDate)}</p>
      <span class="sold-out-badge">SOLD OUT</span>
    </div>
    <div class="content">
      <p>שלום תמיר,</p>
      <p>מדהים! הטיול בתאריך <strong>${this.formatDate(data.tripDate)}</strong> נמכר במלואו!</p>

      <div class="stat-box">
        <div class="stat-label">משתתפים</div>
        <div class="stat-value">${data.currentCount} / ${data.capacity} (מלא!)</div>
      </div>

      <div class="stat-box">
        <div class="stat-label">מקדמות ששולמו</div>
        <div class="stat-value">${data.paidDeposits}</div>
      </div>

      <div class="stat-box">
        <div class="stat-label">סה"כ הזמנות</div>
        <div class="stat-value">${data.totalBookings}</div>
      </div>

      <p>סטטוס הטיול עודכן אוטומטית ל-<strong>SOLD OUT</strong>.</p>

      <a href="${adminUrl}" class="btn">צפה בפרטי הטיול</a>
    </div>
  </div>
</body>
</html>
`

    const text = `
🎉 הטיול נמכר במלואו!

תאריך: ${this.formatDate(data.tripDate)}
משתתפים: ${data.currentCount}/${data.capacity} (מלא!)
מקדמות ששולמו: ${data.paidDeposits}
סה"כ הזמנות: ${data.totalBookings}

צפה בפרטים: ${adminUrl}
`

    return this.sendEmail({
      to: adminEmail,
      subject,
      html,
      text
    })
  }

  /**
   * Generic email send method
   */
  private static async sendEmail({ to, subject, html, text }: {
    to: string
    subject: string
    html: string
    text?: string
  }): Promise<EmailResponse> {
    // Check if email is configured
    if (!isEmailConfigured()) {
      console.log('[EMAIL] Not configured - logging preview')
      console.log('[EMAIL PREVIEW] To:', to)
      console.log('[EMAIL PREVIEW] Subject:', subject)
      console.log('[EMAIL PREVIEW] Content:', html.substring(0, 200) + '...')

      return {
        success: true,
        messageId: `preview-${Date.now()}`,
        preview: html,
      }
    }

    try {
      const resend = getResendInstance()
      const fromEmail = getFromEmail()

      console.log('[EMAIL] Sending to:', to, 'from:', fromEmail)

      const result = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
        text,
      })

      if (result.error) {
        console.error('[EMAIL] Resend API error:', result.error)
        return { success: false, error: result.error.message }
      }

      console.log('[EMAIL] Sent successfully, messageId:', result.data?.id)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error('[EMAIL] Send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmation(data: BookingConfirmationData): Promise<EmailResponse> {
    const html = generateBookingConfirmationEmail(data)
    return this.sendEmail({
      to: data.email,
      subject: 'אישור הזמנה - תמיר טריפ',
      html,
    })
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmation(data: PaymentConfirmationData): Promise<EmailResponse> {
    const html = generatePaymentConfirmationEmail(data)
    return this.sendEmail({
      to: data.email,
      subject: 'אישור תשלום - תמיר טריפ',
      html,
    })
  }

  /**
   * Send remaining balance request email
   */
  static async sendRemainingBalanceRequest(data: RemainingBalanceRequestData): Promise<EmailResponse> {
    const html = generateRemainingBalanceRequestEmail(data)
    return this.sendEmail({
      to: data.email,
      subject: 'תזכורת לתשלום יתרה - תמיר טריפ',
      html,
    })
  }

  /**
   * Send trip cancellation email with refund confirmation
   */
  static async sendTripCancellation(data: TripCancellationData): Promise<EmailResponse> {
    const html = generateTripCancellationEmail(data)
    return this.sendEmail({
      to: data.email,
      subject: 'הטיול בוטל – החזר כספי מלא בוצע',
      html,
    })
  }
}
