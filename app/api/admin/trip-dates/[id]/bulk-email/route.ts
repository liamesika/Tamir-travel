import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { EMAIL_CONFIG } from '@/lib/email-config'

export const runtime = 'nodejs'

// Verify admin authentication
async function verifyAdmin() {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get('admin_session')

  if (!adminCookie?.value) {
    return null
  }

  try {
    const sessionData = JSON.parse(adminCookie.value)
    const admin = await prisma.admin.findUnique({
      where: { id: sessionData.adminId }
    })
    return admin
  } catch {
    return null
  }
}

// GET - Get bulk email batches for a trip date
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  const { id: tripDateId } = await params

  try {
    // Get trip date with basic info
    const tripDate = await prisma.tripDate.findUnique({
      where: { id: tripDateId },
      include: {
        trip: { select: { name: true } },
        bookings: {
          where: {
            cancelledAt: null,
            email: { not: '' }
          },
          select: {
            id: true,
            email: true,
            fullName: true,
            remainingStatus: true,
            paymentToken: true
          }
        }
      }
    })

    if (!tripDate) {
      return NextResponse.json({ error: 'תאריך טיול לא נמצא' }, { status: 404 })
    }

    // Get unique recipients
    const uniqueEmails = new Map<string, { email: string; fullName: string; bookingId: string; remainingStatus: string; paymentToken: string }>()
    for (const booking of tripDate.bookings) {
      const emailLower = booking.email.toLowerCase()
      if (!uniqueEmails.has(emailLower)) {
        uniqueEmails.set(emailLower, {
          email: booking.email,
          fullName: booking.fullName,
          bookingId: booking.id,
          remainingStatus: booking.remainingStatus,
          paymentToken: booking.paymentToken
        })
      }
    }

    // Get bulk email batches
    const batches = await prisma.bulkEmailBatch.findMany({
      where: { tripDateId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdByAdmin: { select: { name: true } },
        recipients: {
          select: {
            id: true,
            email: true,
            fullName: true,
            status: true,
            sentAt: true,
            errorMessage: true
          }
        }
      }
    })

    return NextResponse.json({
      tripDate: {
        id: tripDate.id,
        date: tripDate.date,
        tripName: tripDate.trip?.name || 'טיול'
      },
      recipients: Array.from(uniqueEmails.values()),
      totalRecipients: uniqueEmails.size,
      batches: batches.map(batch => ({
        id: batch.id,
        subject: batch.subject,
        body: batch.body,
        includePaymentLink: batch.includePaymentLink,
        totalRecipients: batch.totalRecipients,
        sentCount: batch.sentCount,
        failedCount: batch.failedCount,
        status: batch.status,
        createdAt: batch.createdAt,
        sentAt: batch.sentAt,
        createdByAdmin: batch.createdByAdmin?.name || 'Unknown',
        recipients: batch.recipients
      })),
      resendConfigured: EMAIL_CONFIG.isResendConfigured()
    })
  } catch (error) {
    console.error('Error fetching bulk email data:', error)
    return NextResponse.json({ error: 'שגיאה בטעינת נתונים' }, { status: 500 })
  }
}

