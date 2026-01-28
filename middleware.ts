import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow access to login page without authentication
  if (path === '/login' || path === '/') {
    return NextResponse.next()
  }

  // Get token from JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin routes - only allow ADMIN role
  if (path.startsWith('/admin')) {
    if (token.role !== 'ADMIN') {
      // Redirect to appropriate dashboard based on role
      if (token.role === 'STAFF') {
        return NextResponse.redirect(new URL('/staff/dashboard', request.url))
      }
      // If role is unknown, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Staff routes - only allow STAFF role
  if (path.startsWith('/staff')) {
    if (token.role !== 'STAFF') {
      // Redirect to appropriate dashboard based on role
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      // If role is unknown, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/dashboard/:path*',
    '/login',
    '/',
  ],
}
