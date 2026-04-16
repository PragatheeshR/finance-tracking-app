import { NextRequest } from 'next/server'
import { errorResponse } from './utils/api-response'

/**
 * Get user ID from request header
 * TODO: Replace with NextAuth session once stable
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Get from header for now
  const headerUserId = request.headers.get('x-user-id')
  if (headerUserId) {
    return headerUserId
  }

  // TODO: Add session-based auth when NextAuth v5 is stable
  // const session = await auth()
  // if (session?.user?.id) {
  //   return session.user.id
  // }

  return null
}

/**
 * Require authentication and return user ID
 */
export async function requireAuthFromRequest(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)

  if (!userId) {
    return {
      error: errorResponse('Authentication required. Please provide x-user-id header.', 'UNAUTHORIZED', 401),
      userId: null,
    }
  }

  return { error: null, userId }
}