// POST - Send bulk email to all recipients
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 })
  }

  const { id: tripDateId } = await params

  try {
    const body = await request.json()
    const { subject, body: emailBody, includePaymentLink } = body

    if (!subject || !emailBody) {
      return NextResponse.json({ error: 'נושא ותוכן המייל הם שדות חובה' }, { status: 400 })
    }

    // Check Resend configuration
    if (!EMAIL_CONFIG.isResendConfigured()) {
      const missingVars: string[] = []
      if (!process.env.RESEND_API_KEY) missingVars.push('RESEND_API_KEY')
      else if (process.env.RESEND_API_KEY === 're_your_resend_api_key_here') missingVars.push('RESEND_API_KEY (still using placeholder)')
      else if (!process.env.RESEND_API_KEY.startsWith('re_')) missingVars.push('RESEND_API_KEY (invalid format)')

      return NextResponse.json({
        error: 'Resend לא מוגדר כראוי',
        missingVars
      }, { status: 400 })
    }

    // Get trip date with bookings
    const tripDate = await prisma.tripDate.findUnique({
      where: { id: tripDateId },
      include: {
        trip: { select: { name: true } },
        bookings: {
          where: {
            cancelledAt: null,
            email: { not: '' }
          },
          select: {
            id: true,
            email: true,
            fullName: true,
            remainingStatus: true,
            paymentToken: true
          }
        }
      }
    })

    if (!tripDate) {
      return NextResponse.json({ error: 'תאריך טיול לא נמצא' }, { status: 404 })
    }

    // De-duplicate recipients by email (case-insensitive)
    const uniqueRecipients = new Map<string, { email: string; fullName: string; bookingId: string; remainingStatus: string; paymentToken: string }>()
    for (const booking of tripDate.bookings) {
      const emailLower = booking.email.toLowerCase()
      if (!uniqueRecipients.has(emailLower)) {
        uniqueRecipients.set(emailLower, {
          email: booking.email,
          fullName: booking.fullName,
          bookingId: booking.id,
          remainingStatus: booking.remainingStatus,
          paymentToken: booking.paymentToken
        })
      }
    }

    const recipients = Array.from(uniqueRecipients.values())

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'אין נמענים לשליחה' }, { status: 400 })
    }

    // Create batch record
    const batch = await prisma.bulkEmailBatch.create({
      data: {
        tripDateId,
        createdByAdminId: admin.id,
        subject,
        body: emailBody,
        includePaymentLink: !!includePaymentLink,
        totalRecipients: recipients.length,
        status: 'SENDING'
      }
    })

    // Create recipient records
    await prisma.bulkEmailRecipient.createMany({
      data: recipients.map(r => ({
        batchId: batch.id,
        bookingId: r.bookingId,
        email: r.email,
        fullName: r.fullName,
        status: 'PENDING'
      }))
    })

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = EMAIL_CONFIG.getFromEmail()
    const appUrl = EMAIL_CONFIG.getAppUrl()

    let sentCount = 0
    let failedCount = 0

    // Send emails in chunks of 10 to avoid rate limits
    const chunkSize = 10
    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize)

      await Promise.all(chunk.map(async (recipient) => {
        try {
          // Build personalized content
          let personalizedBody = emailBody
            .replace(/\{name\}/g, recipient.fullName || 'לקוח יקר')
            .replace(/\{email\}/g, recipient.email)

          // Add payment link if requested and payment is still pending
          if (includePaymentLink && recipient.remainingStatus !== 'PAID' && recipient.paymentToken) {
            const paymentLink = `${appUrl}/payment/${recipient.paymentToken}`
            personalizedBody += `\n\nלתשלום יתרה:\n${paymentLink}`
          }

          // Send email
          const result = await resend.emails.send({
            from: fromEmail,
            to: recipient.email,
            subject,
            html: `
              <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="white-space: pre-wrap; line-height: 1.8; font-size: 16px;">
${personalizedBody.split('\n').map((line: string) => `<p style="margin: 0 0 10px 0;">${line || '&nbsp;'}</p>`).join('')}
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="color: #6b7280; font-size: 14px; text-align: center;">
                  Tamir Tours UK
                </p>
              </div>
            `
          })

          // Update recipient status
          await prisma.bulkEmailRecipient.updateMany({
            where: {
              batchId: batch.id,
              email: recipient.email
            },
            data: {
              status: 'SENT',
              providerMessageId: result.data?.id || null,
              sentAt: new Date()
            }
          })

          sentCount++
        } catch (error) {
          console.error(`Failed to send to ${recipient.email}:`, error)

          // Update recipient status as failed
          await prisma.bulkEmailRecipient.updateMany({
            where: {
              batchId: batch.id,
              email: recipient.email
            },
            data: {
              status: 'FAILED',
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            }
          })

          failedCount++
        }
      }))

      // Small delay between chunks to respect rate limits
      if (i + chunkSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Update batch status
    await prisma.bulkEmailBatch.update({
      where: { id: batch.id },
      data: {
        sentCount,
        failedCount,
        status: failedCount === recipients.length ? 'FAILED' : 'COMPLETED',
        sentAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      totalRecipients: recipients.length,
      sentCount,
      failedCount
    })

  } catch (error) {
    console.error('Error sending bulk email:', error)
    return NextResponse.json({
      error: 'שגיאה בשליחת מיילים',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
