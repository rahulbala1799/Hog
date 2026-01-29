import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth-helpers'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PUT update cost of sale item
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
    const { quantityPerPerson } = body

    if (quantityPerPerson === undefined) {
      return NextResponse.json(
        { error: 'Quantity is required' },
        { status: 400 }
      )
    }

    const costOfSaleItem = await prisma.costOfSaleItem.update({
      where: { id: params.id },
      data: {
        quantityPerPerson: parseFloat(quantityPerPerson),
      },
      include: {
        item: true,
      },
    })

    return NextResponse.json(costOfSaleItem)
  } catch (error) {
    console.error('Error updating cost of sale item:', error)
    return NextResponse.json(
      { error: 'Failed to update cost of sale item' },
      { status: 500 }
    )
  }
}

// DELETE cost of sale item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.costOfSaleItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cost of sale item:', error)
    return NextResponse.json(
      { error: 'Failed to delete cost of sale item' },
      { status: 500 }
    )
  }
}
