import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { BookingStatus, SessionTime } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/bookings/[id] - Get a single booking
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await getCurrentUser() // Require authentication

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error('Error fetching booking:', error)
    
    if (error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[id] - Update a booking
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      studentName,
      studentEmail,
      studentPhone,
      numberOfPeople,
      sessionDate,
      sessionTime,
      status,
      notes,
    } = body

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (studentName !== undefined) updateData.studentName = studentName
    if (studentEmail !== undefined) updateData.studentEmail = studentEmail || null
    if (studentPhone !== undefined) updateData.studentPhone = studentPhone || null
    if (notes !== undefined) updateData.notes = notes || null
    if (status !== undefined && Object.values(BookingStatus).includes(status)) {
      updateData.status = status
    }

    // Handle capacity check if changing numberOfPeople, date, or time
    const isChangingCapacity = 
      (numberOfPeople !== undefined && numberOfPeople !== existingBooking.numberOfPeople) ||
      (sessionDate !== undefined && new Date(sessionDate).getTime() !== existingBooking.sessionDate.getTime()) ||
      (sessionTime !== undefined && sessionTime !== existingBooking.sessionTime)

    if (isChangingCapacity) {
      const targetDate = sessionDate ? new Date(sessionDate) : existingBooking.sessionDate
      const targetTime = (sessionTime as SessionTime) || existingBooking.sessionTime
      const targetPax = numberOfPeople || existingBooking.numberOfPeople

      // Get max capacity
      const settings = await prisma.appSettings.findUnique({
        where: { id: 'singleton' },
      })
      const maxCapacity = settings?.maxPersonsPerClass || 10

      // Check current capacity (excluding this booking)
      const otherBookings = await prisma.booking.findMany({
        where: {
          id: { not: params.id },
          sessionDate: targetDate,
          sessionTime: targetTime,
          status: { not: BookingStatus.CANCELLED },
        },
      })

      const currentCapacity = otherBookings.reduce(
        (sum, booking) => sum + booking.numberOfPeople,
        0
      )

      if (currentCapacity + targetPax > maxCapacity) {
        return NextResponse.json(
          {
            error: `Cannot update booking. Only ${maxCapacity - currentCapacity} spots remaining.`,
            currentCapacity,
            maxCapacity,
            spotsRemaining: maxCapacity - currentCapacity,
          },
          { status: 400 }
        )
      }

      if (numberOfPeople !== undefined) updateData.numberOfPeople = targetPax
      if (sessionDate !== undefined) updateData.sessionDate = targetDate
      if (sessionTime !== undefined) updateData.sessionTime = targetTime
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error('Error updating booking:', error)
    
    if (error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Delete a booking
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting booking:', error)
    
    if (error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
