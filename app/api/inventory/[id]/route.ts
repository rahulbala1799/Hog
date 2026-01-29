import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, InventoryAction } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth-helpers'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET single inventory item with full history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
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
        },
        logs: {
          include: {
            performedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    )
  }
}

// PUT update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, currentStock, currentCost, reorderLevel, unit, reason } = body

    // Get current item
    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
    })

    if (!currentItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const updates: any = {}
    const logs: any[] = []
    const oldValues: any = {}
    const newValues: any = {}

    // Track changes
    if (name !== undefined && name !== currentItem.name) {
      updates.name = name.trim()
      oldValues.name = currentItem.name
      newValues.name = name.trim()
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null
      if (description?.trim() !== currentItem.description) {
        oldValues.description = currentItem.description
        newValues.description = description?.trim() || null
      }
    }

    if (unit !== undefined && unit !== currentItem.unit) {
      updates.unit = unit.trim()
      oldValues.unit = currentItem.unit
      newValues.unit = unit.trim()
    }

    if (reorderLevel !== undefined) {
      const newReorderLevel = reorderLevel ? parseInt(reorderLevel) : null
      if (newReorderLevel !== currentItem.reorderLevel) {
        updates.reorderLevel = newReorderLevel
        oldValues.reorderLevel = currentItem.reorderLevel
        newValues.reorderLevel = newReorderLevel
      }
    }

    // Handle stock change
    if (currentStock !== undefined) {
      const newStock = parseInt(currentStock)
      if (newStock !== currentItem.currentStock) {
        updates.currentStock = newStock
        logs.push({
          action: InventoryAction.STOCK_ADJUSTED,
          oldValue: JSON.stringify({ stock: currentItem.currentStock }),
          newValue: JSON.stringify({ stock: newStock }),
          quantity: newStock - currentItem.currentStock,
          notes: reason || null,
          performedById: user.id,
        })
      }
    }

    // Handle price change
    if (currentCost !== undefined) {
      const newCost = parseFloat(currentCost)
      if (newCost !== currentItem.currentCost) {
        updates.currentCost = newCost
        
        // Create price history entry
        await prisma.inventoryPriceHistory.create({
          data: {
            itemId: params.id,
            oldPrice: currentItem.currentCost,
            newPrice: newCost,
            changedBy: user.name,
            reason: reason || null,
          },
        })

        logs.push({
          action: InventoryAction.PRICE_CHANGED,
          oldValue: JSON.stringify({ cost: currentItem.currentCost }),
          newValue: JSON.stringify({ cost: newCost }),
          notes: reason || null,
          performedById: user.id,
        })
      }
    }

    // Add general update log if other fields changed
    if (Object.keys(oldValues).length > 0 && !logs.some(l => l.action === InventoryAction.STOCK_ADJUSTED || l.action === InventoryAction.PRICE_CHANGED)) {
      logs.push({
        action: InventoryAction.UPDATED,
        oldValue: JSON.stringify(oldValues),
        newValue: JSON.stringify(newValues),
        notes: reason || null,
        performedById: user.id,
      })
    }

    // Update item and create logs
    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        ...updates,
        logs: logs.length > 0 ? {
          createMany: {
            data: logs,
          },
        } : undefined,
      },
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
          take: 5,
        },
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    )
  }
}

// DELETE inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log deletion before deleting
    await prisma.inventoryLog.create({
      data: {
        itemId: params.id,
        action: InventoryAction.DELETED,
        notes: 'Item deleted',
        performedById: user.id,
      },
    })

    await prisma.inventoryItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    )
  }
}
