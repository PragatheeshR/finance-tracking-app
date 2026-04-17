import { NextRequest } from 'next/server'
import { expenseService } from '@/lib/services/expense.service'
import { updateExpenseSchema } from '@/lib/validations/expense.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * PUT /api/v1/expenses/[id]
 * Update an expense
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
    const validatedData = updateExpenseSchema.parse(body)

    // Update expense
    const expense = await expenseService.updateExpense(
      userId,
      id,
      validatedData
    )

    return successResponse({ expense }, 'Expense updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Expense not found') {
      return errorResponse('Expense not found', 'NOT_FOUND', 404)
    }
    return handleApiError(error)
  }
}

/**
 * DELETE /api/v1/expenses/[id]
 * Delete an expense
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

    await expenseService.deleteExpense(userId, id)

    return successResponse(null, 'Expense deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Expense not found') {
      return errorResponse('Expense not found', 'NOT_FOUND', 404)
    }
    return handleApiError(error)
  }
}
