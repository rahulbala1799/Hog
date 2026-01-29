import { PrismaClient, BookingStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function distributeRevenue() {
  try {
    console.log('Distributing revenue across active bookings (excluding cancelled)...')

    // Get only non-cancelled bookings
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          not: BookingStatus.CANCELLED,
        },
      },
      select: {
        id: true,
        studentName: true,
        totalAmountPaid: true,
        status: true,
      },
    })

    const totalBookings = bookings.length
    console.log(`Found ${totalBookings} active bookings in the database (excluding cancelled)`)

    if (totalBookings === 0) {
      console.log('No active bookings found. Exiting.')
      return
    }

    // Calculate amount per booking
    const totalRevenue = 71511
    const amountPerBooking = totalRevenue / totalBookings

    console.log(`\nTotal Revenue: ${totalRevenue}`)
    console.log(`Total Bookings: ${totalBookings}`)
    console.log(`Amount per Booking: ${amountPerBooking.toFixed(2)}`)
    console.log('\nUpdating bookings...\n')

    // Update all bookings with the calculated amount
    let updatedCount = 0
    for (const booking of bookings) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { totalAmountPaid: amountPerBooking },
      })
      
      console.log(`✓ ${booking.studentName} (${booking.status}): ${amountPerBooking.toFixed(2)}`)
      updatedCount++
    }

    console.log(`\nSuccessfully updated ${updatedCount} active bookings with revenue amount`)
    console.log(`Total distributed: ${(amountPerBooking * totalBookings).toFixed(2)}`)
  } catch (error) {
    console.error('Error distributing revenue:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

distributeRevenue()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
