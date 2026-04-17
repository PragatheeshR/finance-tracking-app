import { NextRequest, NextResponse } from 'next/server'
import { recurringExpenseService } from '@/lib/services/recurring-expense.service'

/**
 * GET /api/v1/recurring-expenses/[id]
 * Get recurring expense by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'User ID required' } },
        { status: 401 }
      )
    }

    const { id } = await params
    const expense = await recurringExpenseService.getRecurringExpenseById(userId, id)

    return NextResponse.json({
      success: true,
      data: expense,
    })
  } catch (error: any) {
    console.error('Failed to fetch recurring expense:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch recurring expense' },
      },
      { status: error.message === 'Recurring expense not found' ? 404 : 500 }
    )
  }
}

/**
 * PUT /api/v1/recurring-expenses/[id]
 * Update recurring expense
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'User ID required' } },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const data = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    }

    const updated = await recurringExpenseService.updateRecurringExpense(
      userId,
      id,
      data
    )

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Failed to update recurring expense:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to update recurring expense' },
      },
      { status: error.message === 'Recurring expense not found' ? 404 : 500 }
    )
  }
}

/**
 * DELETE /api/v1/recurring-expenses/[id]
 * Delete recurring expense
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'User ID required' } },
        { status: 401 }
      )
    }

    const { id } = await params
    await recurringExpenseService.deleteRecurringExpense(userId, id)

    return NextResponse.json({
      success: true,
      data: { message: 'Recurring expense deleted successfully' },
    })
  } catch (error: any) {
    console.error('Failed to delete recurring expense:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to delete recurring expense' },
      },
      { status: error.message === 'Recurring expense not found' ? 404 : 500 }
    )
  }
}
