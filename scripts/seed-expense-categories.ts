import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding expense categories...')

  const categories = [
    'Cost of Sale',
    'Cost Of Sale',
    'Rent',
    'Marketing',
    'Wages',
    'Misc Costs',
  ]

  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    console.log(`✓ Created/Updated category: ${name}`)
  }

  console.log('✅ Expense categories seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding expense categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
