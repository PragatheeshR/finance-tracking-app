import { NextRequest, NextResponse } from 'next/server'
import { recurringExpenseService } from '@/lib/services/recurring-expense.service'
import { BucketType } from '@prisma/client'

/**
 * GET /api/v1/recurring-expenses
 * Get all recurring expenses
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'User ID required' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const bucketType = searchParams.get('bucketType') as BucketType | null

    const filters: any = {}
    if (isActive !== null) filters.isActive = isActive === 'true'
    if (bucketType) filters.bucketType = bucketType

    const expenses = await recurringExpenseService.getRecurringExpenses(
      userId,
      filters
    )

    return NextResponse.json({
      success: true,
      data: { recurringExpenses: expenses },
    })
  } catch (error: any) {
    console.error('Failed to fetch recurring expenses:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch recurring expenses' },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/recurring-expenses
 * Add new recurring expense
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'User ID required' } },
        { status: 401 }
      )
    }

    const body = await request.json()

    const data = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    }

    const expense = await recurringExpenseService.addRecurringExpense(userId, data)

    return NextResponse.json({
      success: true,
      data: expense,
    })
  } catch (error: any) {
    console.error('Failed to add recurring expense:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to add recurring expense' },
      },
      { status: 500 }
    )
  }
}
