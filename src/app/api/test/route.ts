import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const assetCategoriesCount = await prisma.assetCategory.count()
    const templatesCount = await prisma.allocationTemplate.count()

    // Get sample data
    const categories = await prisma.assetCategory.findMany({
      take: 5,
      orderBy: { sortOrder: 'asc' },
    })

    const templates = await prisma.allocationTemplate.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        stats: {
          assetCategories: assetCategoriesCount,
          allocationTemplates: templatesCount,
        },
        sampleCategories: categories,
        templates: templates,
      },
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
