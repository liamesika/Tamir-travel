import { prisma } from './prisma'

export interface ItineraryActivity {
  icon: string
  title: string
  description: string
}

export interface ItineraryDay {
  day: string
  title: string
  activities: ItineraryActivity[]
}

export interface FaqItem {
  question: string
  answer: string | string[]
}

export interface GalleryImage {
  src: string
  alt: string
}

export interface TripData {
  id: string
  name: string
  slug: string
  heroTitle: string
  heroSubtitle: string
  heroImage: string | null
  guideTitle: string
  guideContent: string
  guideImage: string | null
  includedItems: string[]
  notIncludedItems: string[]
  itinerarySteps: ItineraryDay[]
  faqItems: FaqItem[]
  galleryImages: GalleryImage[]
  isActive: boolean
  tripDates: {
    id: string
    date: Date
    capacity: number
    reservedSpots: number
    pricePerPerson: number
    depositAmount: number
    status: string
  }[]
}

function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export async function getActiveTrip(): Promise<TripData | null> {
  try {
    // First try to find an active trip
    let trip = await prisma.trip.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        tripDates: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { date: 'asc' },
        },
      },
    })

    // If no active trip, check if there's only one trip (show it anyway)
    if (!trip) {
      const tripCount = await prisma.trip.count()
      if (tripCount === 1) {
        trip = await prisma.trip.findFirst({
          include: {
            tripDates: {
              where: { status: { not: 'CANCELLED' } },
              orderBy: { date: 'asc' },
            },
          },
        })
        if (trip) {
          console.log(`[TRIP-DATA] Showing single trip (id: ${trip.id}, slug: ${trip.slug}) even though isActive=false`)
        }
      } else if (tripCount > 1) {
        // Multiple trips but none active - get most recently updated
        trip = await prisma.trip.findFirst({
          orderBy: { updatedAt: 'desc' },
          include: {
            tripDates: {
              where: { status: { not: 'CANCELLED' } },
              orderBy: { date: 'asc' },
            },
          },
        })
        if (trip) {
          console.log(`[TRIP-DATA] No active trip, falling back to most recent (id: ${trip.id}, slug: ${trip.slug})`)
        }
      }
    }

    if (!trip) {
      console.log('[TRIP-DATA] No trips found in database, using default fallback')
      return null
    }

    console.log(`[TRIP-DATA] Rendering trip: id=${trip.id}, slug=${trip.slug}, isActive=${trip.isActive}`)

    return {
      ...trip,
      includedItems: safeParseJSON<string[]>(trip.includedItems, []),
      notIncludedItems: safeParseJSON<string[]>(trip.notIncludedItems, []),
      itinerarySteps: safeParseJSON<ItineraryDay[]>(trip.itinerarySteps, []),
      faqItems: safeParseJSON<FaqItem[]>(trip.faqItems, []),
      galleryImages: safeParseJSON<GalleryImage[]>(trip.galleryImages || null, []),
    }
  } catch (error) {
    console.error('[TRIP-DATA] Error fetching active trip:', error)
    return null
  }
}

