'use client'

import { createAuthClient } from 'better-auth/react'

// When using Neon Auth (managed Better Auth service), point directly to the Neon Auth URL
// No basePath needed since Neon Auth handles the routing
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_NEON_AUTH_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  // No basePath when using Neon Auth - it handles all routes
})

export const { signIn, signOut, signUp, useSession } = authClient
