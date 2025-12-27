export interface BookingConfirmationData {
  fullName: string
  email: string
  phone: string
  tripDate: string
  participantsCount: number
  depositAmount: number
  remainingAmount: number
  remainingDueDate: string
  bookingId: string
}

export interface PaymentConfirmationData {
  fullName: string
  email: string
  tripDate: string
  amountPaid: number
  paymentType: 'deposit' | 'remaining'
  bookingId: string
}

export interface RemainingBalanceRequestData {
  fullName: string
  email: string
  tripDate: string
  remainingAmount: number
  remainingDueDate: string
  paymentLink: string
  bookingId: string
}

export function generateBookingConfirmationEmail(data: BookingConfirmationData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>אישור הזמנה</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; direction: rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">
                🎉 אישור הזמנה
              </h1>
              <p style="color: #e0e7ff; font-size: 16px; margin: 10px 0 0 0;">
                ההזמנה שלך התקבלה בהצלחה!
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">
                שלום <strong>${data.fullName}</strong>,
              </p>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
                תודה שבחרת להצטרף אלינו לטיול! ההזמנה שלך אושרה ואנחנו מתרגשים לארח אותך.
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #1e3a8a; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">
                      📋 פרטי ההזמנה
                    </h2>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">מספר הזמנה:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #1f2937; font-size: 14px;">${data.bookingId}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">תאריך טיול:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #1f2937; font-size: 14px;">${data.tripDate}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">מספר משתתפים:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #1f2937; font-size: 14px;">${data.participantsCount}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 14px;">אימייל:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #e5e7eb;">
                          <strong style="color: #1f2937; font-size: 14px;">${data.email}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #6b7280; font-size: 14px;">טלפון:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left;">
                          <strong style="color: #1f2937; font-size: 14px;">${data.phone}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Payment Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="color: #166534; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">
                      💰 פרטי תשלום
                    </h2>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #86efac;">
                          <span style="color: #166534; font-size: 14px;">מקדמה ששולמה:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #86efac;">
                          <strong style="color: #166534; font-size: 16px;">₪${data.depositAmount}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #86efac;">
                          <span style="color: #166534; font-size: 14px;">יתרת תשלום:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #86efac;">
                          <strong style="color: #166534; font-size: 16px;">₪${data.remainingAmount}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #166534; font-size: 14px;">תאריך תשלום יתרה:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left;">
                          <strong style="color: #166534; font-size: 16px;">${data.remainingDueDate}</strong>
                        </td>
                      </tr>
                    </table>

                    <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 15px; border-right: 4px solid #22c55e;">
                      <p style="color: #166534; font-size: 14px; margin: 0; line-height: 1.5;">
                        <strong>💡 שים לב:</strong> נשלח אליך תזכורת לתשלום היתרה לפני תאריך הפירעון.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; border-right: 4px solid #3b82f6; margin-bottom: 30px;">
                <h3 style="color: #1e3a8a; font-size: 18px; margin: 0 0 15px 0;">
                  📌 הצעדים הבאים
                </h3>
                <ul style="color: #1e40af; font-size: 14px; line-height: 1.8; margin: 0; padding-right: 20px;">
                  <li>שמור את אישור ההזמנה הזה למעקב</li>
                  <li>תקבל תזכורת לתשלום היתרה לפני ${data.remainingDueDate}</li>
                  <li>נשלח אליך מידע נוסף על הטיול לפני המועד</li>
                  <li>במידת הצורך, ניתן ליצור קשר בטלפון או בווטסאפ</li>
                </ul>
              </div>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 10px 0;">
                מצפים לראותך! 🚀
              </p>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0;">
                <strong>צוות תמיר טריפ</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
                יש לך שאלות? צור קשר איתנו בכל עת
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
                <a href="mailto:tamirtours.uk@gmail.com" style="color: #3b82f6;">tamirtours.uk@gmail.com</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2025 תמיר טריפ. כל הזכויות שמורות.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export function generatePaymentConfirmationEmail(data: PaymentConfirmationData): string {
  const paymentTypeText = data.paymentType === 'deposit' ? 'מקדמה' : 'יתרת תשלום'
  const emoji = data.paymentType === 'deposit' ? '💰' : '✅'

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>אישור תשלום</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; direction: rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 40px;">${emoji}</span>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">
                התשלום התקבל בהצלחה!
              </h1>
              <p style="color: #d1fae5; font-size: 16px; margin: 10px 0 0 0;">
                ${paymentTypeText} שולמה במלואה
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">
                שלום <strong>${data.fullName}</strong>,
              </p>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
                תודה רבה! התשלום שלך התקבל ועובד בהצלחה. הנה פרטי התשלום:
              </p>

              <!-- Payment Summary Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                      <div style="display: inline-block; background-color: #ffffff; padding: 20px 40px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">סכום ששולם</p>
                        <p style="color: #166534; font-size: 36px; font-weight: 700; margin: 0;">₪${data.amountPaid}</p>
                      </div>
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #86efac;">
                          <span style="color: #166534; font-size: 14px;">סוג תשלום:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #86efac;">
                          <strong style="color: #166534; font-size: 14px;">${paymentTypeText}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #86efac;">
                          <span style="color: #166534; font-size: 14px;">תאריך טיול:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #86efac;">
                          <strong style="color: #166534; font-size: 14px;">${data.tripDate}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #86efac;">
                          <span style="color: #166534; font-size: 14px;">מספר הזמנה:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #86efac;">
                          <strong style="color: #166534; font-size: 14px;">${data.bookingId}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #166534; font-size: 14px;">אימייל:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left;">
                          <strong style="color: #166534; font-size: 14px;">${data.email}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${data.paymentType === 'deposit' ? `
              <!-- Remaining Payment Notice -->
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 12px; border-right: 4px solid #f59e0b; margin-bottom: 30px;">
                <h3 style="color: #92400e; font-size: 16px; margin: 0 0 10px 0;">
                  ⏳ תזכורת חשובה
                </h3>
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
                  נשלח אליך תזכורת לתשלום יתרת התשלום לפני מועד הטיול. שמור על פרטי ההזמנה שלך!
                </p>
              </div>
              ` : `
              <!-- Full Payment Confirmation -->
              <div style="background-color: #dcfce7; padding: 20px; border-radius: 12px; border-right: 4px solid #22c55e; margin-bottom: 30px;">
                <h3 style="color: #166534; font-size: 16px; margin: 0 0 10px 0;">
                  ✨ ההזמנה שלך מאושרת במלואה!
                </h3>
                <p style="color: #166534; font-size: 14px; margin: 0; line-height: 1.5;">
                  כל התשלומים בוצעו. נשלח אליך מידע נוסף על הטיול לפני המועד. מצפים לראותך!
                </p>
              </div>
              `}

              <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 10px 0;">
                תודה שבחרת בנו! 🙏
              </p>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0;">
                <strong>צוות תמיר טריפ</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
                שמור את אישור התשלום הזה לתיעוד שלך
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
                <a href="mailto:tamirtours.uk@gmail.com" style="color: #3b82f6;">tamirtours.uk@gmail.com</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2025 תמיר טריפ. כל הזכויות שמורות.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export function generateRemainingBalanceRequestEmail(data: RemainingBalanceRequestData): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>תזכורת לתשלום יתרה</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; direction: rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 40px;">⏰</span>
              </div>
              <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">
                תזכורת לתשלום יתרה
              </h1>
              <p style="color: #fef3c7; font-size: 16px; margin: 10px 0 0 0;">
                הגיע הזמן להשלים את התשלום לטיול
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">
                שלום <strong>${data.fullName}</strong>,
              </p>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
                מתקרבים לטיול המרגש שלנו! כדי להבטיח את מקומך, נא להשלים את תשלום היתרה.
              </p>

              <!-- Payment Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                      <div style="display: inline-block; background-color: #ffffff; padding: 20px 40px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 5px 0;">סכום לתשלום</p>
                        <p style="color: #92400e; font-size: 36px; font-weight: 700; margin: 0;">₪${data.remainingAmount}</p>
                      </div>
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #fbbf24;">
                          <span style="color: #92400e; font-size: 14px;">תאריך טיול:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #fbbf24;">
                          <strong style="color: #92400e; font-size: 14px;">${data.tripDate}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-bottom: 1px solid #fbbf24;">
                          <span style="color: #92400e; font-size: 14px;">תאריך פירעון:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left; border-bottom: 1px solid #fbbf24;">
                          <strong style="color: #dc2626; font-size: 14px;">${data.remainingDueDate}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <span style="color: #92400e; font-size: 14px;">מספר הזמנה:</span>
                        </td>
                        <td style="padding: 10px 0; text-align: left;">
                          <strong style="color: #92400e; font-size: 14px;">${data.bookingId}</strong>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <div style="text-align: center;">
                      <a href="${data.paymentLink}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3); transition: all 0.3s;">
                        💳 לתשלום עכשיו
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Important Notice -->
              <div style="background-color: #fee2e2; padding: 20px; border-radius: 12px; border-right: 4px solid #dc2626; margin-bottom: 30px;">
                <h3 style="color: #991b1b; font-size: 16px; margin: 0 0 10px 0;">
                  ⚠️ חשוב לדעת
                </h3>
                <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.5;">
                  במידה והתשלום לא יתקבל עד ${data.remainingDueDate}, ההזמנה עלולה להתבטל ומקומך לא יהיה מובטח.
                </p>
              </div>

              <!-- Help Section -->
              <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; border-right: 4px solid #3b82f6; margin-bottom: 30px;">
                <h3 style="color: #1e3a8a; font-size: 16px; margin: 0 0 10px 0;">
                  💬 צריך עזרה?
                </h3>
                <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.5;">
                  אם יש לך שאלות או בעיות בתשלום, אנחנו כאן בשבילך! צור קשר איתנו בטלפון או בווטסאפ ונשמח לעזור.
                </p>
              </div>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 10px 0;">
                מצפים לראותך בטיול! 🚀
              </p>

              <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0;">
                <strong>צוות תמיר טריפ</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
                מייל זה נשלח אליך אוטומטית כתזכורת לתשלום
              </p>
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
                <a href="mailto:tamirtours.uk@gmail.com" style="color: #3b82f6;">tamirtours.uk@gmail.com</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2025 תמיר טריפ. כל הזכויות שמורות.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
