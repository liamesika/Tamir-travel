import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const content = await prisma.contentBlock.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת תוכן' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { key, value, type = 'text', category = 'general' } = data

    if (!key || !value) {
      return NextResponse.json(
        { error: 'חסרים שדות חובה' },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existing = await prisma.contentBlock.findUnique({
      where: { key },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'מפתח כבר קיים במערכת' },
        { status: 400 }
      )
    }

    const contentBlock = await prisma.contentBlock.create({
      data: {
        key,
        value,
        type,
        category,
      },
    })

    return NextResponse.json({ contentBlock })
  } catch (error) {
    console.error('Error creating content block:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת בלוק תוכן' },
      { status: 500 }
    )
  }
}
