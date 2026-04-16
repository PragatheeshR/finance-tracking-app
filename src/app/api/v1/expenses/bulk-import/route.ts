import { NextRequest } from 'next/server'
import { expenseService } from '@/lib/services/expense.service'
import { bulkImportExpensesSchema } from '@/lib/validations/expense.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * POST /api/v1/expenses/bulk-import
 * Bulk import expenses from CSV/Excel
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return errorResponse('User ID is required', 'UNAUTHORIZED', 401)
    }

    const body = await request.json()

    // Validate input
    const validatedData = bulkImportExpensesSchema.parse(body)

    // Bulk import
    const result = await expenseService.bulkImport(userId, validatedData.expenses)

    return successResponse(
      result,
      `Imported ${result.imported} expenses successfully. ${result.failed} failed.`,
      result.failed > 0 ? 207 : 201 // 207 Multi-Status if some failed
    )
  } catch (error) {
    return handleApiError(error)
  }
}
