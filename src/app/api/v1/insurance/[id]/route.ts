import { NextRequest, NextResponse } from 'next/server'
import { insuranceService } from '@/lib/services/insurance.service'

/**
 * GET /api/v1/insurance/[id]
 * Get insurance policy by ID
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
    const policy = await insuranceService.getPolicyById(userId, id)

    return NextResponse.json({
      success: true,
      data: policy,
    })
  } catch (error: any) {
    console.error('Failed to fetch insurance policy:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch policy' },
      },
      { status: error.message === 'Insurance policy not found' ? 404 : 500 }
    )
  }
}

/**
 * PUT /api/v1/insurance/[id]
 * Update insurance policy
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

    // Convert date strings to Date objects
    const data = {
      ...body,
      validTill: body.validTill ? new Date(body.validTill) : undefined,
      premiumDueDate: body.premiumDueDate
        ? new Date(body.premiumDueDate)
        : undefined,
    }

    const updated = await insuranceService.updatePolicy(userId, id, data)

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Failed to update insurance policy:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to update policy' },
      },
      { status: error.message === 'Insurance policy not found' ? 404 : 500 }
    )
  }
}

/**
 * DELETE /api/v1/insurance/[id]
 * Delete insurance policy
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
    await insuranceService.deletePolicy(userId, id)

    return NextResponse.json({
      success: true,
      data: { message: 'Policy deleted successfully' },
    })
  } catch (error: any) {
    console.error('Failed to delete insurance policy:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to delete policy' },
      },
      { status: error.message === 'Insurance policy not found' ? 404 : 500 }
    )
  }
}