// Default fallback data when no trip exists in DB
export const defaultTripData: TripData = {
  id: 'default',
  name: 'טיול לכפר האנגלי',
  slug: 'english-countryside',
  heroTitle: 'מחוץ ללונדון',
  heroSubtitle: 'טיול אל הכפרים הציוריים – יומיים עם לינה',
  heroImage: '/images/hero-poster.jpg',
  guideTitle: 'תמיר ארמאני',
  guideContent: `חי על הקו תל אביב–לונדון כבר למעלה מעשור, ומכיר את אנגליה כמו את כף היד.

גיליתי שרוב הישראלים שמגיעים ללונדון מפספסים את הדבר הכי יפה שיש לה להציע — את הכפרים העתיקים, הטבע הירוק והשקט שמחוץ לעיר הגדולה.

יצרתי את הטיול הזה כדי לתת לכם פתרון מלא — בלי רכב, בלי נהיגה בצד שמאל, בלי תכנון מסובך. פשוט להגיע וליהנות.

שילוב מושלם של טבע אנגלי אותנטי ושופינג חכם באאוטלטים — הכל בחבילה אחת, עם ליווי אישי לאורך כל הדרך.`,
  guideImage: '/images/trip/tamir.jpg',
  includedItems: [
    'לינה במקום מוקף טבע',
    'ארוחת בוקר במלון',
    'הסעה הלוך חזור מלונדון',
    'ליווי צמוד',
    'סיור בכפרים',
    'יום שופינג באאוטלט',
  ],
  notIncludedItems: [
    'טיסות',
    'ארוחות נוספות',
    'כניסה לאטרקציות בתשלום',
    'הוצאות אישיות',
  ],
  itinerarySteps: [
    {
      day: 'יום ראשון',
      title: 'יוצאים לכפר האנגלי',
      activities: [
        { icon: 'Car', title: 'איסוף מלונדון (Tower Hill)', description: 'נפגשים בבוקר ויוצאים לדרך!' },
        { icon: 'TreePine', title: 'נסיעה של כשעתיים לכפרים', description: 'נוסעים לעבר הכפר האנגלי האותנטי' },
        { icon: 'MapPin', title: 'סיור בכפרים עתיקים', description: 'בתי אבן, נחלים, אווירה אנגלית קסומה' },
        { icon: 'Coffee', title: 'זמן חופשי', description: 'מסעדות וחנויות מקומיות בקצב שלכם' },
        { icon: 'Home', title: 'לינה במקום כפרי', description: 'לינה מוקפת טבע ושקט' },
      ],
    },
    {
      day: 'יום שני',
      title: 'בוקר בטבע + שופינג',
      activities: [
        { icon: 'Coffee', title: 'ארוחת בוקר אנגלית מלאה', description: 'ארוחת בוקר במלון' },
        { icon: 'Sunrise', title: 'קפה בעיירה כפרית', description: 'בוקר רגוע לפני השופינג' },
        { icon: 'ShoppingBag', title: 'יום שופינג באאוטלט מותגים', description: '150+ חנויות, הנחות עד 70%' },
        { icon: 'Car', title: 'חזרה ללונדון (Tower Hill)', description: 'חוזרים עמוסים בחוויות ושקיות קניות' },
      ],
    },
  ],
  faqItems: [
    {
      question: 'מהיכן הטיול יוצא?',
      answer: [
        'הטיול יוצא בשעה 08:00 בבוקר מתחנת Tower Hill בלונדון, שם יאסוף אתכם המיניבוס שלנו.',
        'נקודה מדויקת תשלח אליכם בווטסאפ.',
        'החזרה תתבצע ביום שלמחרת בשעות הערב, גם כן לאותה תחנה.',
      ],
    },
    {
      question: 'מה התשלום כולל?',
      answer: [
        '• מיניבוס צמוד למשך יומיים',
        '• מדריך מלווה לאורך כל הטיול',
        '• לינה של לילה אחד במלון',
        '• ארוחת בוקר במלון',
      ],
    },
    {
      question: 'מהי רמת הקושי של הטיול?',
      answer: ['רמת קושי: קלה מאוד', 'הליכה קלה במסלול נוח, ללא קטעים מאתגרים או מאמץ פיזי מיוחד ולכן הטיול מתאים לכל גיל.'],
    },
    {
      question: 'כמה משתתפים יהיו בקבוצה?',
      answer: 'הטיול מתקיים בקבוצות קטנות של 15–30 משתתפים, במיניבוס מותאם, המאפשר חוויה אישית ונוחה גם בכבישים הצרים בכפרים.',
    },
    {
      question: 'איך מתבצע התשלום?',
      answer: [
        'על מנת להבטיח את מקומכם בטיול, יש לשלם מקדמה בסך 300 ₪ לאדם.',
        'לאחר הגעה למינימום של 15 משתתפים, תישלח אליכם הודעה עם לינק לתשלום יתרת הסכום.',
      ],
    },
  ],
  galleryImages: [
    { src: '/new/IMG_9843.JPG', alt: 'נופי טבע אנגליים' },
    { src: '/new/IMG_0348.JPG', alt: 'כפר אנגלי ציורי' },
    { src: '/new/IMG_0349.JPG', alt: 'בתי אבן עתיקים' },
    { src: '/new/IMG_0350.JPG', alt: 'אווירה כפרית אותנטית' },
    { src: '/new/IMG_0351.JPG', alt: 'רחובות הכפר' },
    { src: '/new/IMG_0352.JPG', alt: 'מורשת אנגלית' },
    { src: '/new/IMG_0353.JPG', alt: 'נופים ירוקים' },
    { src: '/new/IMG_0354.JPG', alt: 'אדריכלות כפרית' },
    { src: '/new/IMG_0355.JPG', alt: 'קסם הכפר האנגלי' },
    { src: '/new/IMG_0356.JPG', alt: 'חוויה בלתי נשכחת' },
    { src: '/new/IMG_0357.JPG', alt: 'הכפרים האנגליים' },
  ],
  isActive: true,
  tripDates: [],
}
