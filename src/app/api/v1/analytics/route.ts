import { NextRequest } from 'next/server'
import { analyticsService } from '@/lib/services/analytics.service'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * GET /api/v1/analytics
 * Get comprehensive analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // trends, categories, budget-vs-actual, top-categories, comparison, stats, daily

    const now = new Date()
    const year = parseInt(searchParams.get('year') || now.getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (now.getMonth() + 1).toString())

    // Default date ranges
    const startDate = searchParams.get('startDate') || new Date(year, month - 1, 1).toISOString()
    const endDate = searchParams.get('endDate') || new Date(year, month, 0, 23, 59, 59, 999).toISOString()

    let data

    switch (type) {
      case 'trends':
        data = await analyticsService.getExpenseTrends(userId, startDate, endDate)
        break

      case 'categories':
        data = await analyticsService.getCategoryBreakdown(userId, startDate, endDate)
        break

      case 'budget-vs-actual':
        data = await analyticsService.getBudgetVsActual(userId, year, month)
        break

      case 'top-categories':
        const limit = parseInt(searchParams.get('limit') || '5')
        data = await analyticsService.getTopCategories(userId, startDate, endDate, limit)
        break

      case 'comparison':
        const period1Start = searchParams.get('period1Start')
        const period1End = searchParams.get('period1End')
        const period2Start = searchParams.get('period2Start')
        const period2End = searchParams.get('period2End')

        if (!period1Start || !period1End || !period2Start || !period2End) {
          return errorResponse('Comparison requires all period dates', 'BAD_REQUEST', 400)
        }

        data = await analyticsService.getSpendingComparison(
          userId,
          period1Start,
          period1End,
          period2Start,
          period2End
        )
        break

      case 'stats':
        data = await analyticsService.getExpenseStats(userId, year, month)
        break

      case 'daily':
        data = await analyticsService.getDailySpending(userId, year, month)
        break

      default:
        // Return all analytics data
        const [trends, categories, budgetVsActual, topCategories, stats] = await Promise.all([
          analyticsService.getExpenseTrends(
            userId,
            new Date(year, 0, 1).toISOString(), // Year start
            new Date(year, 11, 31, 23, 59, 59, 999).toISOString() // Year end
          ),
          analyticsService.getCategoryBreakdown(userId, startDate, endDate),
          analyticsService.getBudgetVsActual(userId, year, month),
          analyticsService.getTopCategories(userId, startDate, endDate, 5),
          analyticsService.getExpenseStats(userId, year, month),
        ])

        data = {
          trends,
          categories,
          budgetVsActual,
          topCategories,
          stats,
        }
    }

    return successResponse(data, 'Analytics data retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
