import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/utils/api-response'

/**
 * GET /api/v1/categories/asset
 * Get all asset categories
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.assetCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        displayName: true,
        type: true,
        icon: true,
        color: true,
      },
    })

    return successResponse(categories, 'Asset categories retrieved successfully')
  } catch (error) {
    console.error('Error fetching asset categories:', error)
    return errorResponse(
      'Failed to fetch asset categories',
      'INTERNAL_ERROR',
      500
    )
  }
}
