import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Account records...\n')

  const accounts = await prisma.account.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })

  console.log(`Found ${accounts.length} account(s):\n`)

  if (accounts.length === 0) {
    console.log('❌ No accounts found!')
  } else {
    accounts.forEach((account, index) => {
      console.log(`${index + 1}. Account ID: ${account.id}`)
      console.log(`   User: ${account.user.email} (${account.user.name})`)
      console.log(`   Provider: ${account.providerId}`)
      console.log(`   Account ID: ${account.accountId}`)
      console.log(`   Has Password: ${account.password ? 'Yes' : 'No'}`)
      console.log('')
    })
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
