import { NextRequest, NextResponse } from 'next/server'
import { insuranceService } from '@/lib/services/insurance.service'

/**
 * GET /api/v1/insurance/summary
 * Get insurance summary and statistics
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

    const summary = await insuranceService.getInsuranceSummary(userId)

    return NextResponse.json({
      success: true,
      data: summary,
    })
  } catch (error: any) {
    console.error('Failed to fetch insurance summary:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch summary' },
      },
      { status: 500 }
    )
  }
}
