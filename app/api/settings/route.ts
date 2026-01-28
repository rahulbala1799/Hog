import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-helpers'
import { Currency } from '@prisma/client'

export async function GET() {
  try {
    // Get or create settings
    let settings = await prisma.appSettings.findUnique({
      where: { id: 'singleton' },
      include: {
        classTimings: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    })

    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          id: 'singleton',
          currency: Currency.INR,
          maxPersonsPerClass: 10,
          classTimings: {
            create: [],
          },
        },
        include: {
          classTimings: {
            orderBy: { dayOfWeek: 'asc' },
          },
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Require admin access
    await requireAdmin()

    const body = await request.json()
    const { currency, maxPersonsPerClass, classTimings } = body

    // Validate currency
    if (currency && !Object.values(Currency).includes(currency)) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400 }
      )
    }

    // Validate maxPersonsPerClass
    if (maxPersonsPerClass !== undefined) {
      if (typeof maxPersonsPerClass !== 'number' || maxPersonsPerClass < 1) {
        return NextResponse.json(
          { error: 'Max persons per class must be a positive number' },
          { status: 400 }
        )
      }
    }

    // Validate class timings
    if (classTimings !== undefined) {
      if (!Array.isArray(classTimings)) {
        return NextResponse.json(
          { error: 'Class timings must be an array' },
          { status: 400 }
        )
      }

      for (const timing of classTimings) {
        if (
          typeof timing.dayOfWeek !== 'number' ||
          timing.dayOfWeek < 0 ||
          timing.dayOfWeek > 6
        ) {
          return NextResponse.json(
            { error: 'Invalid day of week (0-6)' },
            { status: 400 }
          )
        }

        if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(timing.startTime)) {
          return NextResponse.json(
            { error: 'Invalid start time format (HH:MM)' },
            { status: 400 }
          )
        }

        if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(timing.endTime)) {
          return NextResponse.json(
            { error: 'Invalid end time format (HH:MM)' },
            { status: 400 }
          )
        }
      }
    }

    // Update settings
    const updateData: any = {}
    if (currency) updateData.currency = currency
    if (maxPersonsPerClass !== undefined) updateData.maxPersonsPerClass = maxPersonsPerClass

    // Handle class timings update
    if (classTimings !== undefined) {
      // Delete existing timings
      await prisma.classTiming.deleteMany({
        where: { settingsId: 'singleton' },
      })

      // Create new timings
      if (classTimings.length > 0) {
        await prisma.classTiming.createMany({
          data: classTimings.map((timing: any) => ({
            dayOfWeek: timing.dayOfWeek,
            startTime: timing.startTime,
            endTime: timing.endTime,
            settingsId: 'singleton',
          })),
        })
      }
    }

    const settings = await prisma.appSettings.update({
      where: { id: 'singleton' },
      data: updateData,
      include: {
        classTimings: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    })

    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('Error updating settings:', error)
    
    if (error.message === 'Not authenticated' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
