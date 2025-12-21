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
    const trip = await prisma.trip.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      include: {
        tripDates: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!trip) return null

    return {
      ...trip,
      includedItems: safeParseJSON<string[]>(trip.includedItems, []),
      notIncludedItems: safeParseJSON<string[]>(trip.notIncludedItems, []),
      itinerarySteps: safeParseJSON<ItineraryDay[]>(trip.itinerarySteps, []),
      faqItems: safeParseJSON<FaqItem[]>(trip.faqItems, []),
      galleryImages: safeParseJSON<GalleryImage[]>(trip.galleryImages || null, []),
    }
  } catch (error) {
    console.error('Error fetching active trip:', error)
    return null
  }
}

// Default fallback data when no trip exists in DB
export const defaultTripData: TripData = {
  id: 'default',
  name: 'טיול לכפר האנגלי',
  slug: 'english-countryside',
  heroTitle: 'לונדון האחרת —\nחוויה שתישאר בלב',
  heroSubtitle: 'חופשה של יומיים בכפרים האנגליים + לילה במלון כפרי + יום שופינג באאוטלט מותגים',
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
    { src: '/images/trip/gallery-1.jpg', alt: 'נופי טבע אנגליים' },
    { src: '/images/trip/gallery-2.jpg', alt: 'כפר מורשת היסטורי' },
    { src: '/images/trip/gallery-3.jpg', alt: 'גבעות ירוקות' },
    { src: '/images/trip/gallery-4.jpg', alt: 'שביל בטבע' },
    { src: '/images/trip/gallery-5.jpg', alt: 'נקודת תצפית' },
    { src: '/images/trip/gallery-6.jpg', alt: 'אווירה כפרית' },
    { src: '/images/trip/gallery-7.jpg', alt: 'בית אבן עתיק' },
    { src: '/images/trip/gallery-8.jpg', alt: 'שקיעה בכפר' },
    { src: '/images/trip/gallery-9.jpg', alt: 'טבע אנגלי' },
  ],
  isActive: true,
  tripDates: [],
}
