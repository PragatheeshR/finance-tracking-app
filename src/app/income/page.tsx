'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useIncome, useIncomeVsExpense } from '@/hooks/use-income'
import { IncomeTable } from '@/components/income/income-table'
import { IncomeDialog } from '@/components/income/income-dialog'
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#14b8a6', '#ec4899', '#64748b']

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'blue',
}: {
  title: string
  value: string
  icon: any
  subtitle?: string
  trend?: 'up' | 'down'
  color?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  }

  return (
    <Card className={`border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function IncomePage() {
  const now = new Date()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    source: 'ALL',
    startDate: '',
    endDate: '',
  })

  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Build API params
  const apiParams: any = {}
  if (filters.source !== 'ALL') apiParams.source = filters.source
  if (filters.startDate) apiParams.startDate = new Date(filters.startDate).toISOString()
  if (filters.endDate) apiParams.endDate = new Date(filters.endDate).toISOString()

  const { data, isLoading, error } = useIncome(apiParams)
  const { data: comparison, isLoading: comparisonLoading } = useIncomeVsExpense(
    currentYear,
    currentMonth
  )

  const income = data?.income || []
  const summary = data?.summary

  // Prepare chart data
  const sourceChartData = summary
    ? Object.entries(summary.bySource).map(([source, amount], index) => ({
        name: source,
        value: amount,
        fill: COLORS[index % COLORS.length],
      }))
    : []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              Income Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your income sources and monitor financial health
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </div>

        {/* Summary Stats */}
        {comparisonLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : comparison ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Income"
              value={`₹${comparison.totalIncome.toLocaleString('en-IN')}`}
              icon={Wallet}
              subtitle={`${comparison.incomeCount} transactions`}
              color="green"
            />
            <StatCard
              title="Total Expenses"
              value={`₹${comparison.totalExpense.toLocaleString('en-IN')}`}
              icon={TrendingDown}
              subtitle={`${comparison.expenseCount} transactions`}
              color="red"
            />
            <StatCard
              title="Savings"
              value={`₹${comparison.savings.toLocaleString('en-IN')}`}
              icon={PiggyBank}
              subtitle={comparison.savings >= 0 ? 'Positive balance' : 'Deficit'}
              trend={comparison.savings >= 0 ? 'up' : 'down'}
              color="blue"
            />
            <StatCard
              title="Savings Rate"
              value={`${comparison.savingsRate.toFixed(1)}%`}
              icon={TrendingUp}
              subtitle={
                comparison.savingsRate >= 50
                  ? 'Excellent! 🎉'
                  : comparison.savingsRate >= 20
                  ? 'Good progress'
                  : 'Needs improvement'
              }
              color="purple"
            />
          </div>
        ) : null}

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Income by Source Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Income by Source</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : sourceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name} (₹${(value as number).toLocaleString('en-IN', {
                          maximumFractionDigits: 0,
                        })})`
                      }
                      outerRadius={100}
                      dataKey="value"
                    >
                      {sourceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No income data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Income Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Income Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : summary && Object.keys(summary.bySource).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(summary.bySource)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([source, amount], index) => {
                      const percentage = summary.totalIncome > 0
                        ? ((amount as number) / summary.totalIncome) * 100
                        : 0
                      return (
                        <div
                          key={source}
                          className="flex items-center justify-between p-3 rounded-lg border"
                          style={{
                            borderLeftWidth: '4px',
                            borderLeftColor: COLORS[index % COLORS.length],
                          }}
                        >
                          <div>
                            <p className="font-medium">{source}</p>
                            <p className="text-xs text-muted-foreground">
                              {percentage.toFixed(1)}% of total
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              ₹{(amount as number).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between font-bold">
                      <span>Total Income</span>
                      <span className="text-green-600">
                        ₹{summary.totalIncome.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No income summary available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Source Filter */}
              <Select
                value={filters.source}
                onValueChange={(value) =>
                  setFilters({ ...filters, source: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Income Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sources</SelectItem>
                  <SelectItem value="SALARY">💼 Salary</SelectItem>
                  <SelectItem value="BUSINESS">🏢 Business</SelectItem>
                  <SelectItem value="INVESTMENT">📈 Investment</SelectItem>
                  <SelectItem value="FREELANCE">💻 Freelance</SelectItem>
                  <SelectItem value="RENTAL">🏠 Rental</SelectItem>
                  <SelectItem value="GIFT">🎁 Gift</SelectItem>
                  <SelectItem value="OTHER">📝 Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Start Date */}
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />

              {/* End Date */}
              <Input
                type="date"
                placeholder="End Date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    source: 'ALL',
                    startDate: '',
                    endDate: '',
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Income Table */}
        <Card>
          <CardHeader>
            <CardTitle>Income Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-6 text-destructive">
                Failed to load income. Please try again.
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : income.length > 0 ? (
              <IncomeTable income={income} />
            ) : (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No income yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your income by adding your first transaction
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Income
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Income Dialog */}
      <IncomeDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </DashboardLayout>
  )
}

