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
  heroTitle: 'לונדון? לא זו שאתם מכירים.',
  heroSubtitle: 'טיול בן יומיים לצד הנסתר של לונדון — טבע עוצר נשימה, כפרים היסטוריים, נופים ירוקים ויום שופינג באאוטלטים במחירים שלא תמצאו בעיר',
  heroImage: '/images/hero-poster.jpg',
  guideTitle: 'היי, אני תמיר',
  guideContent: `אחרי שנים של מגורים באנגליה, הבנתי שרוב הישראלים שמגיעים ללונדון רואים רק את העיר הגדולה — את הביג בן, את הארמונות, את הרחובות הסואנים.

אבל אני התאהבתי בצד אחר לגמרי: בכפרים הקטנים עם בתי האבן, בגבעות הירוקות שמשתרעות עד האופק, בפאבים המקומיים שבהם עוד מדברים על מזג האוויר כאילו זה הדבר הכי מרגש בעולם.

יצרתי את הטיול הזה כי רציתי לחשוף את לונדון האחרת — זו שגרמה לי להתאהב במקום. לשלב טבע, מורשת, ואפילו שופינג מטורף באאוטלטים שהמקומיים מכירים.

כל טיול הוא עבורי הזדמנות לחלוק את המקומות האהובים עליי, לספר סיפורים, ולתת לכם לחוות את אנגליה כמו שאני חווה אותה — אותנטית, ירוקה ומפתיעה.`,
  guideImage: '/images/trip/tamir.jpg',
  includedItems: [
    'לינה במקום מוקף טבע',
    'ארוחת בוקר אנגלית מלאה',
    'הסעה מלונדון וחזרה',
    'ליווי והדרכה לאורך כל הטיול',
    'סיור בכפרי מורשת היסטוריים',
    'גישה לנקודות תצפית מיוחדות',
    'יום שופינג באאוטלטים',
  ],
  notIncludedItems: [
    'טיסות ללונדון',
    'ארוחות נוספות (מלבד ארוחת בוקר)',
    'כניסה לאטרקציות בתשלום',
    'הוצאות אישיות ושופינג',
  ],
  itinerarySteps: [
    {
      day: 'יום ראשון',
      title: 'יוצאים לטבע',
      activities: [
        { icon: 'Car', title: 'איסוף מלונדון', description: 'נקודת מפגש מרכזית בלונדון. יוצאים לדרך!' },
        { icon: 'TreePine', title: 'נסיעה לאזורי הטבע', description: 'נוסעים צפונה/מערבה לעבר הכפר האנגלי האותנטי' },
        { icon: 'Camera', title: 'נקודות תצפית ונופים', description: 'עצירות בנקודות מיוחדות עם נופים ירוקים עוצרי נשימה' },
        { icon: 'MapPin', title: 'כפרי מורשת היסטוריים', description: 'סיור בכפרים עתיקים, בתי אבן, פאבים מקומיים ואווירה אנגלית אותנטית' },
        { icon: 'Home', title: 'לינה במקום קסום', description: 'לינה באווירה כפרית, מוקפים בטבע ושקט' },
      ],
    },
    {
      day: 'יום שני',
      title: 'טבע ושופינג',
      activities: [
        { icon: 'Coffee', title: 'ארוחת בוקר', description: 'ארוחת בוקר אנגלית מלאה במקום הלינה' },
        { icon: 'Sunrise', title: 'בוקר בטבע', description: 'המשך גילוי אזורי הטבע והנופים הירוקים' },
        { icon: 'ShoppingBag', title: 'אאוטלטים בלב הטבע', description: 'יום שופינג מלא באאוטלטים גדולים באזורים כפריים — מחירים שלא תמצאו בלונדון!' },
        { icon: 'Car', title: 'חזרה ללונדון', description: 'חוזרים עמוסים בחוויות, תמונות ושקיות קניות' },
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
