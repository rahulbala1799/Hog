import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth-helpers'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// DELETE expense category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categoryId = params.id

    // Check if category has expenses
    const expenseCount = await prisma.expense.count({
      where: { categoryId },
    })

    if (expenseCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing expenses' },
        { status: 400 }
      )
    }

    await prisma.expenseCategory.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense category:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense category' },
      { status: 500 }
    )
  }
}
