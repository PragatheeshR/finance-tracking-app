import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { errorResponse } from './utils/api-response'

/**
 * Get user ID from NextAuth session with fallback to header
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try to get from session first
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      return session.user.id
    }
  } catch (error) {
    console.error('Error getting user from session:', error)
  }

  // Fallback to header for backward compatibility
  const headerUserId = request.headers.get('x-user-id')
  if (headerUserId) {
    return headerUserId
  }

  return null
}

/**
 * Require authentication and return user ID
 */
export async function requireAuthFromRequest(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)

  if (!userId) {
    return {
      error: errorResponse('Authentication required. Please login.', 'UNAUTHORIZED', 401),
      userId: null,
    }
  }

  return { error: null, userId }
}
