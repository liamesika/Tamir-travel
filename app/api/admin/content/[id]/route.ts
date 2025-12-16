import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { value } = await request.json()

    if (!value) {
      return NextResponse.json(
        { error: 'ערך חסר' },
        { status: 400 }
      )
    }

    const contentBlock = await prisma.contentBlock.update({
      where: { id: params.id },
      data: { value },
    })

    return NextResponse.json({ contentBlock })
  } catch (error) {
    console.error('Error updating content block:', error)
    return NextResponse.json(
      { error: 'שגיאה בעדכון בלוק תוכן' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contentBlock.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content block:', error)
    return NextResponse.json(
      { error: 'שגיאה במחיקת בלוק תוכן' },
      { status: 500 }
    )
  }
}
