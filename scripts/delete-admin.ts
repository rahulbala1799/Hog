import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Deleting admin users...\n')

  // Find all admin users
  const admins = await prisma.user.findMany({
    where: {
      role: Role.ADMIN,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  if (admins.length === 0) {
    console.log('✅ No admin users found. Nothing to delete.')
    return
  }

  console.log(`Found ${admins.length} admin user(s):`)
  admins.forEach((admin, index) => {
    console.log(`   ${index + 1}. ${admin.name} (${admin.email})`)
  })

  // Delete all admin users
  const result = await prisma.user.deleteMany({
    where: {
      role: Role.ADMIN,
    },
  })

  console.log(`\n✅ Deleted ${result.count} admin user(s).`)
  console.log(`\nYou can now create a new admin via the signup page.`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
