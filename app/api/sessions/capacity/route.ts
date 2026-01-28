import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth-helpers'
import { BookingStatus, SessionTime } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/sessions/capacity - Get capacity for sessions
export async function GET(request: Request) {
  try {
    await getCurrentUser() // Require authentication

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!date && (!startDate || !endDate)) {
      return NextResponse.json(
        { error: 'Either date or startDate and endDate are required' },
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

    // Build date filter
    let dateFilter: any = {}
    if (date) {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      dateFilter = {
        gte: targetDate,
        lt: nextDay,
      }
    } else if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Get all bookings for the date range
    const bookings = await prisma.booking.findMany({
      where: {
        sessionDate: dateFilter,
        status: {
          not: BookingStatus.CANCELLED,
        },
      },
      select: {
        sessionDate: true,
        sessionTime: true,
        numberOfPeople: true,
      },
    })

    // Group bookings by date and session
    const capacityMap = new Map<string, {
      session1: { booked: number; available: number; percentage: number }
      session2: { booked: number; available: number; percentage: number }
    }>()

    bookings.forEach((booking) => {
      const dateKey = booking.sessionDate.toISOString().split('T')[0]
      
      if (!capacityMap.has(dateKey)) {
        capacityMap.set(dateKey, {
          session1: { booked: 0, available: maxCapacity, percentage: 0 },
          session2: { booked: 0, available: maxCapacity, percentage: 0 },
        })
      }

      const dayCapacity = capacityMap.get(dateKey)!
      
      if (booking.sessionTime === SessionTime.SESSION_1) {
        dayCapacity.session1.booked += booking.numberOfPeople
      } else {
        dayCapacity.session2.booked += booking.numberOfPeople
      }
    })

    // Calculate available spots and percentages
    const sessions: any[] = []
    capacityMap.forEach((capacity, dateKey) => {
      capacity.session1.available = maxCapacity - capacity.session1.booked
      capacity.session1.percentage = Math.round((capacity.session1.booked / maxCapacity) * 100)
      
      capacity.session2.available = maxCapacity - capacity.session2.booked
      capacity.session2.percentage = Math.round((capacity.session2.booked / maxCapacity) * 100)

      sessions.push({
        date: dateKey,
        maxCapacity,
        session1: capacity.session1,
        session2: capacity.session2,
      })
    })

    // Sort by date
    sessions.sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({ sessions, maxCapacity })
  } catch (error: any) {
    console.error('Error fetching session capacity:', error)
    
    if (error.message === 'Not authenticated') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch session capacity' },
      { status: 500 }
    )
  }
}
