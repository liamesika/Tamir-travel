import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await prisma.settings.findMany({
      orderBy: [
        { category: 'asc' },
        { label: 'asc' },
      ],
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת הגדרות' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const {
      key,
      value,
      type = 'text',
      category = 'general',
      label,
      description,
    } = data

    if (!key || !label) {
      return NextResponse.json(
        { error: 'חסרים שדות חובה' },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existing = await prisma.settings.findUnique({
      where: { key },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'מפתח כבר קיים במערכת' },
        { status: 400 }
      )
    }

    const setting = await prisma.settings.create({
      data: {
        key,
        value: value || '',
        type,
        category,
        label,
        description,
      },
    })

    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Error creating setting:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת הגדרה' },
      { status: 500 }
    )
  }
}
