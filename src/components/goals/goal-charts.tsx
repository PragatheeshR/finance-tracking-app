'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

interface GoalChartsProps {
  goals: any[]
  summary: any
}

const COLORS = {
  EMERGENCY_FUND: '#ef4444',
  VACATION: '#3b82f6',
  HOUSE: '#10b981',
  CAR: '#f59e0b',
  EDUCATION: '#8b5cf6',
  RETIREMENT: '#ec4899',
  WEDDING: '#f97316',
  INVESTMENT: '#06b6d4',
  DEBT_PAYOFF: '#84cc16',
  OTHER: '#6b7280',
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

export function GoalCharts({ goals, summary }: GoalChartsProps) {
  // Pie chart data - Goals by category
  const categoryData = Object.entries(summary?.byCategory || {}).map(
    ([category, data]: [string, any]) => ({
      name: CATEGORY_LABELS[category],
      value: data.count,
      amount: data.targetAmount,
    })
  )

  // Bar chart data - Target vs Saved by category
  const targetVsSavedData = Object.entries(summary?.byCategory || {}).map(
    ([category, data]: [string, any]) => ({
      name: CATEGORY_LABELS[category],
      target: data.targetAmount,
      saved: data.savedAmount,
      remaining: data.targetAmount - data.savedAmount,
    })
  )

  // Progress by goal
  const progressData = goals
    .map((goal) => ({
      name: goal.name.length > 20 ? goal.name.substring(0, 20) + '...' : goal.name,
      progress: (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
      saved: Number(goal.currentAmount),
      target: Number(goal.targetAmount),
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 10)

  // Priority distribution
  const priorityData = [
    {
      priority: 'Critical',
      count: goals.filter((g) => g.priority === 'CRITICAL').length,
    },
    {
      priority: 'High',
      count: goals.filter((g) => g.priority === 'HIGH').length,
    },
    {
      priority: 'Medium',
      count: goals.filter((g) => g.priority === 'MEDIUM').length,
    },
    {
      priority: 'Low',
      count: goals.filter((g) => g.priority === 'LOW').length,
    },
  ].filter((item) => item.count > 0)

  // Status distribution
  const statusData = [
    {
      status: 'In Progress',
      count: goals.filter((g) => g.status === 'IN_PROGRESS').length,
    },
    {
      status: 'Completed',
      count: goals.filter((g) => g.status === 'COMPLETED').length,
    },
    {
      status: 'Paused',
      count: goals.filter((g) => g.status === 'PAUSED').length,
    },
    {
      status: 'Cancelled',
      count: goals.filter((g) => g.status === 'CANCELLED').length,
    },
  ].filter((item) => item.count > 0)

  // Radar chart data - Goal health metrics
  const radarData = goals.slice(0, 5).map((goal) => {
    const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
    const priorityScore = {
      CRITICAL: 100,
      HIGH: 75,
      MEDIUM: 50,
      LOW: 25,
    }[goal.priority] || 0

    const timeScore = goal.deadline
      ? Math.max(
          0,
          100 -
            ((new Date().getTime() - new Date(goal.deadline).getTime()) /
              (1000 * 60 * 60 * 24 * 365)) *
              100
        )
      : 50

    return {
      goal: goal.name.length > 15 ? goal.name.substring(0, 15) + '...' : goal.name,
      Progress: Math.min(100, progress),
      Priority: priorityScore,
      TimeRemaining: timeScore,
    }
  })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Category Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Goals by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[
                        Object.keys(CATEGORY_LABELS).find(
                          (k) => CATEGORY_LABELS[k] === entry.name
                        ) as keyof typeof COLORS
                      ] || '#6b7280'
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Target vs Saved Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Target vs Saved by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={targetVsSavedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Legend />
              <Bar dataKey="target" fill="#3b82f6" name="Target" />
              <Bar dataKey="saved" fill="#10b981" name="Saved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progress by Goal */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Progress by Goal (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={progressData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'progress') return `${value.toFixed(1)}%`
                  return `₹${value.toLocaleString('en-IN')}`
                }}
              />
              <Bar dataKey="progress" fill="#10b981" name="Progress %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Goals by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" name="Goals" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Goals by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percent }) =>
                  `${status}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statusData.map((entry, index) => {
                  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
                  return <Cell key={`cell-${index}`} fill={colors[index]} />
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Goal Health Radar */}
      {radarData.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Goal Health Matrix (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="goal" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Progress"
                  dataKey="Progress"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Priority"
                  dataKey="Priority"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Time Remaining"
                  dataKey="TimeRemaining"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
