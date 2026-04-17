import { NextRequest } from 'next/server'
import { expenseService } from '@/lib/services/expense.service'
import { createExpenseSchema, expenseQuerySchema } from '@/lib/validations/expense.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'
import { requireAuthFromRequest } from '@/lib/auth-request'

/**
 * GET /api/v1/expenses
 * Get expenses with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const bucketTypeParam = searchParams.get('bucketType')

    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      bucketType: bucketTypeParam && ['FIXED', 'VARIABLE', 'IRREGULAR'].includes(bucketTypeParam)
        ? bucketTypeParam as any
        : undefined,
      category: searchParams.get('category') || undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 20,
    }

    // Validate filters
    expenseQuerySchema.parse(filters)

    // Get expenses
    const result = await expenseService.getExpenses(userId!, filters)

    // Get summary
    const summary = await expenseService.getExpenseSummary(
      userId!,
      filters.startDate,
      filters.endDate
    )

    return successResponse(
      {
        expenses: result.expenses,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
          totalItems: result.total,
        },
        summary,
      },
      'Expenses retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/v1/expenses
 * Add a new expense
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const body = await request.json()

    // Validate input
    const validatedData = createExpenseSchema.parse(body)

    // Create expense
    const expense = await expenseService.addExpense(userId!, validatedData)

    return successResponse(
      { expense },
      'Expense added successfully',
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
