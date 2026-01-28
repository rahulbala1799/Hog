import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './db'

// When using Neon Auth (managed Better Auth service), we still need a server instance
// for server-side session checks, but it should point to the Neon Auth service
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  // Point to Neon Auth service URL if available, otherwise use local
  baseURL: process.env.NEON_AUTH_BASE_URL || 
    process.env.AUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  // No basePath when using Neon Auth - it handles all routes
  basePath: process.env.NEON_AUTH_BASE_URL ? '' : '/api/auth',
  // Use BETTER_AUTH_SECRET or fallback to NEXTAUTH_SECRET for compatibility
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // Disable public sign-ups - only allow login for existing users
    signUp: {
      enabled: false, // Disable sign-up endpoint
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})

export type Session = typeof auth.$Infer.Session
