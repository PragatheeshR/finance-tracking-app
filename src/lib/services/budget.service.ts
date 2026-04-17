import { prisma } from '@/lib/prisma'
import { numberToDecimal, decimalToNumber } from '@/lib/utils/calculations'
import type { CreateBudgetItemInput, UpdateBudgetItemInput } from '@/lib/validations/budget.schema'

export class BudgetService {
  /**
   * Get all budget items for a user for a specific month/year
   */
  async getBudgets(userId: string, year: number, month: number) {
    const budgets = await prisma.budgetItem.findMany({
      where: {
        userId,
        year,
        month,
        isActive: true,
      },
      orderBy: { category: 'asc' },
    })

    // Get actual spending for each category
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {}
    expenses.forEach((expense) => {
      const amount = decimalToNumber(expense.amount)
      if (!spendingByCategory[expense.category]) {
        spendingByCategory[expense.category] = 0
      }
      spendingByCategory[expense.category] += amount
    })

    // Combine budget with actual spending
    const budgetsWithSpending = budgets.map((budget) => ({
      ...budget,
      monthlyAmount: decimalToNumber(budget.monthlyAmount),
      spent: spendingByCategory[budget.category] || 0,
      remaining: decimalToNumber(budget.monthlyAmount) - (spendingByCategory[budget.category] || 0),
      percentUsed: spendingByCategory[budget.category]
        ? ((spendingByCategory[budget.category] || 0) / decimalToNumber(budget.monthlyAmount)) * 100
        : 0,
    }))

    // Calculate totals
    const totalBudget = budgetsWithSpending.reduce((sum, b) => sum + b.monthlyAmount, 0)
    const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0)
    const totalRemaining = totalBudget - totalSpent

    return {
      budgets: budgetsWithSpending,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,
        percentUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      },
    }
  }

  /**
   * Get budget history for a category across multiple months
   */
  async getBudgetHistory(
    userId: string,
    category: string,
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
  ) {
    const budgets = await prisma.budgetItem.findMany({
      where: {
        userId,
        category,
        OR: [
          { year: startYear, month: { gte: startMonth } },
          { year: { gt: startYear, lt: endYear } },
          { year: endYear, month: { lte: endMonth } },
        ],
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    })

    return budgets.map((b) => ({
      ...b,
      monthlyAmount: decimalToNumber(b.monthlyAmount),
    }))
  }

  /**
   * Create a new budget item
   */
  async createBudget(userId: string, data: CreateBudgetItemInput) {
    const budget = await prisma.budgetItem.create({
      data: {
        userId,
        category: data.category,
        monthlyAmount: numberToDecimal(data.monthlyAmount),
        year: data.year,
        month: data.month,
        isActive: true,
      },
    })

    return {
      ...budget,
      monthlyAmount: decimalToNumber(budget.monthlyAmount),
    }
  }

  /**
   * Bulk create budgets for multiple categories
   */
  async bulkCreateBudgets(
    userId: string,
    year: number,
    month: number,
    budgets: Array<{ category: string; monthlyAmount: number }>
  ) {
    const created = await Promise.all(
      budgets.map((budget) =>
        prisma.budgetItem.upsert({
          where: {
            userId_category_year_month: {
              userId,
              category: budget.category,
              year,
              month,
            },
          },
          update: {
            monthlyAmount: numberToDecimal(budget.monthlyAmount),
            isActive: true,
          },
          create: {
            userId,
            category: budget.category,
            monthlyAmount: numberToDecimal(budget.monthlyAmount),
            year,
            month,
            isActive: true,
          },
        })
      )
    )

    return created.map((b) => ({
      ...b,
      monthlyAmount: decimalToNumber(b.monthlyAmount),
    }))
  }

  /**
   * Update a budget item
   */
  async updateBudget(userId: string, budgetId: string, data: UpdateBudgetItemInput) {
    // Verify ownership
    const existing = await prisma.budgetItem.findFirst({
      where: { id: budgetId, userId },
    })

    if (!existing) {
      throw new Error('Budget not found')
    }

    const updateData: any = {}
    if (data.category) updateData.category = data.category
    if (data.monthlyAmount !== undefined) updateData.monthlyAmount = numberToDecimal(data.monthlyAmount)
    if (data.year !== undefined) updateData.year = data.year
    if (data.month !== undefined) updateData.month = data.month
    if ((data as any).isActive !== undefined) updateData.isActive = (data as any).isActive

    const updated = await prisma.budgetItem.update({
      where: { id: budgetId },
      data: updateData,
    })

    return {
      ...updated,
      monthlyAmount: decimalToNumber(updated.monthlyAmount),
    }
  }

  /**
   * Delete a budget item
   */
  async deleteBudget(userId: string, budgetId: string) {
    // Verify ownership
    const existing = await prisma.budgetItem.findFirst({
      where: { id: budgetId, userId },
    })

    if (!existing) {
      throw new Error('Budget not found')
    }

    await prisma.budgetItem.delete({ where: { id: budgetId } })
  }

  /**
   * Copy budgets from one month to another
   */
  async copyBudgets(
    userId: string,
    fromYear: number,
    fromMonth: number,
    toYear: number,
    toMonth: number
  ) {
    const sourceBudgets = await prisma.budgetItem.findMany({
      where: {
        userId,
        year: fromYear,
        month: fromMonth,
        isActive: true,
      },
    })

    if (sourceBudgets.length === 0) {
      throw new Error('No budgets found for the source month')
    }

    const created = await Promise.all(
      sourceBudgets.map((budget) =>
        prisma.budgetItem.upsert({
          where: {
            userId_category_year_month: {
              userId,
              category: budget.category,
              year: toYear,
              month: toMonth,
            },
          },
          update: {
            monthlyAmount: budget.monthlyAmount,
            isActive: true,
          },
          create: {
            userId,
            category: budget.category,
            monthlyAmount: budget.monthlyAmount,
            year: toYear,
            month: toMonth,
            isActive: true,
          },
        })
      )
    )

    return created.map((b) => ({
      ...b,
      monthlyAmount: decimalToNumber(b.monthlyAmount),
    }))
  }
}

export const budgetService = new BudgetService()
