import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const runtime = 'nodejs' // Use Node.js runtime instead of Edge

export const { GET, POST } = toNextJsHandler(auth)
