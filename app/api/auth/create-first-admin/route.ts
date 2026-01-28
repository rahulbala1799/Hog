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

    // Check if admin already exists
    const adminExists = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
      },
    })

    if (adminExists) {
      return NextResponse.json(
        { error: 'Admin user already exists. Sign-up is disabled.' },
        { status: 403 }
      )
    }

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
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.ADMIN,
      },
    })

    // Try to also create the user in Neon Auth via their sign-up endpoint
    // This ensures the user can sign in through Neon Auth
    const neonAuthUrl = process.env.NEON_AUTH_BASE_URL || process.env.NEXT_PUBLIC_NEON_AUTH_URL
    if (neonAuthUrl) {
      try {
        // Call Neon Auth sign-up endpoint
        const authResponse = await fetch(`${neonAuthUrl}/sign-up`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name,
          }),
        })

        if (!authResponse.ok) {
          console.warn('Failed to create user in Neon Auth, but user created in database:', await authResponse.text())
          // Continue anyway - user exists in DB and can sign in
        }
      } catch (error) {
        console.warn('Error creating user in Neon Auth:', error)
        // Continue anyway - user exists in DB
      }
    }

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
