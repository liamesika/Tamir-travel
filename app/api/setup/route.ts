import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createTablesSQL = `
-- Create Admin table
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");

-- Create Trip table
CREATE TABLE IF NOT EXISTS "Trip" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroImage" TEXT,
    "guideTitle" TEXT NOT NULL,
    "guideContent" TEXT NOT NULL,
    "guideImage" TEXT,
    "includedItems" TEXT NOT NULL,
    "notIncludedItems" TEXT NOT NULL,
    "itinerarySteps" TEXT NOT NULL,
    "faqItems" TEXT NOT NULL,
    "galleryImages" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Trip_slug_key" ON "Trip"("slug");

-- Create TripDate table
CREATE TABLE IF NOT EXISTS "TripDate" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "reservedSpots" INTEGER NOT NULL DEFAULT 0,
    "pricePerPerson" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL DEFAULT 300,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TripDate_pkey" PRIMARY KEY ("id")
);

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Create Booking table
CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL,
    "tripDateId" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "participantsCount" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "depositStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "remainingAmount" INTEGER NOT NULL DEFAULT 0,
    "remainingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "remainingDueDate" TIMESTAMP(3),
    "remainingPaidAt" TIMESTAMP(3),
    "paymentToken" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "remainingPaymentIntentId" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "whatsappSent" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_paymentToken_key" ON "Booking"("paymentToken");

-- Create Payment table
CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "stripePaymentIntentId" TEXT,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Create ContentBlock table
CREATE TABLE IF NOT EXISTS "ContentBlock" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ContentBlock_key_key" ON "ContentBlock"("key");

-- Create Settings table
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "category" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Settings_key_key" ON "Settings"("key");

-- Create Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Create Media table
CREATE TABLE IF NOT EXISTS "Media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "alt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
DO $$ BEGIN
    ALTER TABLE "TripDate" ADD CONSTRAINT "TripDate_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tripDateId_fkey" FOREIGN KEY ("tripDateId") REFERENCES "TripDate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const action = request.nextUrl.searchParams.get('action')

  if (secret !== process.env.SETUP_SECRET && secret !== 'tamir2024setup') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Test connection
    if (action === 'test') {
      try {
        await prisma.$queryRaw`SELECT 1`
        return NextResponse.json({ status: 'connected', message: 'Database connection successful' })
      } catch (e: any) {
        return NextResponse.json({ status: 'failed', message: e.message })
      }
    }

    // Create tables
    if (action === 'migrate') {
      try {
        await prisma.$executeRawUnsafe(createTablesSQL)
        return NextResponse.json({ status: 'success', message: 'Tables created successfully' })
      } catch (e: any) {
        return NextResponse.json({ status: 'failed', message: e.message }, { status: 500 })
      }
    }

    // Check if admin exists
    let existingAdmin
    try {
      existingAdmin = await prisma.admin.findFirst()
    } catch (e: any) {
      // Table might not exist
      return NextResponse.json({
        error: 'Tables not created',
        message: 'Run with ?action=migrate first',
        details: e.message
      }, { status: 500 })
    }

    if (existingAdmin) {
      return NextResponse.json({
        status: 'already_setup',
        message: 'Admin already exists',
        adminEmail: existingAdmin.email
      })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@tamir-trip.com',
        password: hashedPassword,
        name: 'מנהל ראשי',
        role: 'admin',
      },
    })

    return NextResponse.json({
      status: 'success',
      message: 'Admin created successfully',
      adminEmail: admin.email
    })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json({
      error: 'Setup failed',
      details: error.message
    }, { status: 500 })
  }
}
