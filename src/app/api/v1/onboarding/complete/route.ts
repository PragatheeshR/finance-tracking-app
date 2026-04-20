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

    // Create default expense categories for new user if they don't exist
    const existingExpenseCategories = await prisma.expenseCategory.count({
      where: { userId: session.user.id },
    })

    if (existingExpenseCategories === 0) {
      const defaultExpenseCategories = [
        { name: 'groceries', displayName: 'Groceries', icon: '🛒', color: '#10B981', sortOrder: 1 },
        { name: 'dining', displayName: 'Dining & Food', icon: '🍽️', color: '#F59E0B', sortOrder: 2 },
        { name: 'transport', displayName: 'Transportation', icon: '🚗', color: '#3B82F6', sortOrder: 3 },
        { name: 'utilities', displayName: 'Utilities', icon: '💡', color: '#6366F1', sortOrder: 4 },
        { name: 'rent', displayName: 'Rent/Mortgage', icon: '🏠', color: '#8B5CF6', sortOrder: 5 },
        { name: 'healthcare', displayName: 'Healthcare', icon: '🏥', color: '#EF4444', sortOrder: 6 },
        { name: 'entertainment', displayName: 'Entertainment', icon: '🎬', color: '#EC4899', sortOrder: 7 },
        { name: 'shopping', displayName: 'Shopping', icon: '🛍️', color: '#F97316', sortOrder: 8 },
        { name: 'education', displayName: 'Education', icon: '📚', color: '#14B8A6', sortOrder: 9 },
        { name: 'insurance', displayName: 'Insurance', icon: '🛡️', color: '#06B6D4', sortOrder: 10 },
        { name: 'subscriptions', displayName: 'Subscriptions', icon: '📱', color: '#8B5CF6', sortOrder: 11 },
        { name: 'personal_care', displayName: 'Personal Care', icon: '💆', color: '#A855F7', sortOrder: 12 },
        { name: 'travel', displayName: 'Travel', icon: '✈️', color: '#0EA5E9', sortOrder: 13 },
        { name: 'gifts', displayName: 'Gifts & Donations', icon: '🎁', color: '#EC4899', sortOrder: 14 },
        { name: 'savings', displayName: 'Savings & Investments', icon: '💰', color: '#84CC16', sortOrder: 15 },
        { name: 'other', displayName: 'Other', icon: '📝', color: '#64748B', sortOrder: 16 },
      ]

      await prisma.expenseCategory.createMany({
        data: defaultExpenseCategories.map(cat => ({
          userId: session.user.id,
          ...cat,
          isDefault: true,
          isActive: true,
        })),
      })
    }

    // Note: Asset categories are global and seeded in prisma/seed.ts
    // They don't need to be created per-user

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
