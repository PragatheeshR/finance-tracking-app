import { prisma } from '@/lib/prisma'
import { BucketType } from '@prisma/client'
import { decimalToNumber, numberToDecimal } from '@/lib/utils/calculations'
import type { ExpenseSummary, ExpenseWithDetails } from '@/types'

export class ExpenseService {
  /**
   * Get expenses with optional filters
   */
  async getExpenses(
    userId: string,
    filters: {
      startDate?: string
      endDate?: string
      bucketType?: BucketType
      category?: string
      page?: number
      pageSize?: number
    }
  ) {
    const { startDate, endDate, bucketType, category, page = 1, pageSize = 20 } = filters

    const where: any = { userId }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    if (bucketType) where.bucketType = bucketType
    if (category) where.category = category

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.expense.count({ where }),
    ])

    return {
      expenses,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  /**
   * Get expense summary
   */
  async getExpenseSummary(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<ExpenseSummary> {
    const where: any = { userId }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const expenses = await prisma.expense.findMany({ where })

    if (expenses.length === 0) {
      return {
        totalAmount: 0,
        fixedTotal: 0,
        variableTotal: 0,
        irregularTotal: 0,
        byCategory: {},
        count: 0,
      }
    }

    let fixedTotal = 0
    let variableTotal = 0
    let irregularTotal = 0
    const byCategory: Record<string, number> = {}

    expenses.forEach((expense) => {
      const amount = decimalToNumber(expense.amount)

      // By bucket type
      if (expense.bucketType === 'FIXED') fixedTotal += amount
      else if (expense.bucketType === 'VARIABLE') variableTotal += amount
      else irregularTotal += amount

      // By category
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = 0
      }
      byCategory[expense.category] += amount
    })

    return {
      totalAmount: fixedTotal + variableTotal + irregularTotal,
      fixedTotal,
      variableTotal,
      irregularTotal,
      byCategory,
      count: expenses.length,
    }
  }

  /**
   * Add a new expense
   */
  async addExpense(userId: string, data: any) {
    const expense = await prisma.expense.create({
      data: {
        userId,
        date: new Date(data.date),
        bucketType: data.bucketType,
        category: data.category,
        description: data.description,
        amount: numberToDecimal(data.amount),
        tags: data.tags || [],
        receiptUrl: data.receiptUrl,
        isRecurring: data.isRecurring || false,
      },
    })

    // If recurring, create recurring expense entry
    if (data.isRecurring && data.recurringConfig) {
      await prisma.recurringExpense.create({
        data: {
          userId,
          bucketType: data.bucketType,
          category: data.category,
          description: data.description,
          amount: numberToDecimal(data.amount),
          frequency: data.recurringConfig.frequency,
          startDate: new Date(data.date),
          endDate: data.recurringConfig.endDate
            ? new Date(data.recurringConfig.endDate)
            : null,
          isActive: true,
          lastGenerated: new Date(data.date),
        },
      })
    }

    return expense
  }

  /**
   * Update an expense
   */
  async updateExpense(userId: string, expenseId: string, data: any) {
    // Verify ownership
    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, userId },
    })

    if (!existing) {
      throw new Error('Expense not found')
    }

    const updateData: any = {}

    if (data.date) updateData.date = new Date(data.date)
    if (data.bucketType) updateData.bucketType = data.bucketType
    if (data.category) updateData.category = data.category
    if (data.description) updateData.description = data.description
    if (data.amount !== undefined) updateData.amount = numberToDecimal(data.amount)
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl
    if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
    })

    return updated
  }

  /**
   * Delete an expense
   */
  async deleteExpense(userId: string, expenseId: string) {
    // Verify ownership
    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, userId },
    })

    if (!existing) {
      throw new Error('Expense not found')
    }

    await prisma.expense.delete({ where: { id: expenseId } })
  }

  /**
   * Bulk import expenses
   */
  async bulkImport(userId: string, expenses: any[]) {
    const imported = []
    const failed = []

    for (const expenseData of expenses) {
      try {
        const expense = await this.addExpense(userId, expenseData)
        imported.push(expense)
      } catch (error) {
        failed.push({
          data: expenseData,
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

export const expenseService = new ExpenseService()
