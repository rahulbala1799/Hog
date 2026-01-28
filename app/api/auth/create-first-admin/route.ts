import { prisma } from '@/lib/db'
import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if any users exist in our database
    const userCount = await prisma.user.count()
    
    // Check if admin already exists
    const adminExists = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
      },
    })

    // Only block if there's already an admin AND there are users in the database
    // This allows creating the first admin even if there are non-admin users
    if (adminExists && userCount > 0) {
      return NextResponse.json(
        { error: 'Admin user already exists. Sign-up is disabled. Please contact an administrator to create your account.' },
        { status: 403 }
      )
    }
    
    // If no users exist at all, allow creating the first admin
    // This handles the case where Neon Auth has users but our database is empty

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the first admin user in our database
    // User will authenticate through our local Better Auth instance
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.ADMIN,
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Superadmin created successfully. You can now sign in.',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      }
    })
  } catch (error) {
    console.error('Error creating first admin:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
