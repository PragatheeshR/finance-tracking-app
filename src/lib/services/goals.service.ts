import { prisma } from '@/lib/prisma'
import { GoalCategory, GoalPriority, GoalStatus, Prisma } from '@prisma/client'

export class GoalsService {
  /**
   * Get all goals for a user
   */
  async getGoals(
    userId: string,
    filters?: {
      status?: GoalStatus
      category?: GoalCategory
      isActive?: boolean
    }
  ) {
    const where: Prisma.GoalWhereInput = {
      userId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
    })

    return goals
  }

  /**
   * Get goal by ID
   */
  async getGoalById(userId: string, id: string) {
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    return goal
  }

  /**
   * Add new goal
   */
  async addGoal(
    userId: string,
    data: {
      name: string
      description?: string
      category: GoalCategory
      targetAmount: number
      currentAmount?: number
      deadline?: Date
      priority?: GoalPriority
      monthlyTarget?: number
      icon?: string
      color?: string
    }
  ) {
    const goal = await prisma.goal.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        category: data.category,
        targetAmount: new Prisma.Decimal(data.targetAmount),
        currentAmount: data.currentAmount
          ? new Prisma.Decimal(data.currentAmount)
          : new Prisma.Decimal(0),
        deadline: data.deadline,
        priority: data.priority || 'MEDIUM',
        monthlyTarget: data.monthlyTarget
          ? new Prisma.Decimal(data.monthlyTarget)
          : undefined,
        icon: data.icon,
        color: data.color,
      },
    })

    return goal
  }

  /**
   * Update goal
   */
  async updateGoal(
    userId: string,
    id: string,
    data: Partial<{
      name: string
      description: string
      category: GoalCategory
      targetAmount: number
      currentAmount: number
      deadline: Date
      priority: GoalPriority
      status: GoalStatus
      monthlyTarget: number
      icon: string
      color: string
      isActive: boolean
    }>
  ) {
    // Check if exists
    await this.getGoalById(userId, id)

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.targetAmount !== undefined && {
          targetAmount: new Prisma.Decimal(data.targetAmount),
        }),
        ...(data.currentAmount !== undefined && {
          currentAmount: new Prisma.Decimal(data.currentAmount),
        }),
        ...(data.deadline !== undefined && { deadline: data.deadline }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
        ...(data.monthlyTarget !== undefined && {
          monthlyTarget: data.monthlyTarget
            ? new Prisma.Decimal(data.monthlyTarget)
            : null,
        }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    // Auto-update status if goal is completed
    if (
      updated.currentAmount >= updated.targetAmount &&
      updated.status === 'IN_PROGRESS'
    ) {
      await prisma.goal.update({
        where: { id },
        data: { status: 'COMPLETED' },
      })
    }

    return updated
  }

  /**
   * Delete goal
   */
  async deleteGoal(userId: string, id: string) {
    // Check if exists
    await this.getGoalById(userId, id)

    await prisma.goal.delete({
      where: { id },
    })

    return { success: true }
  }

  /**
   * Add contribution to goal
   */
  async addContribution(userId: string, id: string, amount: number) {
    const goal = await this.getGoalById(userId, id)

    const newAmount = Number(goal.currentAmount) + amount
    const targetAmount = Number(goal.targetAmount)

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: new Prisma.Decimal(newAmount),
        status: newAmount >= targetAmount ? 'COMPLETED' : goal.status,
      },
    })

    return updated
  }

  /**
   * Withdraw from goal
   */
  async withdrawFromGoal(userId: string, id: string, amount: number) {
    const goal = await this.getGoalById(userId, id)

    const newAmount = Math.max(0, Number(goal.currentAmount) - amount)

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        currentAmount: new Prisma.Decimal(newAmount),
        status:
          goal.status === 'COMPLETED' && newAmount < Number(goal.targetAmount)
            ? 'IN_PROGRESS'
            : goal.status,
      },
    })

    return updated
  }

  /**
   * Get goals summary
   */
  async getGoalsSummary(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId, isActive: true },
    })

    const totalTargetAmount = goals.reduce(
      (sum, g) => sum + Number(g.targetAmount),
      0
    )
    const totalSavedAmount = goals.reduce(
      (sum, g) => sum + Number(g.currentAmount),
      0
    )
    const remainingAmount = totalTargetAmount - totalSavedAmount

    const byStatus = goals.reduce(
      (acc, goal) => {
        acc[goal.status] = (acc[goal.status] || 0) + 1
        return acc
      },
      {} as Record<GoalStatus, number>
    )

    const byCategory = goals.reduce(
      (acc, goal) => {
        acc[goal.category] = {
          count: (acc[goal.category]?.count || 0) + 1,
          targetAmount:
            (acc[goal.category]?.targetAmount || 0) + Number(goal.targetAmount),
          savedAmount:
            (acc[goal.category]?.savedAmount || 0) + Number(goal.currentAmount),
        }
        return acc
      },
      {} as Record<
        GoalCategory,
        { count: number; targetAmount: number; savedAmount: number }
      >
    )

    // Goals at risk (past deadline and not completed)
    const today = new Date()
    const atRiskGoals = goals.filter(
      (g) =>
        g.deadline &&
        new Date(g.deadline) < today &&
        g.status === 'IN_PROGRESS'
    )

    // Goals on track (with monthly target)
    const onTrackGoals = goals.filter((g) => {
      if (!g.monthlyTarget || !g.deadline || g.status !== 'IN_PROGRESS')
        return false

      const monthsRemaining =
        (new Date(g.deadline).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24 * 30)
      const amountRemaining = Number(g.targetAmount) - Number(g.currentAmount)
      const requiredMonthly = amountRemaining / monthsRemaining

      return requiredMonthly <= Number(g.monthlyTarget)
    })

    return {
      totalGoals: goals.length,
      totalTargetAmount,
      totalSavedAmount,
      remainingAmount,
      progressPercentage:
        totalTargetAmount > 0
          ? (totalSavedAmount / totalTargetAmount) * 100
          : 0,
      byStatus,
      byCategory,
      atRiskGoals: atRiskGoals.length,
      onTrackGoals: onTrackGoals.length,
    }
  }

  /**
   * Calculate goal progress
   */
  calculateGoalProgress(goal: any) {
    const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
    const remaining = Number(goal.targetAmount) - Number(goal.currentAmount)

    let timeRemaining = null
    let requiredMonthly = null
    let isOnTrack = null

    if (goal.deadline) {
      const today = new Date()
      const deadline = new Date(goal.deadline)
      const daysRemaining = Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      const monthsRemaining = daysRemaining / 30

      timeRemaining = {
        days: daysRemaining,
        months: monthsRemaining,
      }

      if (monthsRemaining > 0) {
        requiredMonthly = remaining / monthsRemaining
        if (goal.monthlyTarget) {
          isOnTrack = requiredMonthly <= Number(goal.monthlyTarget)
        }
      }
    }

    return {
      progress: Math.min(100, Math.max(0, progress)),
      remaining,
      timeRemaining,
      requiredMonthly,
      isOnTrack,
      isCompleted: progress >= 100,
      isOverdue: goal.deadline && new Date(goal.deadline) < new Date(),
    }
  }
}

export const goalsService = new GoalsService()
