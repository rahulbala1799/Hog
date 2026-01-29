import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth-helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/inventory/[id]/purchase - Record inventory purchase
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can add purchases
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can record purchases' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { quantity, totalCost, supplier } = body

    // Validation
    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    if (!totalCost || totalCost <= 0) {
      return NextResponse.json(
        { error: 'Total cost must be greater than 0' },
        { status: 400 }
      )
    }

    // Get inventory item
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: params.id },
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    // Calculate new stock and weighted average cost
    const currentStock = inventoryItem.currentStock
    const currentCost = inventoryItem.currentCost
    const purchaseQuantity = parseFloat(quantity)
    const purchaseTotalCost = parseFloat(totalCost)

    const newStock = currentStock + purchaseQuantity

    // Weighted average cost calculation
    // If current stock is 0, just use the purchase cost
    const newCost =
      currentStock === 0
        ? purchaseTotalCost / purchaseQuantity
        : (currentStock * currentCost + purchaseTotalCost) / newStock

    // Get or create "Cost of Sale" category
    let costOfSaleCategory = await prisma.expenseCategory.findFirst({
      where: {
        name: {
          in: ['Cost of Sale', 'Cost Of Sale'],
        },
      },
    })

    if (!costOfSaleCategory) {
      costOfSaleCategory = await prisma.expenseCategory.create({
        data: { name: 'Cost of Sale' },
      })
    }

    // Use transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update inventory item
      const updatedItem = await tx.inventoryItem.update({
        where: { id: params.id },
        data: {
          currentStock: newStock,
          currentCost: newCost,
        },
      })

      // Create expense record
      const expense = await tx.expense.create({
        data: {
          description: inventoryItem.name,
          amount: purchaseTotalCost,
          categoryId: costOfSaleCategory!.id,
          date: new Date(),
          notes: supplier ? `Supplier: ${supplier}` : null,
          createdById: user.id,
        },
        include: {
          category: true,
        },
      })

      // Create inventory log for the purchase
      await tx.inventoryLog.create({
        data: {
          itemId: params.id,
          action: 'STOCK_ADJUSTED',
          oldValue: JSON.stringify({
            stock: currentStock,
            cost: currentCost,
          }),
          newValue: JSON.stringify({
            stock: newStock,
            cost: newCost,
          }),
          quantity: purchaseQuantity,
          notes: `Purchase: ${purchaseQuantity} ${inventoryItem.unit} @ ₹${(purchaseTotalCost / purchaseQuantity).toFixed(2)}/${inventoryItem.unit}${supplier ? ` from ${supplier}` : ''}`,
          performedById: user.id,
        },
      })

      return { updatedItem, expense }
    })

    return NextResponse.json({
      success: true,
      inventoryItem: {
        id: result.updatedItem.id,
        name: inventoryItem.name,
        currentStock: result.updatedItem.currentStock,
        currentCost: result.updatedItem.currentCost,
        unit: inventoryItem.unit,
      },
      expense: {
        id: result.expense.id,
        description: result.expense.description,
        amount: result.expense.amount,
        category: result.expense.category,
        date: result.expense.date,
      },
    })
  } catch (error: any) {
    console.error('Error recording purchase:', error)
    return NextResponse.json(
      { error: 'Failed to record purchase' },
      { status: 500 }
    )
  }
}
