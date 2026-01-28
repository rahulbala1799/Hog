import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow access to login page without authentication
  if (path === '/login' || path === '/') {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('better-auth.session_token')
  
  // If no session, redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/dashboard/:path*',
  ],
}
