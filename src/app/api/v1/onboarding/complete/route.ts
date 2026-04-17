import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-response'

/**
 * POST /api/v1/onboarding/complete
 * Complete user onboarding and save preferences
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const body = await request.json()
    const {
      monthlyIncome,
      occupation,
      currency,
      timezone,
      budgetCycle,
      primaryGoal,
      retirementAge,
      savingsRate,
    } = body

    // Update or create user settings
    await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        currency: currency || 'INR',
        timezone: timezone || 'Asia/Kolkata',
        onboardingComplete: true,
      },
      create: {
        userId: session.user.id,
        currency: currency || 'INR',
        timezone: timezone || 'Asia/Kolkata',
        onboardingComplete: true,
      },
    })

    // Update user profile if income/occupation provided
    if (monthlyIncome || occupation) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,
          occupation: occupation || null,
        },
      })
    }

    // Create initial goal if provided
    if (primaryGoal) {
      const goalData: any = {
        userId: session.user.id,
        name: getGoalName(primaryGoal),
        category: primaryGoal.toUpperCase(),
        priority: 'HIGH',
        status: 'ACTIVE',
        isActive: true,
      }

      if (retirementAge) {
        const currentYear = new Date().getFullYear()
        const targetYear = currentYear + (parseInt(retirementAge) - 30) // Assuming user is 30
        goalData.deadline = new Date(`${targetYear}-12-31`)
      }

      if (monthlyIncome && savingsRate) {
        goalData.monthlyTarget = (parseFloat(monthlyIncome) * parseFloat(savingsRate)) / 100
      }

      await prisma.goal.create({
        data: goalData,
      })
    }

    return successResponse(
      { message: 'Onboarding completed successfully' },
      'Welcome aboard!'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

function getGoalName(goal: string): string {
  const goalNames: Record<string, string> = {
    retirement: 'Retirement Planning',
    house: 'Buy a House',
    education: 'Education Fund',
    wealth: 'Build Wealth',
    debt: 'Pay Off Debt',
    emergency: 'Emergency Fund',
  }
  return goalNames[goal] || 'Financial Goal'
}
