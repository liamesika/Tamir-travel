import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  await prisma.tripDate.deleteMany()
  await prisma.admin.deleteMany()

  const tripDate1 = await prisma.tripDate.create({
    data: {
      date: new Date('2025-01-15'),
      capacity: 25,
      reservedSpots: 13,
      pricePerPerson: 500,
    },
  })

  const tripDate2 = await prisma.tripDate.create({
    data: {
      date: new Date('2025-02-10'),
      capacity: 25,
      reservedSpots: 5,
      pricePerPerson: 500,
    },
  })

  const tripDate3 = await prisma.tripDate.create({
    data: {
      date: new Date('2025-03-20'),
      capacity: 30,
      reservedSpots: 0,
      pricePerPerson: 500,
    },
  })

  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@tamir-trip.com',
      password: adminPassword,
      name: 'מנהל ראשי',
    },
  })

  console.log('Seed data created:', { tripDate1, tripDate2, tripDate3, admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
