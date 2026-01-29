import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET all cost of sale items
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.costOfSaleItem.findMany({
      include: {
        item: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching cost of sale items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cost of sale items' },
      { status: 500 }
    )
  }
}

// POST new cost of sale item
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, quantityPerPerson } = body

    if (!itemId || quantityPerPerson === undefined) {
      return NextResponse.json(
        { error: 'Item ID and quantity are required' },
        { status: 400 }
      )
    }

    // Check if item already exists in cost of sale
    const existing = await prisma.costOfSaleItem.findUnique({
      where: { itemId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This item is already configured' },
        { status: 400 }
      )
    }

    const costOfSaleItem = await prisma.costOfSaleItem.create({
      data: {
        itemId,
        quantityPerPerson: parseFloat(quantityPerPerson),
      },
      include: {
        item: true,
      },
    })

    return NextResponse.json(costOfSaleItem)
  } catch (error) {
    console.error('Error creating cost of sale item:', error)
    return NextResponse.json(
      { error: 'Failed to create cost of sale item' },
      { status: 500 }
    )
  }
}
