import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function populateIssueNumbers() {
  try {
    console.log('Populating issue numbers for existing bookings...')

    // Get all bookings ordered by creation date
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })

    console.log(`Found ${bookings.length} bookings to process`)

    // Group bookings by year
    const bookingsByYear: { [year: string]: typeof bookings } = {}
    
    for (const booking of bookings) {
      const year = new Date(booking.sessionDate).getFullYear().toString().slice(-2)
      if (!bookingsByYear[year]) {
        bookingsByYear[year] = []
      }
      bookingsByYear[year].push(booking)
    }

    // Generate issue numbers for each year
    for (const [year, yearBookings] of Object.entries(bookingsByYear)) {
      let sequenceNumber = 1
      
      for (const booking of yearBookings) {
        const issueNumber = `HOG-${year}-${sequenceNumber.toString().padStart(3, '0')}`
        
        await prisma.booking.update({
          where: { id: booking.id },
          data: { issueNumber },
        })
        
        console.log(`✓ ${booking.studentName}: ${issueNumber}`)
        sequenceNumber++
      }
    }

    console.log(`\nSuccessfully populated issue numbers for ${bookings.length} bookings`)
  } catch (error) {
    console.error('Error populating issue numbers:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

populateIssueNumbers()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
