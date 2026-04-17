'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBudgets } from '@/hooks/use-budget'
import { BudgetCard } from '@/components/budget/budget-card'
import { BudgetDialog } from '@/components/budget/budget-dialog'
import { Plus, Target, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
}: {
  title: string
  value: string
  icon: any
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function BudgetPage() {
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)

  const { data, isLoading, error } = useBudgets(selectedYear, selectedMonth)

  const handleEdit = (budget: any) => {
    setEditingBudget(budget)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingBudget(null)
    }
  }

  const currentYearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
            <p className="text-muted-foreground">
              Manage your monthly budgets and track spending
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </div>

        {/* Month/Year Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Month</label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentYearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {isLoading ? (
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
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Budget"
              value={`₹${data.summary.totalBudget.toLocaleString('en-IN')}`}
              icon={Target}
              subtitle={`${data.budgets.length} categories`}
            />
            <StatCard
              title="Total Spent"
              value={`₹${data.summary.totalSpent.toLocaleString('en-IN')}`}
              icon={TrendingDown}
              subtitle={`${data.summary.percentUsed.toFixed(0)}% of budget`}
              trend={data.summary.percentUsed > 80 ? 'up' : 'down'}
            />
            <StatCard
              title="Remaining"
              value={`₹${data.summary.totalRemaining.toLocaleString('en-IN')}`}
              icon={TrendingUp}
              subtitle={data.summary.totalRemaining < 0 ? 'Over budget' : 'Available'}
              trend={data.summary.totalRemaining < 0 ? 'up' : 'down'}
            />
            <StatCard
              title="Categories"
              value={data.budgets.length.toString()}
              icon={AlertCircle}
              subtitle={`${data.budgets.filter((b: any) => b.percentUsed >= 80).length} need attention`}
            />
          </div>
        ) : null}

        {/* Budget Cards */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6 text-destructive">
                Failed to load budgets. Please try again.
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data && data.budgets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.budgets.map((budget: any) => (
              <BudgetCard key={budget.id} budget={budget} onEdit={handleEdit} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No budgets set</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your spending by setting budgets for your expense categories
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Budget
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Budget Dialog */}
      <BudgetDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        budget={editingBudget}
        currentYear={selectedYear}
        currentMonth={selectedMonth}
      />
    </DashboardLayout>
  )
}
