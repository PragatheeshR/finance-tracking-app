import { NextRequest, NextResponse } from 'next/server'
import { goalsService } from '@/lib/services/goals.service'

/**
 * GET /api/v1/goals/summary
 * Get goals summary and statistics
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

    const summary = await goalsService.getGoalsSummary(userId)

    return NextResponse.json({
      success: true,
      data: summary,
    })
  } catch (error: any) {
    console.error('Failed to fetch goals summary:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch goals summary' },
      },
      { status: 500 }
    )
  }
}
