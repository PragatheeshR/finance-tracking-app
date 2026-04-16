import { NextResponse } from 'next/server'
import { ApiResponse } from '@/types/api'

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  message: string,
  code: string = 'ERROR',
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

/**
 * Handle API errors with appropriate status codes
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  if (error instanceof Error) {
    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      return errorResponse('Database error occurred', 'DATABASE_ERROR', 500)
    }

    // Validation errors (Zod)
    if (error.name === 'ZodError') {
      return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, error)
    }

    return errorResponse(error.message, 'INTERNAL_ERROR', 500)
  }

  return errorResponse('An unexpected error occurred', 'UNKNOWN_ERROR', 500)
}
