import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { EmailService } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SendResult {
  bookingId: string
  fullName: string
  email: string
  success: boolean
  messageId?: string
  error?: string
  skipped?: boolean
  skipReason?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { id: tripDateId } = await params
    const body = await request.json()
    const { unpaidOnly = true, bookingIds } = body

    // Fetch trip date with bookings
    const tripDate = await prisma.tripDate.findUnique({
      where: { id: tripDateId },
      include: {
        trip: true,
        bookings: {
          where: {
            cancelledAt: null,
            depositStatus: 'PAID',
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!tripDate) {
      return NextResponse.json(
        { error: 'תאריך טיול לא נמצא' },
        { status: 404 }
      )
    }

    const tripName = tripDate.trip?.name || 'טיול קוטסוולדס'
    const tripDateFormatted = new Date(tripDate.date).toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    // Filter bookings based on options
    let bookingsToEmail = tripDate.bookings

    // If specific booking IDs provided, filter by those
    if (bookingIds && Array.isArray(bookingIds) && bookingIds.length > 0) {
      bookingsToEmail = bookingsToEmail.filter(b => bookingIds.includes(b.id))
    }

    // If unpaidOnly, filter to only those who haven't paid remaining
    if (unpaidOnly) {
      bookingsToEmail = bookingsToEmail.filter(b => b.remainingStatus !== 'PAID')
    }

    if (bookingsToEmail.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'אין הזמנות לשליחה',
        results: {
          total: 0,
          sent: 0,
          failed: 0,
          skipped: 0,
          details: []
        }
      })
    }

    const results: SendResult[] = []
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Process each booking
    for (const booking of bookingsToEmail) {
      // Skip if remaining is already paid
      if (booking.remainingStatus === 'PAID') {
        results.push({
          bookingId: booking.id,
          fullName: booking.fullName,
          email: booking.email,
          success: false,
          skipped: true,
          skipReason: 'יתרה שולמה כבר'
        })
        continue
      }

      // Skip if remaining amount is 0
      if (booking.remainingAmount <= 0) {
        results.push({
          bookingId: booking.id,
          fullName: booking.fullName,
          email: booking.email,
          success: false,
          skipped: true,
          skipReason: 'אין יתרה לתשלום'
        })
        continue
      }

      // Generate payment link using payment token
      const paymentLink = `${appUrl}/payment/remaining/${booking.paymentToken}`

      // Calculate remaining due date
      const remainingDueDate = booking.remainingDueDate
        ? new Date(booking.remainingDueDate).toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        : new Date(tripDate.date).toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })

      try {
        const emailResult = await EmailService.sendRemainingBalanceRequest({
          fullName: booking.fullName,
          email: booking.email,
          tripName,
          tripDate: tripDateFormatted,
          remainingAmount: booking.remainingAmount / 100, // Convert agorot to ILS
          remainingDueDate,
          paymentLink,
          bookingId: booking.id
        })

        if (emailResult.success) {
          // Update booking with email tracking info
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              remainingEmailSentAt: new Date(),
              remainingEmailMessageId: emailResult.messageId,
              emailSentAt: new Date(),
              emailLastType: 'remaining',
              emailMessageId: emailResult.messageId
            }
          })

          results.push({
            bookingId: booking.id,
            fullName: booking.fullName,
            email: booking.email,
            success: true,
            messageId: emailResult.messageId
          })
        } else {
          results.push({
            bookingId: booking.id,
            fullName: booking.fullName,
            email: booking.email,
            success: false,
            error: emailResult.error || 'שגיאה לא ידועה'
          })
        }
      } catch (error) {
        console.error(`Error sending email to ${booking.email}:`, error)
        results.push({
          bookingId: booking.id,
          fullName: booking.fullName,
          email: booking.email,
          success: false,
          error: error instanceof Error ? error.message : 'שגיאה בשליחה'
        })
      }
    }

    const sent = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success && !r.skipped).length
    const skipped = results.filter(r => r.skipped).length

    return NextResponse.json({
      success: true,
      message: `נשלחו ${sent} מיילים`,
      results: {
        total: results.length,
        sent,
        failed,
        skipped,
        details: results
      }
    })
  } catch (error) {
    console.error('Error sending bulk emails:', error)
    return NextResponse.json(
      { error: 'שגיאה בשליחת מיילים' },
      { status: 500 }
    )
  }
}

// GET endpoint to preview who would receive emails
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return auth.error
  }

  try {
    const { id: tripDateId } = await params
    const url = new URL(request.url)
    const unpaidOnly = url.searchParams.get('unpaidOnly') !== 'false'

    const tripDate = await prisma.tripDate.findUnique({
      where: { id: tripDateId },
      include: {
        trip: true,
        bookings: {
          where: {
            cancelledAt: null,
            depositStatus: 'PAID'
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!tripDate) {
      return NextResponse.json(
        { error: 'תאריך טיול לא נמצא' },
        { status: 404 }
      )
    }

    let recipients = tripDate.bookings.map(b => ({
      bookingId: b.id,
      fullName: b.fullName,
      email: b.email,
      phone: b.phone,
      participantsCount: b.participantsCount,
      remainingAmount: b.remainingAmount,
      remainingStatus: b.remainingStatus,
      remainingEmailSentAt: b.remainingEmailSentAt,
      remainingEmailMessageId: b.remainingEmailMessageId,
      canSend: b.remainingStatus !== 'PAID' && b.remainingAmount > 0
    }))

    if (unpaidOnly) {
      recipients = recipients.filter(r => r.canSend)
    }

    return NextResponse.json({
      tripDateId,
      tripName: tripDate.trip?.name || 'טיול קוטסוולדס',
      tripDate: tripDate.date,
      totalBookings: tripDate.bookings.length,
      recipients,
      summary: {
        canSend: recipients.filter(r => r.canSend).length,
        alreadyPaid: tripDate.bookings.filter(b => b.remainingStatus === 'PAID').length,
        previouslySent: tripDate.bookings.filter(b => b.remainingEmailSentAt).length
      }
    })
  } catch (error) {
    console.error('Error fetching recipients:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת נמענים' },
      { status: 500 }
    )
  }
}
