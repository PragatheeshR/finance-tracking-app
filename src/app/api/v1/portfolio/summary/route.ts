import { NextRequest } from 'next/server'
import { portfolioService } from '@/lib/services/portfolio.service'
import { successResponse, handleApiError } from '@/lib/utils/api-response'
import { requireAuthFromRequest } from '@/lib/auth-request'

/**
 * GET /api/v1/portfolio/summary
 * Get complete portfolio summary with allocations
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const summary = await portfolioService.getPortfolioSummary(userId!)

    return successResponse(summary, 'Portfolio summary retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
