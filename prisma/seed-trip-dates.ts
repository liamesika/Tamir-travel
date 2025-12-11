import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete existing trip dates and bookings
  await prisma.booking.deleteMany()
  await prisma.tripDate.deleteMany()

  console.log('Creating trip dates...')

  // Create 5 trip dates for testing
  const tripDate1 = await prisma.tripDate.create({
    data: {
      date: new Date('2025-01-25'),
      capacity: 25,
      reservedSpots: 0,
      pricePerPerson: 500, // 500 ₪ per person
      depositAmount: 300, // 300 ₪ deposit per person
    },
  })

  const tripDate2 = await prisma.tripDate.create({
    data: {
      date: new Date('2025-02-15'),
      capacity: 30,
      reservedSpots: 10, // Already has 10 people
      pricePerPerson: 500,
      depositAmount: 300,
    },
  })

  const tripDate3 = await prisma.tripDate.create({
    data: {
      date: new Date('2025-03-10'),
      capacity: 25,
      reservedSpots: 23, // Almost full - only 2 spots left
      pricePerPerson: 500,
      depositAmount: 300,
    },
  })

  const tripDate4 = await prisma.tripDate.create({
    data: {
      date: new Date('2025-03-28'),
      capacity: 35,
      reservedSpots: 0,
      pricePerPerson: 600, // More expensive trip
      depositAmount: 300,
    },
  })

  const tripDate5 = await prisma.tripDate.create({
    data: {
      date: new Date('2025-04-20'),
      capacity: 20,
      reservedSpots: 0,
      pricePerPerson: 450, // Cheaper trip
      depositAmount: 300,
    },
  })

  console.log('✅ Created 5 trip dates:')
  console.log('1. Jan 25, 2025 - 25 spots available (500₪/person)')
  console.log('2. Feb 15, 2025 - 20 spots available (10 reserved, 500₪/person)')
  console.log('3. Mar 10, 2025 - 2 spots available (23 reserved, 500₪/person)')
  console.log('4. Mar 28, 2025 - 35 spots available (600₪/person)')
  console.log('5. Apr 20, 2025 - 20 spots available (450₪/person)')
  console.log('')
  console.log('Trip dates created successfully!')
  console.log('')
  console.log('📍 Test the booking flow:')
  console.log('1. Go to: http://localhost:3000')
  console.log('2. Scroll to booking section')
  console.log('3. Select a trip date')
  console.log('4. Fill in your details:')
  console.log('   - Full Name: Test User')
  console.log('   - Email: test@example.com')
  console.log('   - Phone: 050-1234567')
  console.log('   - Participants: 2')
  console.log('5. Click "המשך לתשלום"')
  console.log('')
  console.log('💡 For testing Stripe:')
  console.log('   Card: 4242 4242 4242 4242')
  console.log('   Date: Any future date')
  console.log('   CVC: Any 3 digits')
  console.log('')
  console.log('📊 View bookings in admin:')
  console.log('   http://localhost:3000/admin')
  console.log('   Email: admin@tamir-trip.com')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
