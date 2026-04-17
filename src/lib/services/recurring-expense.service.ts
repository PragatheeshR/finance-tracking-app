import { prisma } from '@/lib/prisma'
import { BucketType, Prisma } from '@prisma/client'

export class RecurringExpenseService {
  /**
   * Get all recurring expenses for a user
   */
  async getRecurringExpenses(
    userId: string,
    filters?: {
      isActive?: boolean
      bucketType?: BucketType
    }
  ) {
    const where: Prisma.RecurringExpenseWhereInput = {
      userId,
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters?.bucketType && { bucketType: filters.bucketType }),
    }

    const expenses = await prisma.recurringExpense.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return expenses
  }

  /**
   * Get recurring expense by ID
   */
  async getRecurringExpenseById(userId: string, id: string) {
    const expense = await prisma.recurringExpense.findFirst({
      where: { id, userId },
    })

    if (!expense) {
      throw new Error('Recurring expense not found')
    }

    return expense
  }

  /**
   * Add new recurring expense
   */
  async addRecurringExpense(
    userId: string,
    data: {
      bucketType: BucketType
      category: string
      description: string
      amount: number
      frequency: string
      startDate: Date
      endDate?: Date
      isActive?: boolean
    }
  ) {
    const expense = await prisma.recurringExpense.create({
      data: {
        userId,
        bucketType: data.bucketType,
        category: data.category,
        description: data.description,
        amount: new Prisma.Decimal(data.amount),
        frequency: data.frequency,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive ?? true,
      },
    })

    return expense
  }

  /**
   * Update recurring expense
   */
  async updateRecurringExpense(
    userId: string,
    id: string,
    data: Partial<{
      bucketType: BucketType
      category: string
      description: string
      amount: number
      frequency: string
      startDate: Date
      endDate: Date
      isActive: boolean
    }>
  ) {
    // Check if exists
    await this.getRecurringExpenseById(userId, id)

    const updated = await prisma.recurringExpense.update({
      where: { id },
      data: {
        ...(data.bucketType && { bucketType: data.bucketType }),
        ...(data.category && { category: data.category }),
        ...(data.description && { description: data.description }),
        ...(data.amount !== undefined && {
          amount: new Prisma.Decimal(data.amount),
        }),
        ...(data.frequency && { frequency: data.frequency }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return updated
  }

  /**
   * Delete recurring expense
   */
  async deleteRecurringExpense(userId: string, id: string) {
    // Check if exists
    await this.getRecurringExpenseById(userId, id)

    await prisma.recurringExpense.delete({
      where: { id },
    })

    return { success: true }
  }

  /**
   * Generate expenses from recurring templates
   * This should be called by a cron job
   */
  async generateRecurringExpenses() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active recurring expenses
    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        startDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
    })

    const generated = []

    for (const recurring of recurringExpenses) {
      const shouldGenerate = this.shouldGenerateExpense(recurring, today)

      if (shouldGenerate) {
        // Create the expense
        const expense = await prisma.expense.create({
          data: {
            userId: recurring.userId,
            date: today,
            bucketType: recurring.bucketType,
            category: recurring.category,
            description: `${recurring.description} (Auto-generated)`,
            amount: recurring.amount,
            tags: ['recurring', 'auto-generated'],
            isRecurring: true,
            recurringId: recurring.id,
          },
        })

        // Update lastGenerated
        await prisma.recurringExpense.update({
          where: { id: recurring.id },
          data: { lastGenerated: today },
        })

        generated.push(expense)
      }
    }

    return {
      count: generated.length,
      expenses: generated,
    }
  }

  /**
   * Check if expense should be generated today
   */
  private shouldGenerateExpense(
    recurring: any,
    today: Date
  ): boolean {
    const lastGenerated = recurring.lastGenerated
      ? new Date(recurring.lastGenerated)
      : null

    // If never generated, check if start date is today or earlier
    if (!lastGenerated) {
      return new Date(recurring.startDate) <= today
    }

    // Calculate next due date based on frequency
    const nextDueDate = this.calculateNextDueDate(
      lastGenerated,
      recurring.frequency
    )

    return nextDueDate <= today
  }

  /**
   * Calculate next due date based on frequency
   */
  private calculateNextDueDate(lastDate: Date, frequency: string): Date {
    const next = new Date(lastDate)

    switch (frequency.toUpperCase()) {
      case 'DAILY':
        next.setDate(next.getDate() + 1)
        break
      case 'WEEKLY':
        next.setDate(next.getDate() + 7)
        break
      case 'BIWEEKLY':
        next.setDate(next.getDate() + 14)
        break
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1)
        break
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3)
        break
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1)
        break
      default:
        // Default to monthly
        next.setMonth(next.getMonth() + 1)
    }

    return next
  }

  /**
   * Get upcoming recurring expenses (next 30 days)
   */
  async getUpcomingRecurring(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: {
        userId,
        isActive: true,
        startDate: { lte: thirtyDaysFromNow },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
    })

    const upcoming = recurringExpenses.map((recurring) => {
      const lastGenerated = recurring.lastGenerated || recurring.startDate
      const nextDueDate = this.calculateNextDueDate(
        new Date(lastGenerated),
        recurring.frequency
      )

      return {
        ...recurring,
        nextDueDate,
        daysUntilDue: Math.ceil(
          (nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }
    })

    return upcoming
      .filter((item) => item.nextDueDate <= thirtyDaysFromNow)
      .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime())
  }
}

export const recurringExpenseService = new RecurringExpenseService()
