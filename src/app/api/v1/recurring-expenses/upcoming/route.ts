import { NextRequest, NextResponse } from 'next/server'
import { recurringExpenseService } from '@/lib/services/recurring-expense.service'

/**
 * GET /api/v1/recurring-expenses/upcoming
 * Get upcoming recurring expenses (next 30 days)
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

    const upcoming = await recurringExpenseService.getUpcomingRecurring(userId)

    return NextResponse.json({
      success: true,
      data: { upcoming },
    })
  } catch (error: any) {
    console.error('Failed to fetch upcoming recurring expenses:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch upcoming expenses' },
      },
      { status: 500 }
    )
  }
}
