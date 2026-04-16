import { NextRequest } from 'next/server'
import { portfolioService } from '@/lib/services/portfolio.service'
import { createHoldingSchema, updateHoldingSchema } from '@/lib/validations/portfolio.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * GET /api/v1/portfolio/holdings
 * Get all holdings for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const holdings = await portfolioService.getHoldings(userId)

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
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const body = await request.json()

    // Validate input
    const validatedData = createHoldingSchema.parse(body)

    // Create holding
    const holding = await portfolioService.addHolding(userId, validatedData)

    return successResponse(
      { holding },
      'Holding added successfully',
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
