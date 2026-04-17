'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react'

interface GoalAnalyticsProps {
  goals: any[]
  summary: any
}

export function GoalAnalytics({ goals, summary }: GoalAnalyticsProps) {
  // Calculate analytics
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED')
  const inProgressGoals = goals.filter((g) => g.status === 'IN_PROGRESS')
  const overdue = goals.filter(
    (g) =>
      g.deadline &&
      new Date(g.deadline) < new Date() &&
      g.status === 'IN_PROGRESS'
  )

  const completionRate =
    goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0

  // Average progress
  const avgProgress =
    inProgressGoals.length > 0
      ? inProgressGoals.reduce(
          (sum, g) =>
            sum + (Number(g.currentAmount) / Number(g.targetAmount)) * 100,
          0
        ) / inProgressGoals.length
      : 0

  // Average target amount
  const avgTargetAmount =
    goals.length > 0
      ? goals.reduce((sum, g) => sum + Number(g.targetAmount), 0) / goals.length
      : 0

  // Goals by timeframe
  const goalsWithinMonth = goals.filter((g) => {
    if (!g.deadline) return false
    const daysLeft = Math.ceil(
      (new Date(g.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
    return daysLeft > 0 && daysLeft <= 30
  })

  const goalsWithinQuarter = goals.filter((g) => {
    if (!g.deadline) return false
    const daysLeft = Math.ceil(
      (new Date(g.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
    return daysLeft > 30 && daysLeft <= 90
  })

  const goalsWithinYear = goals.filter((g) => {
    if (!g.deadline) return false
    const daysLeft = Math.ceil(
      (new Date(g.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
    return daysLeft > 90 && daysLeft <= 365
  })

  // Estimated completion times
  const estimatedCompletions = inProgressGoals
    .filter((g) => g.monthlyTarget)
    .map((g) => {
      const remaining = Number(g.targetAmount) - Number(g.currentAmount)
      const months = Math.ceil(remaining / Number(g.monthlyTarget))
      return { goal: g.name, months }
    })
    .sort((a, b) => a.months - b.months)

  // Top performers (highest progress %)
  const topPerformers = [...goals]
    .map((g) => ({
      name: g.name,
      progress: (Number(g.currentAmount) / Number(g.targetAmount)) * 100,
      category: g.category,
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5)

  // Goals needing attention (low progress + approaching deadline)
  const needsAttention = inProgressGoals
    .filter((g) => {
      const progress = (Number(g.currentAmount) / Number(g.targetAmount)) * 100
      const daysLeft = g.deadline
        ? Math.ceil(
            (new Date(g.deadline).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : Infinity
      return progress < 50 && daysLeft < 90 && daysLeft > 0
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedGoals.length} of {goals.length} goals completed
            </p>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {inProgressGoals.length} active goals
            </p>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Goals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdue.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdue.length > 0 ? 'Need immediate attention' : 'All on track'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Target</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(avgTargetAmount / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average goal size
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Goals by Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Within 1 Month</span>
                <span className="text-sm text-muted-foreground">
                  {goalsWithinMonth.length} goals
                </span>
              </div>
              <Progress
                value={
                  goals.length > 0
                    ? (goalsWithinMonth.length / goals.length) * 100
                    : 0
                }
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">1-3 Months</span>
                <span className="text-sm text-muted-foreground">
                  {goalsWithinQuarter.length} goals
                </span>
              </div>
              <Progress
                value={
                  goals.length > 0
                    ? (goalsWithinQuarter.length / goals.length) * 100
                    : 0
                }
                className="bg-blue-100"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">3-12 Months</span>
                <span className="text-sm text-muted-foreground">
                  {goalsWithinYear.length} goals
                </span>
              </div>
              <Progress
                value={
                  goals.length > 0
                    ? (goalsWithinYear.length / goals.length) * 100
                    : 0
                }
                className="bg-green-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Top Performing Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((goal, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{goal.name}</p>
                    <Progress value={Math.min(100, goal.progress)} className="mt-1" />
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    {goal.progress.toFixed(1)}%
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No goals yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Estimated Completions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Estimated Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estimatedCompletions.length > 0 ? (
                estimatedCompletions.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="text-sm font-medium truncate flex-1">
                      {item.goal}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {item.months} {item.months === 1 ? 'month' : 'months'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Set monthly targets to see estimates
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsAttention.length > 0 ? (
                needsAttention.map((goal, index) => {
                  const progress =
                    (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
                  const daysLeft = goal.deadline
                    ? Math.ceil(
                        (new Date(goal.deadline).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : null
                  return (
                    <div key={index} className="p-2 border rounded border-orange-200">
                      <p className="text-sm font-medium">{goal.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {progress.toFixed(1)}% complete
                        </span>
                        {daysLeft && (
                          <span className="text-xs text-orange-500">
                            {daysLeft} days left
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  All goals are on track!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overdue.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  ⚠️ You have {overdue.length} overdue goal{overdue.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Consider revising deadlines or increasing monthly contributions
                </p>
              </div>
            )}

            {avgProgress < 30 && inProgressGoals.length > 0 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  📊 Average progress is {avgProgress.toFixed(1)}%
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Focus on consistent monthly contributions to improve progress
                </p>
              </div>
            )}

            {completionRate >= 50 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  ✨ Great job! {completionRate.toFixed(0)}% completion rate
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  You're doing excellent at achieving your goals!
                </p>
              </div>
            )}

            {needsAttention.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  🎯 {needsAttention.length} goal{needsAttention.length > 1 ? 's' : ''} need extra attention
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  These goals have approaching deadlines with low progress
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
