import { NextRequest, NextResponse } from 'next/server'
import { goalsService } from '@/lib/services/goals.service'

/**
 * GET /api/v1/goals/[id]
 * Get goal by ID
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
    const goal = await goalsService.getGoalById(userId, id)

    // Calculate progress
    const progress = goalsService.calculateGoalProgress(goal)

    return NextResponse.json({
      success: true,
      data: { ...goal, progress },
    })
  } catch (error: any) {
    console.error('Failed to fetch goal:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch goal' },
      },
      { status: error.message === 'Goal not found' ? 404 : 500 }
    )
  }
}

/**
 * PUT /api/v1/goals/[id]
 * Update goal
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
      deadline: body.deadline ? new Date(body.deadline) : undefined,
    }

    const updated = await goalsService.updateGoal(userId, id, data)

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Failed to update goal:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to update goal' },
      },
      { status: error.message === 'Goal not found' ? 404 : 500 }
    )
  }
}

/**
 * DELETE /api/v1/goals/[id]
 * Delete goal
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
    await goalsService.deleteGoal(userId, id)

    return NextResponse.json({
      success: true,
      data: { message: 'Goal deleted successfully' },
    })
  } catch (error: any) {
    console.error('Failed to delete goal:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to delete goal' },
      },
      { status: error.message === 'Goal not found' ? 404 : 500 }
    )
  }
}
