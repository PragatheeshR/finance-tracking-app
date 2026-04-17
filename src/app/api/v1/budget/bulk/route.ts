import { NextRequest } from 'next/server'
import { budgetService } from '@/lib/services/budget.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'
import { z } from 'zod'

const bulkCreateSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  budgets: z.array(
    z.object({
      category: z.string().min(1),
      monthlyAmount: z.number().positive(),
    })
  ).min(1),
})

/**
 * POST /api/v1/budget/bulk
 * Bulk create/update budgets for multiple categories
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const body = await request.json()
    const validatedData = bulkCreateSchema.parse(body)

    const budgets = await budgetService.bulkCreateBudgets(
      userId,
      validatedData.year,
      validatedData.month,
      validatedData.budgets
    )

    return successResponse(
      { budgets, count: budgets.length },
      'Budgets created successfully',
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
