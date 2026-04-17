import { NextRequest } from 'next/server'
import { budgetService } from '@/lib/services/budget.service'
import { createBudgetItemSchema } from '@/lib/validations/budget.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * GET /api/v1/budget
 * Get all budgets for a specific month
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    const result = await budgetService.getBudgets(userId, year, month)

    return successResponse(result, 'Budgets retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/v1/budget
 * Create a new budget item
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const body = await request.json()

    // Validate input
    const validatedData = createBudgetItemSchema.parse(body)

    // Create budget
    const budget = await budgetService.createBudget(userId, validatedData)

    return successResponse({ budget }, 'Budget created successfully', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
