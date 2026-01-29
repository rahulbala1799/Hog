import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Map CSV categories to database categories
const categoryMap: { [key: string]: string } = {
  'Misc': 'Misc Costs',
  'Marketing': 'Marketing',
  'Wages': 'Wages',
}

interface CSVExpense {
  Date: string
  Name: string
  AMOUNT: string
  Category: string
}

async function importExpenses() {
  try {
    console.log('Starting expense import...\n')

    // Read CSV file
    const csvPath = '/Users/rahul/Downloads/financial_data 2.csv'
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse CSV
    const lines = csvContent.trim().split('\n')
    const headers = lines[0].split(',')
    const expenses: CSVExpense[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length >= 4) {
        expenses.push({
          Date: values[0].trim(),
          Name: values[1].trim(),
          AMOUNT: values[2].trim(),
          Category: values[3].trim(),
        })
      }
    }

    console.log(`Found ${expenses.length} expenses to import\n`)

    // Get or create an admin user (we'll use the first admin user)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    if (!adminUser) {
      throw new Error('No admin user found. Please create an admin user first.')
    }

    console.log(`Using admin user: ${adminUser.name} (${adminUser.email})\n`)

    // Get or create categories
    const categoryCache: { [key: string]: string } = {}
    
    for (const csvCategory of Object.values(categoryMap)) {
      const category = await prisma.expenseCategory.upsert({
        where: { name: csvCategory },
        update: {},
        create: { name: csvCategory },
      })
      categoryCache[csvCategory] = category.id
      console.log(`✓ Category ready: ${csvCategory}`)
    }

    console.log('\nImporting expenses...\n')

    // Import expenses
    let imported = 0
    let skipped = 0

    for (const expense of expenses) {
      try {
        // Map category
        const dbCategory = categoryMap[expense.Category]
        if (!dbCategory) {
          console.log(`⚠ Skipping: ${expense.Name} - Unknown category: ${expense.Category}`)
          skipped++
          continue
        }

        const categoryId = categoryCache[dbCategory]

        // Parse date (format: DD/MM/YYYY)
        const [day, month, year] = expense.Date.split('/')
        const expenseDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

        // Parse amount
        const amount = parseFloat(expense.AMOUNT)

        if (isNaN(amount)) {
          console.log(`⚠ Skipping: ${expense.Name} - Invalid amount: ${expense.AMOUNT}`)
          skipped++
          continue
        }

        // Check if expense already exists (by description and date)
        const existing = await prisma.expense.findFirst({
          where: {
            description: expense.Name,
            date: expenseDate,
            amount: amount,
          },
        })

        if (existing) {
          console.log(`⊘ Skipped (exists): ${expense.Name} - ₹${amount} on ${expense.Date}`)
          skipped++
          continue
        }

        // Create expense
        await prisma.expense.create({
          data: {
            description: expense.Name,
            amount: amount,
            date: expenseDate,
            categoryId: categoryId,
            createdById: adminUser.id,
          },
        })

        console.log(`✓ Imported: ${expense.Name} - ₹${amount} (${dbCategory}) on ${expense.Date}`)
        imported++
      } catch (error: any) {
        console.error(`✗ Error importing ${expense.Name}:`, error.message)
        skipped++
      }
    }

    console.log(`\n✅ Import complete!`)
    console.log(`   Imported: ${imported}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`   Total: ${expenses.length}`)
  } catch (error) {
    console.error('Error importing expenses:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

importExpenses()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
