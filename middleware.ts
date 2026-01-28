import { auth } from '@/lib/auth'
import { toNextJsMiddleware } from 'better-auth/next-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow access to login page without authentication
  if (path === '/login' || path === '/') {
    return NextResponse.next()
  }

  // Use Better Auth middleware for protected routes
  const handler = toNextJsMiddleware(auth)
  const response = await handler(request)

  // If not authenticated, redirect to login
  if (response?.status === 401 || response?.status === 403) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response || NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/dashboard/:path*',
  ],
}
