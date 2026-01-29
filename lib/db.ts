import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Add pgbouncer=true for Neon connection pooling
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  
  // Add pgbouncer parameter if not already present
  if (url.includes('?')) {
    return url.includes('pgbouncer=true') ? url : `${url}&pgbouncer=true`
  }
  return `${url}?pgbouncer=true`
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
