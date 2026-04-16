import { NextRequest } from 'next/server'
import { portfolioService } from '@/lib/services/portfolio.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * GET /api/v1/portfolio/rebalance
 * Get portfolio rebalancing suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const suggestions = await portfolioService.getRebalanceSuggestions(userId)

    return successResponse(
      { suggestions },
      suggestions.length > 0
        ? 'Rebalancing suggestions generated'
        : 'Portfolio is well balanced'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
