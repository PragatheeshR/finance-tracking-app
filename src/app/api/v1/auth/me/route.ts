import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromRequest } from '@/lib/auth-request'
import { successResponse, errorResponse } from '@/lib/utils/api-response'

/**
 * GET /api/v1/auth/me
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return errorResponse('Not authenticated', 'UNAUTHORIZED', 401)
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user) {
      return errorResponse('User not found', 'NOT_FOUND', 404)
    }

    return successResponse({ user }, 'User retrieved successfully')
  } catch (error) {
    return errorResponse('Authentication error', 'AUTH_ERROR', 401)
  }
}
