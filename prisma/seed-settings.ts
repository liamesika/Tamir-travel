import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete existing settings
  await prisma.settings.deleteMany()

  const settings = [
    // Business
    {
      key: 'business_name',
      value: 'תמיר טריפ',
      type: 'text',
      category: 'business',
      label: 'שם העסק',
      description: 'שם העסק שיופיע באתר',
    },
    {
      key: 'business_description',
      value: 'טיולים מודרכים בטבע הישראלי',
      type: 'textarea',
      category: 'business',
      label: 'תיאור העסק',
      description: 'תיאור קצר של העסק',
    },

    // Contact
    {
      key: 'contact_email',
      value: 'info@tamir-trip.com',
      type: 'email',
      category: 'contact',
      label: 'אימייל',
      description: 'כתובת אימייל ליצירת קשר',
    },
    {
      key: 'contact_phone',
      value: '050-1234567',
      type: 'phone',
      category: 'contact',
      label: 'טלפון',
      description: 'מספר טלפון ליצירת קשר',
    },
    {
      key: 'contact_whatsapp',
      value: '050-1234567',
      type: 'phone',
      category: 'contact',
      label: 'וואטסאפ',
      description: 'מספר וואטסאפ ליצירת קשר',
    },

    // Branding
    {
      key: 'brand_primary_color',
      value: '#1e40af',
      type: 'color',
      category: 'branding',
      label: 'צבע ראשי',
      description: 'צבע ראשי של המותג',
    },
    {
      key: 'brand_secondary_color',
      value: '#f97316',
      type: 'color',
      category: 'branding',
      label: 'צבע משני',
      description: 'צבע משני של המותג',
    },
    {
      key: 'brand_logo_url',
      value: '/images/logo.png',
      type: 'text',
      category: 'branding',
      label: 'לוגו',
      description: 'כתובת URL ללוגו (או העלה במדיה)',
    },

    // Payment
    {
      key: 'payment_stripe_mode',
      value: 'test',
      type: 'toggle',
      category: 'payment',
      label: 'מצב Stripe',
      description: 'false = מצב בדיקה, true = מצב לייב',
    },
    {
      key: 'payment_deposit_percentage',
      value: '60',
      type: 'text',
      category: 'payment',
      label: 'אחוז מקדמה',
      description: 'אחוז המקדמה מסך התשלום (0-100)',
    },

    // Advanced
    {
      key: 'advanced_booking_enabled',
      value: 'true',
      type: 'toggle',
      category: 'advanced',
      label: 'הזמנות פעילות',
      description: 'אפשר או השבת הזמנות חדשות',
    },
    {
      key: 'advanced_maintenance_mode',
      value: 'false',
      type: 'toggle',
      category: 'advanced',
      label: 'מצב תחזוקה',
      description: 'הפעל מצב תחזוקה (האתר לא יהיה זמין)',
    },
  ]

  for (const setting of settings) {
    await prisma.settings.create({ data: setting })
  }

  console.log('Settings seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
