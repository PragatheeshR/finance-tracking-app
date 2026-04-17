'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { Target, Calendar, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'

interface GoalComparisonProps {
  goals: any[]
}

const CATEGORY_LABELS: Record<string, string> = {
  EMERGENCY_FUND: 'Emergency Fund',
  VACATION: 'Vacation',
  HOUSE: 'House',
  CAR: 'Car',
  EDUCATION: 'Education',
  RETIREMENT: 'Retirement',
  WEDDING: 'Wedding',
  INVESTMENT: 'Investment',
  DEBT_PAYOFF: 'Debt Payoff',
  OTHER: 'Other',
}

export function GoalComparison({ goals }: GoalComparisonProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : prev.length < 4
          ? [...prev, goalId]
          : prev
    )
  }

  const compareGoals = goals.filter((g) => selectedGoals.includes(g.id))

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No goals to compare</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Goal Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Goals to Compare (Max 4)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => toggleGoal(goal.id)}
              >
                <Checkbox
                  checked={selectedGoals.includes(goal.id)}
                  onCheckedChange={() => toggleGoal(goal.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{goal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[goal.category]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {compareGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison ({compareGoals.length} goals)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Metric</th>
                    {compareGoals.map((goal) => (
                      <th key={goal.id} className="text-left p-3 font-medium min-w-[200px]">
                        {goal.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Category */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Category</td>
                    {compareGoals.map((goal) => (
                      <td key={goal.id} className="p-3">
                        <Badge variant="outline">
                          {CATEGORY_LABELS[goal.category]}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* Priority */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Priority</td>
                    {compareGoals.map((goal) => (
                      <td key={goal.id} className="p-3">
                        <Badge
                          className={
                            goal.priority === 'CRITICAL'
                              ? 'bg-red-500'
                              : goal.priority === 'HIGH'
                                ? 'bg-orange-500'
                                : goal.priority === 'MEDIUM'
                                  ? 'bg-blue-500'
                                  : 'bg-gray-500'
                          }
                        >
                          {goal.priority}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* Status */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Status</td>
                    {compareGoals.map((goal) => (
                      <td key={goal.id} className="p-3">
                        <Badge
                          className={
                            goal.status === 'IN_PROGRESS'
                              ? 'bg-blue-500'
                              : goal.status === 'COMPLETED'
                                ? 'bg-green-500'
                                : goal.status === 'PAUSED'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                          }
                        >
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* Target Amount */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Target Amount</td>
                    {compareGoals.map((goal) => (
                      <td key={goal.id} className="p-3 font-semibold">
                        ₹{Number(goal.targetAmount).toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>

                  {/* Current Amount */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Current Amount</td>
                    {compareGoals.map((goal) => (
                      <td key={goal.id} className="p-3 font-semibold text-green-600">
                        ₹{Number(goal.currentAmount).toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>

                  {/* Remaining */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Remaining</td>
                    {compareGoals.map((goal) => (
                      <td key={goal.id} className="p-3 font-semibold text-orange-600">
                        ₹
                        {(
                          Number(goal.targetAmount) - Number(goal.currentAmount)
                        ).toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>

                  {/* Progress */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Progress</td>
                    {compareGoals.map((goal) => {
                      const progress =
                        (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
                      return (
                        <td key={goal.id} className="p-3">
                          <div className="space-y-1">
                            <Progress value={Math.min(100, progress)} />
                            <span className="text-sm font-medium">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>

                  {/* Deadline */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Deadline</td>
                    {compareGoals.map((goal) => {
                      const daysRemaining = goal.deadline
                        ? Math.ceil(
                            (new Date(goal.deadline).getTime() - new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : null
                      return (
                        <td key={goal.id} className="p-3">
                          {goal.deadline ? (
                            <div>
                              <p>{new Date(goal.deadline).toLocaleDateString()}</p>
                              {daysRemaining !== null && (
                                <p
                                  className={`text-xs ${
                                    daysRemaining < 0
                                      ? 'text-red-500'
                                      : daysRemaining < 30
                                        ? 'text-orange-500'
                                        : 'text-muted-foreground'
                                  }`}
                                >
                                  {daysRemaining < 0
                                    ? `${Math.abs(daysRemaining)} days overdue`
                                    : `${daysRemaining} days left`}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No deadline</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Monthly Target */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Monthly Target</td>
                    {compareGoals.map((goal) => (
                      <td key={goal.id} className="p-3">
                        {goal.monthlyTarget ? (
                          <span className="font-medium">
                            ₹{Number(goal.monthlyTarget).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Completion Time (Estimated) */}
                  <tr className="border-b">
                    <td className="p-3 text-muted-foreground">Est. Completion</td>
                    {compareGoals.map((goal) => {
                      const remaining =
                        Number(goal.targetAmount) - Number(goal.currentAmount)
                      const monthsToComplete = goal.monthlyTarget
                        ? Math.ceil(remaining / Number(goal.monthlyTarget))
                        : null
                      return (
                        <td key={goal.id} className="p-3">
                          {monthsToComplete ? (
                            <span className="text-sm">
                              {monthsToComplete} months
                              <br />
                              <span className="text-xs text-muted-foreground">
                                at current rate
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No monthly target
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Winner Analysis */}
      {compareGoals.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Winner Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Most Progress */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <h4 className="font-semibold">Most Progress</h4>
                </div>
                <p className="font-medium">
                  {
                    [...compareGoals].sort(
                      (a, b) =>
                        Number(b.currentAmount) / Number(b.targetAmount) -
                        Number(a.currentAmount) / Number(a.targetAmount)
                    )[0].name
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {(
                    (Number(
                      [...compareGoals].sort(
                        (a, b) =>
                          Number(b.currentAmount) / Number(b.targetAmount) -
                          Number(a.currentAmount) / Number(a.targetAmount)
                      )[0].currentAmount
                    ) /
                      Number(
                        [...compareGoals].sort(
                          (a, b) =>
                            Number(b.currentAmount) / Number(b.targetAmount) -
                            Number(a.currentAmount) / Number(a.targetAmount)
                        )[0].targetAmount
                      )) *
                    100
                  ).toFixed(1)}
                  % complete
                </p>
              </div>

              {/* Highest Priority */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <h4 className="font-semibold">Highest Priority</h4>
                </div>
                <p className="font-medium">
                  {
                    [...compareGoals].sort((a, b) => {
                      const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
                      return order[b.priority as keyof typeof order] - order[a.priority as keyof typeof order]
                    })[0].name
                  }
                </p>
                <Badge className="mt-1 bg-red-500">
                  {
                    [...compareGoals].sort((a, b) => {
                      const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
                      return order[b.priority as keyof typeof order] - order[a.priority as keyof typeof order]
                    })[0].priority
                  }
                </Badge>
              </div>

              {/* Most Urgent */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <h4 className="font-semibold">Most Urgent</h4>
                </div>
                {(() => {
                  const withDeadlines = compareGoals.filter((g) => g.deadline)
                  if (withDeadlines.length === 0) {
                    return <p className="text-sm text-muted-foreground">No deadlines set</p>
                  }
                  const mostUrgent = [...withDeadlines].sort(
                    (a, b) =>
                      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                  )[0]
                  const daysLeft = Math.ceil(
                    (new Date(mostUrgent.deadline).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                  return (
                    <>
                      <p className="font-medium">{mostUrgent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {daysLeft < 0
                          ? `${Math.abs(daysLeft)} days overdue`
                          : `${daysLeft} days left`}
                      </p>
                    </>
                  )
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
