import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateExpenseCategorySchema } from '@/lib/validations/expense.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * PUT /api/v1/categories/expense/[id]
 * Update an expense category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { id } = await params
    const body = await request.json()

    // Validate input
    const validatedData = updateExpenseCategorySchema.parse(body)

    // Verify ownership
    const existing = await prisma.expenseCategory.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return errorResponse('Category not found', 'NOT_FOUND', 404)
    }

    // Update category
    const category = await prisma.expenseCategory.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.icon !== undefined && { icon: validatedData.icon }),
        ...(validatedData.color !== undefined && { color: validatedData.color }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
    })

    return successResponse({ category }, 'Category updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/v1/categories/expense/[id]
 * Delete an expense category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { id } = await params

    // Verify ownership
    const existing = await prisma.expenseCategory.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existing) {
      return errorResponse('Category not found', 'NOT_FOUND', 404)
    }

    // Check if category is in use
    const expenseCount = await prisma.expense.count({
      where: { userId: session.user.id, category: existing.name },
    })

    if (expenseCount > 0) {
      return errorResponse(
        'Cannot delete category that is in use. Please reassign expenses first.',
        'IN_USE',
        409
      )
    }

    // Delete category
    await prisma.expenseCategory.delete({ where: { id } })

    return successResponse(null, 'Category deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
