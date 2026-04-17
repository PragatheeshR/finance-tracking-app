import { NextRequest } from 'next/server'
import { portfolioService } from '@/lib/services/portfolio.service'
import { updateHoldingSchema } from '@/lib/validations/portfolio.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'
import { requireAuthFromRequest } from '@/lib/auth-request'

/**
 * GET /api/v1/portfolio/holdings/[id]
 * Get a specific holding by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const { id } = await params
    const holdings = await portfolioService.getHoldings(userId!)
    const holding = holdings.find(h => h.id === id)

    if (!holding) {
      return errorResponse('Holding not found', 'NOT_FOUND', 404)
    }

    return successResponse({ holding }, 'Holding retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/v1/portfolio/holdings/[id]
 * Update a holding
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validatedData = updateHoldingSchema.parse(body)

    // Update holding
    const holding = await portfolioService.updateHolding(
      userId!,
      id,
      validatedData
    )

    return successResponse({ holding }, 'Holding updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Holding not found') {
      return errorResponse('Holding not found', 'NOT_FOUND', 404)
    }
    return handleApiError(error)
  }
}

/**
 * DELETE /api/v1/portfolio/holdings/[id]
 * Delete a holding
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const { id } = await params

    await portfolioService.deleteHolding(userId!, id)

    return successResponse(null, 'Holding deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Holding not found') {
      return errorResponse('Holding not found', 'NOT_FOUND', 404)
    }
    return handleApiError(error)
  }
}
