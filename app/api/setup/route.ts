import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.SETUP_SECRET && secret !== 'tamir2024setup') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if admin exists
    const existingAdmin = await prisma.admin.findFirst()

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
