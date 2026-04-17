import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export class SettingsService {
  /**
   * Get user settings
   */
  async getUserSettings(userId: string) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          dateFormat: 'DD/MM/YYYY',
          theme: 'light',
          notifications: {
            email: true,
            push: false,
            budgetAlerts: true,
            recurringReminders: true,
          },
          fireNumber: 0,
          fireMultiplier: 28,
          onboardingComplete: false,
          showEmptyStates: true,
        },
      })
    }

    return settings
  }

  /**
   * Update user settings
   */
  async updateUserSettings(
    userId: string,
    data: Partial<{
      currency: string
      timezone: string
      dateFormat: string
      theme: string
      notifications: any
      fireNumber: number
      fireMultiplier: number
      onboardingComplete: boolean
      showEmptyStates: boolean
    }>
  ) {
    // Ensure settings exist first
    await this.getUserSettings(userId)

    const updated = await prisma.userSettings.update({
      where: { userId },
      data: {
        ...data,
        fireNumber: data.fireNumber ? new Prisma.Decimal(data.fireNumber) : undefined,
      },
    })

    return updated
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    data: {
      name?: string
      email?: string
      image?: string
    }
  ) {
    // Check if email is already taken by another user
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId },
        },
      })

      if (existing) {
        throw new Error('Email already in use')
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })

    return updated
  }

  /**
   * Export user data
   */
  async exportUserData(userId: string) {
    const [
      user,
      settings,
      holdings,
      expenses,
      income,
      budgetItems,
      categories,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.holding.findMany({ where: { userId } }),
      prisma.expense.findMany({ where: { userId } }),
      prisma.income.findMany({ where: { userId } }),
      prisma.budgetItem.findMany({ where: { userId } }),
      prisma.expenseCategory.findMany({ where: { userId } }),
    ])

    return {
      user,
      settings,
      holdings,
      expenses,
      income,
      budgetItems,
      categories,
      exportedAt: new Date().toISOString(),
    }
  }
}

export const settingsService = new SettingsService()
