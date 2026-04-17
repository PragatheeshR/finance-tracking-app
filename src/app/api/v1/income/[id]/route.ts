import { NextRequest } from 'next/server'
import { incomeService } from '@/lib/services/income.service'
import { updateIncomeSchema } from '@/lib/validations/income.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * PUT /api/v1/income/[id]
 * Update an income record
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
    const validatedData = updateIncomeSchema.parse(body)

    const income = await incomeService.updateIncome(userId, id, validatedData)

    return successResponse({ income }, 'Income updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Income not found') {
      return errorResponse('Income not found', 'NOT_FOUND', 404)
    }
    return handleApiError(error)
  }
}

/**
 * DELETE /api/v1/income/[id]
 * Delete an income record
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

    await incomeService.deleteIncome(userId, id)

    return successResponse(null, 'Income deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'Income not found') {
      return errorResponse('Income not found', 'NOT_FOUND', 404)
    }
    return handleApiError(error)
  }
}
