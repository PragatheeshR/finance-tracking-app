import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Get user ID from NextAuth session
 * Returns user ID or null if not authenticated
 */
export async function getUserIdFromSession(request: NextRequest): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.id || null
  } catch (error) {
    console.error('Error getting user from session:', error)
    return null
  }
}

/**
 * Get user ID from session or throw error
 * Use this when authentication is required
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  const userId = await getUserIdFromSession(request)

  if (!userId) {
    throw new Error('Unauthorized - Please login')
  }

  return userId
}
