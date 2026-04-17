import { NextRequest } from 'next/server'
import { incomeService } from '@/lib/services/income.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * GET /api/v1/income/vs-expense
 * Get income vs expense comparison
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

    const comparison = await incomeService.getIncomeVsExpense(userId, year, month)

    return successResponse(comparison, 'Income vs expense comparison retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
