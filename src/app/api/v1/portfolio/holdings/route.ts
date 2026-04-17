import { NextRequest } from 'next/server'
import { portfolioService } from '@/lib/services/portfolio.service'
import { createHoldingSchema, updateHoldingSchema } from '@/lib/validations/portfolio.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'
import { requireAuthFromRequest } from '@/lib/auth-request'

/**
 * GET /api/v1/portfolio/holdings
 * Get all holdings for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const holdings = await portfolioService.getHoldings(userId!)

    return successResponse(
      { holdings, total: holdings.length },
      'Holdings retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/v1/portfolio/holdings
 * Add a new holding
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const body = await request.json()

    // Validate input
    const validatedData = createHoldingSchema.parse(body)

    // Create holding
    const holding = await portfolioService.addHolding(userId!, validatedData)

    return successResponse(
      { holding },
      'Holding added successfully',
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
