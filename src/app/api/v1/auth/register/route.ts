import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations/auth.schema'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'
import bcrypt from 'bcryptjs'

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return errorResponse('User with this email already exists', 'USER_EXISTS', 409)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    // Create default user settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        onboardingComplete: false,
      },
    })

    return successResponse(
      { user },
      'User registered successfully. Please login.',
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
