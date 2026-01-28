'use client'

import { createAuthClient } from 'better-auth/react'

// Use our local Better Auth API route instead of Neon Auth
// This allows us to authenticate users from our own database
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  basePath: '/api/auth', // Use our local API route
})

export const { signIn, signOut, signUp, useSession } = authClient
