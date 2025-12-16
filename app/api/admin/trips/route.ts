import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        tripDates: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ trips })
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { error: 'שגיאה בטעינת טיולים' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const {
      name,
      slug,
      heroTitle,
      heroSubtitle,
      heroImage,
      guideTitle,
      guideContent,
      guideImage,
      includedItems,
      notIncludedItems,
      itinerarySteps,
      faqItems,
      galleryImages,
      isActive = true,
    } = data

    if (!name || !slug || !heroTitle || !heroSubtitle) {
      return NextResponse.json(
        { error: 'חסרים שדות חובה' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingTrip = await prisma.trip.findUnique({
      where: { slug },
    })

    if (existingTrip) {
      return NextResponse.json(
        { error: 'סלאג כבר קיים במערכת' },
        { status: 400 }
      )
    }

    const trip = await prisma.trip.create({
      data: {
        name,
        slug,
        heroTitle,
        heroSubtitle,
        heroImage: heroImage || '',
        guideTitle: guideTitle || '',
        guideContent: guideContent || '',
        guideImage: guideImage || '',
        includedItems: includedItems || '',
        notIncludedItems: notIncludedItems || '',
        itinerarySteps: itinerarySteps || '',
        faqItems: faqItems || '',
        galleryImages: galleryImages || '',
        isActive,
      },
    })

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json(
      { error: 'שגיאה ביצירת טיול' },
      { status: 500 }
    )
  }
}
