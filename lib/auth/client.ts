'use client'

import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_NEON_AUTH_URL || process.env.NEXT_PUBLIC_AUTH_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  basePath: process.env.NEXT_PUBLIC_NEON_AUTH_URL ? '' : '/api/auth', // No basePath if using Neon Auth directly
})

export const { signIn, signOut, signUp, useSession } = authClient
