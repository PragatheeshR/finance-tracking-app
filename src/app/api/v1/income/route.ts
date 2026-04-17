import { NextRequest } from 'next/server'
import { incomeService } from '@/lib/services/income.service'
import { createIncomeSchema } from '@/lib/validations/income.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * GET /api/v1/income
 * Get all income with filters and summary
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const source = searchParams.get('source') || undefined
    const category = searchParams.get('category') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const [incomeData, summary] = await Promise.all([
      incomeService.getIncome(userId, {
        startDate,
        endDate,
        source,
        category,
        page,
        pageSize,
      }),
      incomeService.getIncomeSummary(userId, startDate, endDate),
    ])

    return successResponse(
      {
        income: incomeData.income,
        summary,
        pagination: {
          total: incomeData.total,
          page: incomeData.page,
          pageSize: incomeData.pageSize,
          totalPages: incomeData.totalPages,
        },
      },
      'Income retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/v1/income
 * Create new income
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const body = await request.json()
    const validatedData = createIncomeSchema.parse(body)

    const income = await incomeService.addIncome(userId, validatedData)

    return successResponse({ income }, 'Income created successfully', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
