import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 מנקה תאריכי טיולים ישנים שלא מקושרים לטיול...')

  // Delete all trip dates that don't have a tripId
  const result = await prisma.tripDate.deleteMany({
    where: {
      tripId: null,
    },
  })

  console.log(`✅ נמחקו ${result.count} תאריכים ישנים`)
  console.log('')
  console.log('💡 עכשיו תוכל ליצור טיולים חדשים דרך האדמין!')
  console.log('   1. לך ל: http://localhost:3000/admin/trips')
  console.log('   2. לחץ "טיול חדש"')
  console.log('   3. צור טיול ואז הוסף תאריכים בעמוד העריכה')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
