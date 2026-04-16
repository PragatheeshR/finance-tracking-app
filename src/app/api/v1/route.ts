import { NextResponse } from 'next/server'

/**
 * GET /api/v1
 * API documentation and health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Finance Tracker API v1',
    version: '1.0.0',
    endpoints: {
      portfolio: {
        summary: 'GET /api/v1/portfolio/summary',
        holdings: {
          list: 'GET /api/v1/portfolio/holdings',
          create: 'POST /api/v1/portfolio/holdings',
          get: 'GET /api/v1/portfolio/holdings/:id',
          update: 'PUT /api/v1/portfolio/holdings/:id',
          delete: 'DELETE /api/v1/portfolio/holdings/:id',
        },
        rebalance: 'GET /api/v1/portfolio/rebalance',
      },
      expenses: {
        list: 'GET /api/v1/expenses',
        create: 'POST /api/v1/expenses',
        update: 'PUT /api/v1/expenses/:id',
        delete: 'DELETE /api/v1/expenses/:id',
        bulkImport: 'POST /api/v1/expenses/bulk-import',
      },
      categories: {
        expense: {
          list: 'GET /api/v1/categories/expense',
          create: 'POST /api/v1/categories/expense',
          update: 'PUT /api/v1/categories/expense/:id',
          delete: 'DELETE /api/v1/categories/expense/:id',
        },
      },
    },
    note: 'All endpoints require x-user-id header for authentication (temporary)',
    timestamp: new Date().toISOString(),
  })
}
