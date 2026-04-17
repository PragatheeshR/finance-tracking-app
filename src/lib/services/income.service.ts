import { prisma } from '@/lib/prisma'
import { numberToDecimal, decimalToNumber } from '@/lib/utils/calculations'
import type { CreateIncomeInput, UpdateIncomeInput } from '@/lib/validations/income.schema'

export class IncomeService {
  /**
   * Get income records with filters
   */
  async getIncome(
    userId: string,
    filters: {
      startDate?: string
      endDate?: string
      source?: string
      category?: string
      page?: number
      pageSize?: number
    }
  ) {
    const { startDate, endDate, source, category, page = 1, pageSize = 20 } = filters

    const where: any = { userId }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    if (source) where.source = source
    if (category) where.category = category

    const [income, total] = await Promise.all([
      prisma.income.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.income.count({ where }),
    ])

    return {
      income,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  /**
   * Get income summary for a period
   */
  async getIncomeSummary(
    userId: string,
    startDate?: string,
    endDate?: string
  ) {
    const where: any = { userId }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const incomeRecords = await prisma.income.findMany({ where })

    if (incomeRecords.length === 0) {
      return {
        totalIncome: 0,
        bySource: {},
        count: 0,
      }
    }

    const bySource: Record<string, number> = {}
    let totalIncome = 0

    incomeRecords.forEach((income) => {
      const amount = decimalToNumber(income.amount)
      bySource[income.source] = (bySource[income.source] || 0) + amount
      totalIncome += amount
    })

    return {
      totalIncome,
      bySource,
      count: incomeRecords.length,
    }
  }

  /**
   * Get income vs expense comparison
   */
  async getIncomeVsExpense(
    userId: string,
    year: number,
    month: number
  ) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const [incomeRecords, expenses] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ])

    const totalIncome = incomeRecords.reduce(
      (sum, income) => sum + decimalToNumber(income.amount),
      0
    )
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + decimalToNumber(expense.amount),
      0
    )

    const savings = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

    return {
      totalIncome,
      totalExpense,
      savings,
      savingsRate,
      incomeCount: incomeRecords.length,
      expenseCount: expenses.length,
    }
  }

  /**
   * Add new income
   */
  async addIncome(userId: string, data: CreateIncomeInput) {
    const income = await prisma.income.create({
      data: {
        userId,
        date: new Date(data.date),
        source: data.source,
        category: data.category,
        description: data.description,
        amount: numberToDecimal(data.amount),
        tags: data.tags || [],
        isRecurring: data.isRecurring || false,
      },
    })

    return income
  }

  /**
   * Update income
   */
  async updateIncome(userId: string, incomeId: string, data: UpdateIncomeInput) {
    // Verify ownership
    const existing = await prisma.income.findFirst({
      where: { id: incomeId, userId },
    })

    if (!existing) {
      throw new Error('Income not found')
    }

    const updateData: any = {}
    if (data.date) updateData.date = new Date(data.date)
    if (data.source) updateData.source = data.source
    if (data.category) updateData.category = data.category
    if (data.description) updateData.description = data.description
    if (data.amount !== undefined) updateData.amount = numberToDecimal(data.amount)
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring

    const updated = await prisma.income.update({
      where: { id: incomeId },
      data: updateData,
    })

    return updated
  }

  /**
   * Delete income
   */
  async deleteIncome(userId: string, incomeId: string) {
    // Verify ownership
    const existing = await prisma.income.findFirst({
      where: { id: incomeId, userId },
    })

    if (!existing) {
      throw new Error('Income not found')
    }

    await prisma.income.delete({ where: { id: incomeId } })
  }

  /**
   * Bulk import income
   */
  async bulkImport(userId: string, incomeData: any[]) {
    const imported = []
    const failed = []

    for (const data of incomeData) {
      try {
        const income = await this.addIncome(userId, data)
        imported.push(income)
      } catch (error) {
        failed.push({
          data,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return {
      imported: imported.length,
      failed: failed.length,
      errors: failed,
    }
  }
}

export const incomeService = new IncomeService()
