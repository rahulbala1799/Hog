import { PrismaClient, SessionTime, BookingType, BookingStatus } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

interface BookingRow {
  date: string // "16th Jan"
  day: string // "Friday"
  slot: string // "7-8 PM" or "9-10 PM"
  name: string // "Sachin, Shruthi, Sheena, Arjun" or single name
  contact: string // Phone number or empty
  pax: number
  notes: string // Notes like "Riji's friend", "Blogger", etc.
}

// Parse date from "16th Jan" format to Date object for 2026
function parseDate(dateStr: string): Date {
  const months: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  }

  // Extract day and month
  const match = dateStr.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+)/)
  if (!match) {
    throw new Error(`Invalid date format: ${dateStr}`)
  }

  const day = parseInt(match[1])
  const monthStr = match[2]
  const month = months[monthStr]

  if (month === undefined) {
    throw new Error(`Invalid month: ${monthStr}`)
  }

  // Create date for 2026
  const date = new Date(2026, month, day, 19, 0, 0) // 7 PM default time
  return date
}

// Map slot to SessionTime
function mapSlotToSessionTime(slot: string): SessionTime {
  if (slot.includes('7-8') || slot.includes('7:00') || slot.includes('7:00 PM')) {
    return SessionTime.SESSION_1
  } else if (slot.includes('9-10') || slot.includes('9:00') || slot.includes('9:00 PM')) {
    return SessionTime.SESSION_2
  }
  throw new Error(`Invalid slot format: ${slot}`)
}

// Determine booking type from notes
function getBookingType(notes: string, name: string): BookingType {
  const lowerNotes = notes.toLowerCase()
  const lowerName = name.toLowerCase()
  
  if (lowerNotes.includes('blogger') || lowerName.includes('blogger')) {
    return BookingType.INFLUENCER
  }
  if (lowerNotes.includes('gift') || lowerNotes.includes('gifts')) {
    return BookingType.GIFTS
  }
  return BookingType.REGULAR
}

// Booking data from the PDF
const bookingsData: BookingRow[] = [
  // January 16-21
  { date: '16th Jan', day: 'Friday', slot: '7-8 PM', name: 'Sachin, Shruthi, Sheena, Arjun', contact: '', pax: 4, notes: '' },
  { date: '16th Jan', day: 'Friday', slot: '7-8 PM', name: 'Renu & Indu', contact: '', pax: 2, notes: "Riji's friend" },
  { date: '16th Jan', day: 'Friday', slot: '7-8 PM', name: 'Adithya', contact: '7736253176', pax: 4, notes: '' },
  { date: '17th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Blogger', contact: '9207795474', pax: 0, notes: '' },
  { date: '17th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Thomas Tom', contact: '9746493085', pax: 4, notes: '' },
  { date: '17th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Zachariah', contact: '8682033900', pax: 2, notes: '' },
  { date: '17th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Blogger', contact: '9846397539', pax: 2, notes: '' },
  { date: '18th Jan', day: 'Sunday', slot: '9-10 PM', name: 'Karolina', contact: '', pax: 2, notes: '' },
  { date: '18th Jan', day: 'Sunday', slot: '7-8 PM', name: 'Blogger', contact: '', pax: 2, notes: '' },
  { date: '18th Jan', day: 'Sunday', slot: '7-8 PM', name: 'Nikhitha', contact: '', pax: 2, notes: '' },
  { date: '18th Jan', day: 'Sunday', slot: '7-8 PM', name: 'Sunday Sync', contact: '', pax: 8, notes: '' },
  { date: '19th Jan', day: 'Monday', slot: '9-10 PM', name: 'Fareeda', contact: '9605347367', pax: 2, notes: '' },
  { date: '21st Jan', day: 'Wednesday', slot: '9-10 PM', name: 'Angeline', contact: '9746641826', pax: 2, notes: '' },
  { date: '21st Jan', day: 'Wednesday', slot: '7-8 PM', name: 'Ayesha', contact: '9497815694', pax: 2, notes: '' },
  
  // January 24-28
  { date: '24th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Febin', contact: '6282582265', pax: 1, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Kathirma', contact: '8086359388', pax: 2, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Subin', contact: '9847015999', pax: 1, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Chandni', contact: '9900992487', pax: 2, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Susan & Steve', contact: '61432288407', pax: 2, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Rani Ram', contact: '9389303271', pax: 1, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Kalai friends', contact: '', pax: 3, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Mariya', contact: '7736017448', pax: 2, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '7-8 PM', name: 'Tom', contact: '', pax: 1, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '9-10 PM', name: 'John Joji', contact: '9744243958', pax: 2, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '9-10 PM', name: 'Abi', contact: '', pax: 1, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '9-10 PM', name: 'Gayatri', contact: '9539234725', pax: 2, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '9-10 PM', name: 'Mischel', contact: '6235217072', pax: 3, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '9-10 PM', name: 'Mirzad', contact: '7510510864', pax: 2, notes: '' },
  { date: '24th Jan', day: 'Saturday', slot: '9-10 PM', name: 'Vishnu', contact: '8592904306', pax: 2, notes: '' },
  { date: '27th Jan', day: 'Tuesday', slot: '7-8 PM', name: 'Agnel', contact: '', pax: 3, notes: '' },
  { date: '28th Jan', day: 'Wednesday', slot: '7-8 PM', name: 'Keviya', contact: '9846029748', pax: 2, notes: '' },
  { date: '28th Jan', day: 'Wednesday', slot: '7-8 PM', name: 'Kiran', contact: '8075980219', pax: 5, notes: '' },
]

async function importBookings() {
  try {
    console.log('Starting booking import...')

    // Get admin user (required for createdById)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    if (!adminUser) {
      throw new Error('No admin user found. Please create an admin user first.')
    }

    console.log(`Using admin user: ${adminUser.email}`)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const row of bookingsData) {
      try {
        // Skip bookings with 0 pax (like the Blogger entry)
        if (row.pax === 0) {
          console.log(`Skipping booking with 0 pax: ${row.name} on ${row.date}`)
          continue
        }

        const sessionDate = parseDate(row.date)
        const sessionTime = mapSlotToSessionTime(row.slot)
        const bookingType = getBookingType(row.notes, row.name)

        // Clean phone number (remove spaces, keep only digits)
        const phone = row.contact.trim() || null

        // Create booking
        const booking = await prisma.booking.create({
          data: {
            studentName: row.name,
            studentPhone: phone,
            studentEmail: null,
            numberOfPeople: row.pax,
            sessionDate: sessionDate,
            sessionTime: sessionTime,
            bookingType: bookingType,
            totalAmountPaid: null, // No price for now
            status: BookingStatus.CONFIRMED, // These are existing bookings
            notes: row.notes || null,
            createdById: adminUser.id,
          },
        })

        successCount++
        console.log(`✓ Created booking: ${row.name} (${row.pax} pax) on ${row.date} ${row.slot}`)
      } catch (error: any) {
        errorCount++
        const errorMsg = `Failed to import ${row.name} on ${row.date}: ${error.message}`
        errors.push(errorMsg)
        console.error(`✗ ${errorMsg}`)
      }
    }

    console.log('\n=== Import Summary ===')
    console.log(`Successfully imported: ${successCount} bookings`)
    console.log(`Errors: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log('\nErrors:')
      errors.forEach(err => console.log(`  - ${err}`))
    }

    console.log('\nImport completed!')
  } catch (error) {
    console.error('Import failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importBookings()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
