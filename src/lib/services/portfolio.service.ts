import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import {
  decimalToNumber,
  numberToDecimal,
  calculatePercentage,
  calculateProfitLossPercentage,
} from '@/lib/utils/calculations'
import type {
  PortfolioSummary,
  AllocationComparison,
  RebalanceSuggestion,
  HoldingWithCategory,
} from '@/types'

export class PortfolioService {
  /**
   * Get complete portfolio summary for a user
   */
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    const holdings = await prisma.holding.findMany({
      where: { userId },
      include: { category: true },
    })

    if (holdings.length === 0) {
      return {
        totalNetworth: 0,
        totalInvested: 0,
        totalProfitLoss: 0,
        profitLossPercentage: 0,
        isEmpty: true,
        allocationByCategory: [],
      }
    }

    const totalNetworth = holdings.reduce(
      (sum, h) => sum + decimalToNumber(h.currentAmount),
      0
    )

    const totalInvested = holdings.reduce(
      (sum, h) => sum + decimalToNumber(h.investedAmount),
      0
    )

    const totalProfitLoss = totalNetworth - totalInvested
    const profitLossPercentage = calculateProfitLossPercentage(
      totalNetworth,
      totalInvested
    )

    // Get ideal allocations
    const idealAllocations = await prisma.idealAllocation.findMany({
      where: { userId },
      include: { category: true },
    })

    // Calculate current allocations by category
    const allocationByCategory = await this.calculateAllocationComparison(
      holdings,
      idealAllocations,
      totalNetworth
    )

    return {
      totalNetworth,
      totalInvested,
      totalProfitLoss,
      profitLossPercentage,
      isEmpty: false,
      allocationByCategory,
    }
  }

  /**
   * Get all holdings for a user
   */
  async getHoldings(userId: string): Promise<HoldingWithCategory[]> {
    const holdings = await prisma.holding.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    return holdings.map((holding) => ({
      ...holding,
      profitLossPercentage: calculateProfitLossPercentage(
        decimalToNumber(holding.currentAmount),
        decimalToNumber(holding.investedAmount)
      ),
    }))
  }

  /**
   * Add a new holding
   */
  async addHolding(userId: string, data: any) {
    const currentAmount = data.units * data.unitPrice
    const profitLoss = currentAmount - data.investedAmount

    const holding = await prisma.holding.create({
      data: {
        userId,
        categoryId: data.categoryId,
        name: data.name,
        symbol: data.symbol,
        subCategory: data.subCategory,
        units: numberToDecimal(data.units),
        unitPrice: numberToDecimal(data.unitPrice),
        investedAmount: numberToDecimal(data.investedAmount),
        currentAmount: numberToDecimal(currentAmount),
        profitLoss: numberToDecimal(profitLoss),
        allocationPct: numberToDecimal(0), // Will be recalculated
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        remarks: data.remarks,
        autoFetchPrice: data.autoFetchPrice ?? false,
      },
      include: { category: true },
    })

    // Recalculate all allocations
    await this.recalculateAllocations(userId)

    return holding
  }

  /**
   * Update a holding
   */
  async updateHolding(userId: string, holdingId: string, data: any) {
    // Verify ownership
    const existing = await prisma.holding.findFirst({
      where: { id: holdingId, userId },
    })

    if (!existing) {
      throw new Error('Holding not found')
    }

    const currentAmount = data.units
      ? data.units * (data.unitPrice ?? decimalToNumber(existing.unitPrice))
      : undefined

    const investedAmount = data.investedAmount ?? decimalToNumber(existing.investedAmount)
    const profitLoss = currentAmount ? currentAmount - investedAmount : undefined

    const updated = await prisma.holding.update({
      where: { id: holdingId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.symbol !== undefined && { symbol: data.symbol }),
        ...(data.subCategory !== undefined && { subCategory: data.subCategory }),
        ...(data.units !== undefined && { units: numberToDecimal(data.units) }),
        ...(data.unitPrice !== undefined && { unitPrice: numberToDecimal(data.unitPrice) }),
        ...(data.investedAmount !== undefined && {
          investedAmount: numberToDecimal(data.investedAmount),
        }),
        ...(currentAmount !== undefined && { currentAmount: numberToDecimal(currentAmount) }),
        ...(profitLoss !== undefined && { profitLoss: numberToDecimal(profitLoss) }),
        ...(data.purchaseDate !== undefined && {
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        }),
        ...(data.remarks !== undefined && { remarks: data.remarks }),
        ...(data.autoFetchPrice !== undefined && { autoFetchPrice: data.autoFetchPrice }),
      },
      include: { category: true },
    })

    await this.recalculateAllocations(userId)

    return updated
  }

  /**
   * Delete a holding
   */
  async deleteHolding(userId: string, holdingId: string) {
    // Verify ownership
    const existing = await prisma.holding.findFirst({
      where: { id: holdingId, userId },
    })

    if (!existing) {
      throw new Error('Holding not found')
    }

    await prisma.holding.delete({ where: { id: holdingId } })
    await this.recalculateAllocations(userId)
  }

  /**
   * Get rebalancing suggestions
   */
  async getRebalanceSuggestions(userId: string): Promise<RebalanceSuggestion[]> {
    const summary = await this.getPortfolioSummary(userId)

    const suggestions = summary.allocationByCategory
      .filter((cat) => Math.abs(cat.differenceAmount) > 1000) // Minimum threshold
      .map((cat) => ({
        category: cat.categoryDisplayName,
        action: (cat.differenceAmount < 0 ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
        currentAllocation: cat.currentAllocation,
        idealAllocation: cat.idealAllocation,
        amount: Math.abs(cat.differenceAmount),
      }))
      .sort((a, b) => b.amount - a.amount)

    return suggestions
  }

  /**
   * Calculate allocation comparison
   */
  private async calculateAllocationComparison(
    holdings: any[],
    idealAllocations: any[],
    totalNetworth: number
  ): Promise<AllocationComparison[]> {
    const categoryMap = new Map<string, number>()

    // Group holdings by category
    holdings.forEach((holding) => {
      const categoryName = holding.category.name
      const current = categoryMap.get(categoryName) || 0
      categoryMap.set(categoryName, current + decimalToNumber(holding.currentAmount))
    })

    // Build allocation comparison
    const result = idealAllocations.map((ideal) => {
      const categoryName = ideal.category.name
      const categoryDisplayName = ideal.category.displayName
      const currentAmount = categoryMap.get(categoryName) || 0
      const currentAllocation =
        totalNetworth > 0 ? currentAmount / totalNetworth : 0
      const idealAllocation = decimalToNumber(ideal.percentage)
      const difference = currentAllocation - idealAllocation
      const differenceAmount = difference * totalNetworth

      return {
        categoryName,
        categoryDisplayName,
        currentAmount,
        currentAllocation,
        idealAllocation,
        difference,
        differenceAmount,
      }
    })

    return result
  }

  /**
   * Recalculate allocation percentages for all holdings
   */
  async recalculateAllocations(userId: string) {
    const holdings = await prisma.holding.findMany({ where: { userId } })

    const totalNetworth = holdings.reduce(
      (sum, h) => sum + decimalToNumber(h.currentAmount),
      0
    )

    if (totalNetworth === 0) return

    // Update each holding's allocation percentage
    const updates = holdings.map((holding) => {
      const allocationPct =
        decimalToNumber(holding.currentAmount) / totalNetworth

      return prisma.holding.update({
        where: { id: holding.id },
        data: { allocationPct: numberToDecimal(allocationPct) },
      })
    })

    await prisma.$transaction(updates)
  }
}

export const portfolioService = new PortfolioService()
