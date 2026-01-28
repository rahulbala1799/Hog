import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Migrating users to Better Auth Account model...\n')

  // Get all users that don't have an account record
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
    },
  })

  console.log(`Found ${users.length} user(s) to check\n`)

  let migrated = 0
  let skipped = 0

  for (const user of users) {
    // Check if user already has a credential account
    const hasCredentialAccount = user.accounts.some(
      (acc) => acc.providerId === 'credential'
    )

    if (hasCredentialAccount) {
      console.log(`⏭️  Skipping ${user.email} - already has credential account`)
      skipped++
      continue
    }

    // Create Account record for this user
    try {
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email, // Use email as accountId
          providerId: 'credential', // Better Auth uses 'credential' for email/password
          password: user.password, // Copy password from User to Account
        },
      })

      console.log(`✅ Migrated ${user.email} to Account model`)
      migrated++
    } catch (error) {
      console.error(`❌ Failed to migrate ${user.email}:`, error)
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Migrated: ${migrated}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`\n✅ Migration complete!`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
