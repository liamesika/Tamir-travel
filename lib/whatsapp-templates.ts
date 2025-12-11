export interface WhatsAppBookingData {
  fullName: string
  phone: string
  tripDate: string
  participantsCount: number
  depositAmount: number
  remainingAmount: number
  bookingId: string
}

export interface WhatsAppPaymentData {
  fullName: string
  phone: string
  tripDate: string
  amountPaid: number
  paymentType: 'deposit' | 'remaining'
}

export interface WhatsAppRemainingData {
  fullName: string
  phone: string
  tripDate: string
  remainingAmount: number
  remainingDueDate: string
  paymentLink: string
}

/**
 * Generate WhatsApp message for booking confirmation
 */
export function generateBookingConfirmationMessage(data: WhatsAppBookingData): string {
  return `
🎉 *אישור הזמנה - תמיר טריפ*

שלום ${data.fullName}!

ההזמנה שלך התקבלה בהצלחה! 🙏

*📋 פרטי ההזמנה:*
• מספר הזמנה: ${data.bookingId}
• תאריך טיול: ${data.tripDate}
• מספר משתתפים: ${data.participantsCount}

*💰 פרטי תשלום:*
• מקדמה ששולמה: ₪${data.depositAmount}
• יתרת תשלום: ₪${data.remainingAmount}

נשלח אליך תזכורת לתשלום היתרה לפני מועד הטיול.

מצפים לראותך! 🚀

*צוות תמיר טריפ*
  `.trim()
}

/**
 * Generate WhatsApp message for payment confirmation
 */
export function generatePaymentConfirmationMessage(data: WhatsAppPaymentData): string {
  const paymentTypeText = data.paymentType === 'deposit' ? 'מקדמה' : 'יתרת תשלום'
  const emoji = data.paymentType === 'deposit' ? '💰' : '✅'

  return `
${emoji} *התשלום התקבל בהצלחה!*

שלום ${data.fullName}!

${paymentTypeText} שלך בסך *₪${data.amountPaid}* התקבלה ועובדה בהצלחה.

*תאריך טיול:* ${data.tripDate}

${data.paymentType === 'deposit'
    ? 'נשלח אליך תזכורת לתשלום יתרת התשלום לפני מועד הטיול.'
    : 'ההזמנה שלך מאושרת במלואה! נשלח אליך מידע נוסף על הטיול לפני המועד.'}

תודה שבחרת בנו! 🙏

*צוות תמיר טריפ*
  `.trim()
}

/**
 * Generate WhatsApp message for remaining balance request
 */
export function generateRemainingBalanceMessage(data: WhatsAppRemainingData): string {
  return `
⏰ *תזכורת לתשלום יתרה - תמיר טריפ*

שלום ${data.fullName}!

מתקרבים לטיול המרגש שלנו! 🎉

כדי להבטיח את מקומך, נא להשלים את תשלום היתרה:

*💰 סכום לתשלום:* ₪${data.remainingAmount}
*📅 תאריך טיול:* ${data.tripDate}
*⏳ תאריך פירעון:* ${data.remainingDueDate}

*לתשלום עכשיו:*
${data.paymentLink}

❗ *חשוב:* במידה והתשלום לא יתקבל עד ${data.remainingDueDate}, ההזמנה עלולה להתבטל.

יש שאלות? אנחנו כאן בשבילך! 💬

*צוות תמיר טריפ*
  `.trim()
}

/**
 * Generate WhatsApp message for general trip reminder
 */
export function generateTripReminderMessage(data: {
  fullName: string
  phone: string
  tripDate: string
  daysUntilTrip: number
}): string {
  return `
🚀 *תזכורת לטיול - תמיר טריפ*

שלום ${data.fullName}!

הטיול שלנו מתקרב! נשארו רק *${data.daysUntilTrip} ימים* עד התאריך: ${data.tripDate}

בקרוב נשלח אליך:
• פרטי מפגש ושעה מדויקת
• רשימת ציוד מומלצת
• תנאי השטח וטיפים חשובים

הכנו לכם משהו מיוחד! 🎁

נתראה בקרוב!

*צוות תמיר טריפ*
  `.trim()
}

/**
 * Generate WhatsApp message for trip details
 */
export function generateTripDetailsMessage(data: {
  fullName: string
  phone: string
  tripDate: string
  meetingPoint: string
  meetingTime: string
  equipmentList: string[]
}): string {
  const equipment = data.equipmentList.map(item => `• ${item}`).join('\n')

  return `
📋 *פרטי הטיול - תמיר טריפ*

שלום ${data.fullName}!

הגיע הזמן! הנה כל הפרטים שאתם צריכים לטיול:

*📅 תאריך:* ${data.tripDate}
*🕐 שעת מפגש:* ${data.meetingTime}
*📍 נקודת מפגש:* ${data.meetingPoint}

*🎒 ציוד מומלץ:*
${equipment}

*💡 טיפים חשובים:*
• הגיעו 15 דקות לפני
• הביאו מים ואוכל קל
• הלבשו נעליים נוחות
• בדקו תחזית מזג אוויר

מצפים לראותכם! 🎉

*צוות תמיר טריפ*
  `.trim()
}
