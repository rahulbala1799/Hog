import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth-helpers'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET all expense categories
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { expenses: true },
        },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching expense categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expense categories' },
      { status: 500 }
    )
  }
}

// POST new expense category
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name: name.trim(),
      },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('Error creating expense category:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create expense category' },
      { status: 500 }
    )
  }
}
