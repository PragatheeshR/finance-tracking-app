import { prisma } from '@/lib/prisma'
import { decimalToNumber } from '@/lib/utils/calculations'

export class AnalyticsService {
  /**
   * Get expense trends over time (monthly aggregation)
   */
  async getExpenseTrends(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'asc' },
    })

    // Group by month
    const monthlyData: Record<string, { date: string; total: number; count: number }> = {}

    expenses.forEach((expense) => {
      const monthKey = new Date(expense.date).toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { date: monthKey, total: 0, count: 0 }
      }
      monthlyData[monthKey].total += decimalToNumber(expense.amount)
      monthlyData[monthKey].count += 1
    })

    return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Get category breakdown (for pie chart)
   */
  async getCategoryBreakdown(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    })

    const categoryTotals: Record<string, number> = {}
    let grandTotal = 0

    expenses.forEach((expense) => {
      const amount = decimalToNumber(expense.amount)
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + amount
      grandTotal += amount
    })

    return Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total,
        percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }

  /**
   * Get budget vs actual comparison for current month
   */
  async getBudgetVsActual(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    // Get budgets
    const budgets = await prisma.budgetItem.findMany({
      where: {
        userId,
        year,
        month,
        isActive: true,
      },
    })

    // Get expenses
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
      spendingByCategory[expense.category] = (spendingByCategory[expense.category] || 0) + amount
    })

    // Combine
    return budgets.map((budget) => ({
      category: budget.category,
      budget: decimalToNumber(budget.monthlyAmount),
      actual: spendingByCategory[budget.category] || 0,
      difference: decimalToNumber(budget.monthlyAmount) - (spendingByCategory[budget.category] || 0),
      percentUsed: spendingByCategory[budget.category]
        ? ((spendingByCategory[budget.category] || 0) / decimalToNumber(budget.monthlyAmount)) * 100
        : 0,
    }))
  }

  /**
   * Get top spending categories for a period
   */
  async getTopCategories(
    userId: string,
    startDate: string,
    endDate: string,
    limit: number = 5
  ) {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    })

    const categoryTotals: Record<string, { total: number; count: number }> = {}

    expenses.forEach((expense) => {
      const amount = decimalToNumber(expense.amount)
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = { total: 0, count: 0 }
      }
      categoryTotals[expense.category].total += amount
      categoryTotals[expense.category].count += 1
    })

    return Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        average: data.total / data.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit)
  }

  /**
   * Get spending comparison between two periods
   */
  async getSpendingComparison(
    userId: string,
    period1Start: string,
    period1End: string,
    period2Start: string,
    period2End: string
  ) {
    const [period1Expenses, period2Expenses] = await Promise.all([
      prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: new Date(period1Start),
            lte: new Date(period1End),
          },
        },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: new Date(period2Start),
            lte: new Date(period2End),
          },
        },
      }),
    ])

    const period1Total = period1Expenses.reduce(
      (sum, exp) => sum + decimalToNumber(exp.amount),
      0
    )
    const period2Total = period2Expenses.reduce(
      (sum, exp) => sum + decimalToNumber(exp.amount),
      0
    )

    const difference = period2Total - period1Total
    const percentChange = period1Total > 0 ? (difference / period1Total) * 100 : 0

    return {
      period1: {
        total: period1Total,
        count: period1Expenses.length,
        average: period1Expenses.length > 0 ? period1Total / period1Expenses.length : 0,
      },
      period2: {
        total: period2Total,
        count: period2Expenses.length,
        average: period2Expenses.length > 0 ? period2Total / period2Expenses.length : 0,
      },
      difference,
      percentChange,
      trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'flat',
    }
  }

  /**
   * Get expense statistics summary
   */
  async getExpenseStats(userId: string, year: number, month: number) {
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

    if (expenses.length === 0) {
      return {
        total: 0,
        count: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        byBucketType: {},
      }
    }

    const amounts = expenses.map((e) => decimalToNumber(e.amount))
    const total = amounts.reduce((sum, amt) => sum + amt, 0)

    // Group by bucket type
    const byBucketType: Record<string, { total: number; count: number }> = {}
    expenses.forEach((expense) => {
      const amount = decimalToNumber(expense.amount)
      if (!byBucketType[expense.bucketType]) {
        byBucketType[expense.bucketType] = { total: 0, count: 0 }
      }
      byBucketType[expense.bucketType].total += amount
      byBucketType[expense.bucketType].count += 1
    })

    return {
      total,
      count: expenses.length,
      average: total / expenses.length,
      highest: Math.max(...amounts),
      lowest: Math.min(...amounts),
      byBucketType,
    }
  }

  /**
   * Get daily spending pattern
   */
  async getDailySpending(userId: string, year: number, month: number) {
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
      orderBy: { date: 'asc' },
    })

    const dailyData: Record<string, number> = {}

    expenses.forEach((expense) => {
      const dayKey = expense.date.toISOString().split('T')[0] // YYYY-MM-DD
      dailyData[dayKey] = (dailyData[dayKey] || 0) + decimalToNumber(expense.amount)
    })

    return Object.entries(dailyData)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
}

export const analyticsService = new AnalyticsService()
