import { NextRequest, NextResponse } from 'next/server'
import { goalsService } from '@/lib/services/goals.service'
import { GoalCategory, GoalStatus } from '@prisma/client'

/**
 * GET /api/v1/goals
 * Get all goals
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
    const status = searchParams.get('status') as GoalStatus | null
    const category = searchParams.get('category') as GoalCategory | null
    const isActive = searchParams.get('isActive')

    const filters: any = {}
    if (status) filters.status = status
    if (category) filters.category = category
    if (isActive !== null) filters.isActive = isActive === 'true'

    const goals = await goalsService.getGoals(userId, filters)

    return NextResponse.json({
      success: true,
      data: { goals },
    })
  } catch (error: any) {
    console.error('Failed to fetch goals:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch goals' },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/goals
 * Add new goal
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
      deadline: body.deadline ? new Date(body.deadline) : undefined,
    }

    const goal = await goalsService.addGoal(userId, data)

    return NextResponse.json({
      success: true,
      data: goal,
    })
  } catch (error: any) {
    console.error('Failed to add goal:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to add goal' },
      },
      { status: 500 }
    )
  }
}
