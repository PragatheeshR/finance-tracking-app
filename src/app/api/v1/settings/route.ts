import { NextRequest, NextResponse } from 'next/server'
import { settingsService } from '@/lib/services/settings.service'
import { requireAuthFromRequest } from '@/lib/auth-request'

/**
 * GET /api/v1/settings
 * Get user settings
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const settings = await settingsService.getUserSettings(userId!)

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error: any) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to fetch settings' },
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/v1/settings
 * Update user settings
 */
export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const body = await request.json()

    const updated = await settingsService.updateUserSettings(userId!, body)

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Failed to update settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to update settings' },
      },
      { status: 500 }
    )
  }
}
