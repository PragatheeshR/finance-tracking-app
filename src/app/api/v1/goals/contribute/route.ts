import { NextRequest, NextResponse } from 'next/server'
import { goalsService } from '@/lib/services/goals.service'

/**
 * POST /api/v1/goals/contribute
 * Add contribution or withdrawal to a goal
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
    const { goalId, amount, type } = body

    if (!goalId || amount === undefined || !type) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'goalId, amount, and type are required' },
        },
        { status: 400 }
      )
    }

    let updated
    if (type === 'contribute') {
      updated = await goalsService.addContribution(userId, goalId, amount)
    } else if (type === 'withdraw') {
      updated = await goalsService.withdrawFromGoal(userId, goalId, amount)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Type must be either "contribute" or "withdraw"' },
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Failed to update goal contribution:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to update goal contribution' },
      },
      { status: error.message === 'Goal not found' ? 404 : 500 }
    )
  }
}
