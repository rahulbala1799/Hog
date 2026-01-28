import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, getCurrentUser } from '@/lib/auth-helpers'
import { BookingStatus, SessionTime, BookingType } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/bookings - Get bookings with optional filters
export async function GET(request: Request) {
  try {
    await getCurrentUser() // Require authentication

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sessionTime = searchParams.get('sessionTime') // SESSION_1 or SESSION_2
    const status = searchParams.get('status')

    const where: any = {}

    // Filter by single date
    if (date) {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      where.sessionDate = {
        gte: targetDate,
        lt: nextDay,
      }
    }

    // Filter by date range
    if (startDate && endDate) {
      where.sessionDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Filter by session time
    if (sessionTime && (sessionTime === 'SESSION_1' || sessionTime === 'SESSION_2')) {
      where.sessionTime = sessionTime
    }

    // Filter by status
    if (status && Object.values(BookingStatus).includes(status as BookingStatus)) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { sessionDate: 'asc' },
        { sessionTime: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json({ bookings })
  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    
    if (error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: Request) {
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
      bookingType,
      status,
      notes,
    } = body

    // Validate required fields
    if (!studentName || !studentPhone || !sessionDate || !sessionTime) {
      return NextResponse.json(
        { error: 'Student name, phone number, session date, and session time are required' },
        { status: 400 }
      )
    }

    // Validate session time
    if (sessionTime !== 'SESSION_1' && sessionTime !== 'SESSION_2') {
      return NextResponse.json(
        { error: 'Invalid session time. Must be SESSION_1 or SESSION_2' },
        { status: 400 }
      )
    }

    // Validate number of people
    const pax = numberOfPeople || 1
    if (pax < 1) {
      return NextResponse.json(
        { error: 'Number of people must be at least 1' },
        { status: 400 }
      )
    }

    // Get max capacity from settings (create if doesn't exist)
    let settings = await prisma.appSettings.findUnique({
      where: { id: 'singleton' },
    })
    
    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.appSettings.create({
        data: {
          id: 'singleton',
          maxPersonsPerClass: 10, // Default, but should be set in settings
        },
      })
    }
    
    const maxCapacity = settings.maxPersonsPerClass

    // Check current capacity for this session
    const existingBookings = await prisma.booking.findMany({
      where: {
        sessionDate: new Date(sessionDate),
        sessionTime: sessionTime as SessionTime,
        status: {
          not: BookingStatus.CANCELLED,
        },
      },
    })

    const currentCapacity = existingBookings.reduce(
      (sum, booking) => sum + booking.numberOfPeople,
      0
    )

    // Check if adding this booking would exceed capacity
    if (currentCapacity + pax > maxCapacity) {
      return NextResponse.json(
        {
          error: `Cannot book ${pax} people. Only ${maxCapacity - currentCapacity} spots remaining.`,
          currentCapacity,
          maxCapacity,
          spotsRemaining: maxCapacity - currentCapacity,
        },
        { status: 400 }
      )
    }

    // Validate booking type
    const validBookingType = bookingType && Object.values(BookingType).includes(bookingType as BookingType)
      ? (bookingType as BookingType)
      : BookingType.REGULAR

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        studentName,
        studentEmail: studentEmail || null,
        studentPhone: studentPhone || null,
        numberOfPeople: pax,
        sessionDate: new Date(sessionDate),
        sessionTime: sessionTime as SessionTime,
        bookingType: validBookingType,
        status: (status as BookingStatus) || BookingStatus.PENDING,
        notes: notes || null,
        createdById: currentUser.id,
      },
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

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating booking:', error)
    
    if (error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
