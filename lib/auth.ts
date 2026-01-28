import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './db'

// Use our local Better Auth instance with our Prisma database
// This allows us to authenticate users from our own database
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  // Use our local app URL
  baseURL: process.env.AUTH_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  basePath: '/api/auth',
  // Use BETTER_AUTH_SECRET or fallback to NEXTAUTH_SECRET for compatibility
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // Disable public sign-ups - only allow login for existing users
    signUp: {
      enabled: false, // Disable sign-up endpoint (we use custom /api/auth/create-first-admin)
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
})

export type Session = typeof auth.$Infer.Session
