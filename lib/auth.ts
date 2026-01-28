import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './db'

// If using Neon Auth (managed Better Auth service), we might not need this server config
// But keeping it for local development or if we need custom server-side auth logic
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: process.env.NEON_AUTH_BASE_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL || process.env.AUTH_URL?.replace('https://', '') || process.env.NEON_AUTH_BASE_URL?.replace('https://', '')}` 
    : 'http://localhost:3000',
  basePath: process.env.NEON_AUTH_BASE_URL ? '' : '/api/auth', // No basePath if using Neon Auth directly
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
