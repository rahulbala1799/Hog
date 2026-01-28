import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking users in database...\n')

  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  console.log(`Found ${users.length} user(s):\n`)

  if (users.length === 0) {
    console.log('✅ No users found. You can create the first admin.')
  } else {
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   Role: ${user.role}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log('')
    })

    // Check for admins
    const admins = users.filter(u => u.role === Role.ADMIN)
    console.log(`\n📊 Summary:`)
    console.log(`   Total users: ${users.length}`)
    console.log(`   Admins: ${admins.length}`)
    console.log(`   Staff: ${users.filter(u => u.role === Role.STAFF).length}`)

    if (admins.length > 0) {
      console.log(`\n⚠️  Admin user(s) found. Sign-up is currently disabled.`)
      console.log(`\nTo enable sign-up, you can:`)
      console.log(`1. Delete the admin user(s)`)
      console.log(`2. Change their role to STAFF`)
      console.log(`3. Or update the signup logic to allow multiple admins`)
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
