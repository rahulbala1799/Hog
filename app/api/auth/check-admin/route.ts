import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if any admin user exists
    const adminExists = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
      },
    })

    return NextResponse.json({ 
      adminExists: !!adminExists,
      canSignUp: !adminExists 
    })
  } catch (error) {
    console.error('Error checking admin:', error)
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    )
  }
}
