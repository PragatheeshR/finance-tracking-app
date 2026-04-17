import { NextRequest } from 'next/server'
import { budgetService } from '@/lib/services/budget.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'
import { z } from 'zod'

const copyBudgetsSchema = z.object({
  fromYear: z.number().int().min(2020).max(2100),
  fromMonth: z.number().int().min(1).max(12),
  toYear: z.number().int().min(2020).max(2100),
  toMonth: z.number().int().min(1).max(12),
})

/**
 * POST /api/v1/budget/copy
 * Copy budgets from one month to another
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const body = await request.json()
    const validatedData = copyBudgetsSchema.parse(body)

    const budgets = await budgetService.copyBudgets(
      userId,
      validatedData.fromYear,
      validatedData.fromMonth,
      validatedData.toYear,
      validatedData.toMonth
    )

    return successResponse(
      { budgets, count: budgets.length },
      'Budgets copied successfully',
      201
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'No budgets found for the source month') {
      return errorResponse(error.message, 'NOT_FOUND', 404)
    }
    return handleApiError(error)
  }
}
