import { NextRequest, NextResponse } from 'next/server'
import { recurringExpenseService } from '@/lib/services/recurring-expense.service'

/**
 * POST /api/v1/recurring-expenses/generate
 * Generate expenses from recurring templates
 * This should be called by a cron job or manually
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add API key authentication for cron job
    const apiKey = request.headers.get('x-api-key')
    const expectedKey = process.env.CRON_API_KEY || 'dev-key-123'

    if (apiKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const result = await recurringExpenseService.generateRecurringExpenses()

    return NextResponse.json({
      success: true,
      data: result,
      message: `Generated ${result.count} recurring expenses`,
    })
  } catch (error: any) {
    console.error('Failed to generate recurring expenses:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to generate expenses' },
      },
      { status: 500 }
    )
  }
}
