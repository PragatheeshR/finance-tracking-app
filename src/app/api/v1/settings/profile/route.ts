import { NextRequest, NextResponse } from 'next/server'
import { settingsService } from '@/lib/services/settings.service'
import { requireAuthFromRequest } from '@/lib/auth-request'

/**
 * GET /api/v1/settings/profile
 * Get user profile
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const profile = await settingsService.getUserProfile(userId!)

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error: any) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch profile' },
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/settings/profile
 * Update user profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const body = await request.json()

    const updated = await settingsService.updateUserProfile(userId!, body)

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Failed to update profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to update profile' },
      },
      { status: 500 }
    )
  }
}
