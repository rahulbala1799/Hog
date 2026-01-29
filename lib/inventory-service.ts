import { InventoryAction } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * Automatically deduct inventory based on booking
 * Called when a booking is created or updated
 */
export async function consumeInventoryForBooking(
  bookingId: string,
  numberOfPeople: number,
  userId: string
): Promise<void> {
  try {
    // Get all cost of sale items
    const costOfSaleItems = await prisma.costOfSaleItem.findMany({
      include: {
        item: true,
      },
    })

    if (costOfSaleItems.length === 0) {
      // No cost of sale items configured, skip
      return
    }

    // Process each item
    for (const cosItem of costOfSaleItems) {
      const totalQuantity = cosItem.quantityPerPerson * numberOfPeople
      const newStock = cosItem.item.currentStock - totalQuantity

      // Update inventory stock
      await prisma.inventoryItem.update({
        where: { id: cosItem.itemId },
        data: {
          currentStock: newStock,
        },
      })

      // Create log entry
      await prisma.inventoryLog.create({
        data: {
          itemId: cosItem.itemId,
          action: InventoryAction.AUTO_CONSUMED,
          oldValue: JSON.stringify({ stock: cosItem.item.currentStock }),
          newValue: JSON.stringify({ stock: newStock }),
          quantity: -totalQuantity,
          notes: `Auto-consumed for ${numberOfPeople} ${numberOfPeople === 1 ? 'person' : 'people'}`,
          performedById: userId,
          bookingId: bookingId,
        },
      })
    }
  } catch (error) {
    console.error('Error consuming inventory for booking:', error)
    throw error
  }
}

/**
 * Restore inventory when a booking is cancelled or deleted
 */
export async function restoreInventoryForBooking(
  bookingId: string,
  userId: string
): Promise<void> {
  try {
    // Find all inventory logs for this booking
    const logs = await prisma.inventoryLog.findMany({
      where: {
        bookingId,
        action: InventoryAction.AUTO_CONSUMED,
      },
      include: {
        item: true,
      },
    })

    // Restore each item
    for (const log of logs) {
      if (log.quantity) {
        const restoredQuantity = Math.abs(log.quantity)
        const newStock = log.item.currentStock + restoredQuantity

        await prisma.inventoryItem.update({
          where: { id: log.itemId },
          data: {
            currentStock: newStock,
          },
        })

        // Create restoration log
        await prisma.inventoryLog.create({
          data: {
            itemId: log.itemId,
            action: InventoryAction.STOCK_ADJUSTED,
            oldValue: JSON.stringify({ stock: log.item.currentStock }),
            newValue: JSON.stringify({ stock: newStock }),
            quantity: restoredQuantity,
            notes: `Restored due to booking cancellation/deletion`,
            performedById: userId,
            bookingId: bookingId,
          },
        })
      }
    }
  } catch (error) {
    console.error('Error restoring inventory for booking:', error)
    throw error
  }
}

/**
 * Adjust inventory when booking number of people changes
 */
export async function adjustInventoryForBooking(
  bookingId: string,
  oldNumberOfPeople: number,
  newNumberOfPeople: number,
  userId: string
): Promise<void> {
  try {
    const difference = newNumberOfPeople - oldNumberOfPeople

    if (difference === 0) {
      return // No change
    }

    // Get all cost of sale items
    const costOfSaleItems = await prisma.costOfSaleItem.findMany({
      include: {
        item: true,
      },
    })

    if (costOfSaleItems.length === 0) {
      return
    }

    // Process each item
    for (const cosItem of costOfSaleItems) {
      const adjustmentQuantity = cosItem.quantityPerPerson * difference
      const newStock = cosItem.item.currentStock - adjustmentQuantity

      await prisma.inventoryItem.update({
        where: { id: cosItem.itemId },
        data: {
          currentStock: newStock,
        },
      })

      // Create log entry
      await prisma.inventoryLog.create({
        data: {
          itemId: cosItem.itemId,
          action: InventoryAction.AUTO_CONSUMED,
          oldValue: JSON.stringify({ stock: cosItem.item.currentStock }),
          newValue: JSON.stringify({ stock: newStock }),
          quantity: -adjustmentQuantity,
          notes: `Adjusted for people change: ${oldNumberOfPeople} → ${newNumberOfPeople}`,
          performedById: userId,
          bookingId: bookingId,
        },
      })
    }
  } catch (error) {
    console.error('Error adjusting inventory for booking:', error)
    throw error
  }
}
