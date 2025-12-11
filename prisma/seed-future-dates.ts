import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete existing trip dates and bookings
  await prisma.booking.deleteMany()
  await prisma.tripDate.deleteMany()

  console.log('Creating future trip dates...')

  const now = new Date()

  // Create dates starting from next month
  const tripDate1 = await prisma.tripDate.create({
    data: {
      date: new Date(2026, 0, 15), // Jan 15, 2026
      capacity: 25,
      reservedSpots: 0,
      pricePerPerson: 500,
      depositAmount: 300,
    },
  })

  const tripDate2 = await prisma.tripDate.create({
    data: {
      date: new Date(2026, 1, 10), // Feb 10, 2026
      capacity: 30,
      reservedSpots: 10,
      pricePerPerson: 500,
      depositAmount: 300,
    },
  })

  const tripDate3 = await prisma.tripDate.create({
    data: {
      date: new Date(2026, 2, 5), // Mar 5, 2026
      capacity: 25,
      reservedSpots: 23,
      pricePerPerson: 500,
      depositAmount: 300,
    },
  })

  const tripDate4 = await prisma.tripDate.create({
    data: {
      date: new Date(2026, 2, 25), // Mar 25, 2026
      capacity: 35,
      reservedSpots: 0,
      pricePerPerson: 600,
      depositAmount: 300,
    },
  })

  const tripDate5 = await prisma.tripDate.create({
    data: {
      date: new Date(2026, 3, 18), // Apr 18, 2026
      capacity: 20,
      reservedSpots: 0,
      pricePerPerson: 450,
      depositAmount: 300,
    },
  })

  console.log('✅ Created 5 future trip dates:')
  console.log('1. Jan 15, 2026 - 25 spots available (500₪/person)')
  console.log('2. Feb 10, 2026 - 20 spots available (10 reserved, 500₪/person)')
  console.log('3. Mar 5, 2026 - 2 spots available (23 reserved, 500₪/person)')
  console.log('4. Mar 25, 2026 - 35 spots available (600₪/person)')
  console.log('5. Apr 18, 2026 - 20 spots available (450₪/person)')
  console.log('')
  console.log('✨ Trip dates created successfully!')
  console.log('')
  console.log('📍 Now go to: http://localhost:3000')
  console.log('   Scroll to "הרשמה לטיול" section')
  console.log('   You should see the trip dates dropdown!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
