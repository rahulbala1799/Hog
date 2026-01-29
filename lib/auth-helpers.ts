import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from './db'
import { Role } from '@prisma/client'

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function getUserFromRequest(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return user
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  if (user.role !== Role.ADMIN) {
    throw new Error('Admin access required')
  }

  return user
}
