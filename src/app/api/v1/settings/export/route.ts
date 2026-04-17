import { NextRequest, NextResponse } from 'next/server'
import { settingsService } from '@/lib/services/settings.service'
import { requireAuthFromRequest } from '@/lib/auth-request'

/**
 * GET /api/v1/settings/export
 * Export all user data
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { error, userId } = await requireAuthFromRequest(request)
    if (error) return error

    const data = await settingsService.exportUserData(userId!)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Failed to export data:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || 'Failed to export data' },
      },
      { status: 500 }
    )
  }
}
