import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, InventoryAction } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth-helpers'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET all inventory items
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.inventoryItem.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        priceHistory: {
          orderBy: { effectiveDate: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            logs: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

// POST new inventory item
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, currentStock, currentCost, reorderLevel, unit } = body

    if (!name || currentStock === undefined || currentCost === undefined) {
      return NextResponse.json(
        { error: 'Name, stock, and cost are required' },
        { status: 400 }
      )
    }

    // Create item with initial price history
    const item = await prisma.inventoryItem.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        currentStock: parseInt(currentStock),
        currentCost: parseFloat(currentCost),
        reorderLevel: reorderLevel ? parseInt(reorderLevel) : null,
        unit: unit?.trim() || 'unit',
        createdById: user.id,
        priceHistory: {
          create: {
            oldPrice: null,
            newPrice: parseFloat(currentCost),
            changedBy: user.name,
            reason: 'Initial price',
          },
        },
        logs: {
          create: {
            action: InventoryAction.CREATED,
            newValue: JSON.stringify({
              name,
              stock: currentStock,
              cost: currentCost,
              unit,
            }),
            performedById: user.id,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        priceHistory: true,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    )
  }
}
