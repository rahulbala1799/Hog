import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If no token, redirect to login (handled by withAuth)
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Admin routes - only allow ADMIN role
    if (path.startsWith('/admin')) {
      if (token.role !== 'ADMIN') {
        // Redirect to appropriate dashboard based on role
        if (token.role === 'STAFF') {
          return NextResponse.redirect(new URL('/staff/dashboard', req.url))
        }
        // If role is unknown, redirect to login
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Staff routes - only allow STAFF role
    if (path.startsWith('/staff')) {
      if (token.role !== 'STAFF') {
        // Redirect to appropriate dashboard based on role
        if (token.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url))
        }
        // If role is unknown, redirect to login
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without token
        if (req.nextUrl.pathname === '/login') {
          return true
        }
        // Require token for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/dashboard/:path*',
  ],
}
