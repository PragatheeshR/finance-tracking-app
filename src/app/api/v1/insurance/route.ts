import { NextRequest, NextResponse } from 'next/server'
import { insuranceService } from '@/lib/services/insurance.service'
import { PolicyType } from '@prisma/client'

/**
 * GET /api/v1/insurance
 * Get all insurance policies with optional filters
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
    const policyType = searchParams.get('policyType') as PolicyType | null
    const isActive = searchParams.get('isActive')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const filters: any = {}
    if (policyType) filters.policyType = policyType
    if (isActive !== null) filters.isActive = isActive === 'true'
    if (startDate) filters.startDate = new Date(startDate)
    if (endDate) filters.endDate = new Date(endDate)

    const policies = await insuranceService.getPolicies(userId, filters)

    return NextResponse.json({
      success: true,
      data: { policies },
    })
  } catch (error: any) {
    console.error('Failed to fetch insurance policies:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch policies' },
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/insurance
 * Add new insurance policy
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

    // Convert date strings to Date objects
    const data = {
      ...body,
      validTill: body.validTill ? new Date(body.validTill) : undefined,
      premiumDueDate: body.premiumDueDate
        ? new Date(body.premiumDueDate)
        : undefined,
    }

    const policy = await insuranceService.addPolicy(userId, data)

    return NextResponse.json({
      success: true,
      data: policy,
    })
  } catch (error: any) {
    console.error('Failed to add insurance policy:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to add policy' },
      },
      { status: 500 }
    )
  }
}
