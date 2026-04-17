import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
} from '@/lib/validations/expense.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * GET /api/v1/categories/expense
 * Get all expense categories for the user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const categories = await prisma.expenseCategory.findMany({
      where: { userId: session.user.id },
      orderBy: { sortOrder: 'asc' },
    })

    return successResponse(
      { categories },
      'Expense categories retrieved successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/v1/categories/expense
 * Create a new expense category
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const body = await request.json()

    // Validate input
    const validatedData = createExpenseCategorySchema.parse(body)

    // Check if category already exists
    const existing = await prisma.expenseCategory.findUnique({
      where: {
        userId_name: {
          userId: session.user.id,
          name: validatedData.name,
        },
      },
    })

    if (existing) {
      return errorResponse('Category already exists', 'DUPLICATE', 409)
    }

    // Create category
    const category = await prisma.expenseCategory.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        displayName: validatedData.name,
        icon: validatedData.icon,
        color: validatedData.color,
        isDefault: false,
        isActive: true,
      },
    })

    return successResponse(
      { category },
      'Expense category created successfully',
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
