import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { value } = await request.json()

    const setting = await prisma.settings.update({
      where: { id: params.id },
      data: { value },
    })

    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון הגדרה' },
      { status: 500 }
    )
  }
}
