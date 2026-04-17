import { NextRequest } from 'next/server'
import { budgetService } from '@/lib/services/budget.service'
import { updateBudgetItemSchema } from '@/lib/validations/budget.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * PUT /api/v1/budget/[id]
 * Update a budget item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validatedData = updateBudgetItemSchema.parse(body)

    // Update budget
    const budget = await budgetService.updateBudget(userId, id, validatedData)

    return successResponse({ budget }, 'Budget updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Budget not found') {
      return errorResponse('Budget not found', 'NOT_FOUND', 404)
    }
    return handleApiError(error)
  }
}

/**
 * DELETE /api/v1/budget/[id]
 * Delete a budget item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const { id } = await params

    await budgetService.deleteBudget(userId, id)

    return successResponse(null, 'Budget deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Budget not found') {
      return errorResponse('Budget not found', 'NOT_FOUND', 404)
    }
    return handleApiError(error)
  }
}
