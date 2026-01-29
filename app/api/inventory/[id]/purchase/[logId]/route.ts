import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth-helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// DELETE /api/inventory/[id]/purchase/[logId] - Reverse/delete a purchase
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; logId: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete purchases
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can delete purchases' },
        { status: 403 }
      )
    }

    // Get the inventory log entry
    const log = await prisma.inventoryLog.findUnique({
      where: { id: params.logId },
      include: {
        item: true,
      },
    })

    if (!log) {
      return NextResponse.json(
        { error: 'Purchase log not found' },
        { status: 404 }
      )
    }

    // Verify it's a purchase log (STOCK_ADJUSTED with positive quantity and notes containing "Purchase:")
    if (
      log.action !== 'STOCK_ADJUSTED' ||
      !log.quantity ||
      log.quantity <= 0 ||
      !log.notes ||
      !log.notes.includes('Purchase:')
    ) {
      return NextResponse.json(
        { error: 'This log entry is not a purchase record' },
        { status: 400 }
      )
    }

    // Store quantity since we've validated it exists
    const purchaseQuantity = log.quantity

    // Verify the log belongs to the correct inventory item
    if (log.itemId !== params.id) {
      return NextResponse.json(
        { error: 'Purchase log does not belong to this inventory item' },
        { status: 400 }
      )
    }

    // Parse old and new values to reverse the purchase
    let oldStock: number
    let oldCost: number

    try {
      const oldValue = log.oldValue ? JSON.parse(log.oldValue) : {}
      oldStock = oldValue.stock ?? 0
      oldCost = oldValue.cost ?? 0
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid purchase log data' },
        { status: 400 }
      )
    }

    // Get current inventory item
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    // Use transaction to reverse the purchase
    const result = await prisma.$transaction(async (tx) => {
      // Reverse inventory to old values
      const updatedItem = await tx.inventoryItem.update({
        where: { id: params.id },
        data: {
          currentStock: oldStock,
          currentCost: oldCost,
        },
      })

      // Delete the purchase log entry
      await tx.inventoryLog.delete({
        where: { id: params.logId },
      })

      // Create a log entry for the reversal
      await tx.inventoryLog.create({
        data: {
          itemId: params.id,
          action: 'STOCK_ADJUSTED',
          oldValue: JSON.stringify({
            stock: inventoryItem.currentStock,
            cost: inventoryItem.currentCost,
          }),
          newValue: JSON.stringify({
            stock: oldStock,
            cost: oldCost,
          }),
          quantity: -purchaseQuantity, // Negative to show reversal
          notes: `Purchase reversed: ${log.notes}`,
          performedById: user.id,
        },
      })

      return { updatedItem }
    })

    return NextResponse.json({
      success: true,
      message: 'Purchase reversed successfully. Please delete the corresponding expense from the Expenses page.',
      inventoryItem: {
        id: result.updatedItem.id,
        name: inventoryItem.name,
        currentStock: result.updatedItem.currentStock,
        currentCost: result.updatedItem.currentCost,
        unit: inventoryItem.unit,
      },
    })
  } catch (error: any) {
    console.error('Error reversing purchase:', error)
    return NextResponse.json(
      { error: 'Failed to reverse purchase' },
      { status: 500 }
    )
  }
}
