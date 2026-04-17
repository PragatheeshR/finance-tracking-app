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
import { useExpenses } from '@/hooks/use-expenses'
import { ExpensesTable } from '@/components/expenses/expenses-table'
import { ExpenseDialog } from '@/components/expenses/expense-dialog'
import { Plus, Receipt, DollarSign, TrendingUp } from 'lucide-react'

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  icon: any
  trend?: string
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
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function ExpensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    bucketType: 'ALL',
    category: 'ALL',
    startDate: '',
    endDate: '',
  })

  // Build API params
  const apiParams: any = {}
  if (filters.bucketType !== 'ALL') apiParams.bucketType = filters.bucketType
  if (filters.category !== 'ALL') apiParams.category = filters.category
  if (filters.startDate) apiParams.startDate = new Date(filters.startDate).toISOString()
  if (filters.endDate) apiParams.endDate = new Date(filters.endDate).toISOString()

  const { data, isLoading, error } = useExpenses(apiParams)

  const expenses = (data as any)?.expenses || []
  const summary = (data as any)?.summary

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage your daily expenses
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>

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
        ) : summary ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Expenses"
              value={`₹${summary.totalAmount?.toLocaleString('en-IN') || '0'}`}
              icon={DollarSign}
              trend={`${summary.count || 0} transactions`}
            />
            <StatCard
              title="Fixed Expenses"
              value={`₹${summary.fixedTotal?.toLocaleString('en-IN') || '0'}`}
              icon={Receipt}
            />
            <StatCard
              title="Variable Expenses"
              value={`₹${summary.variableTotal?.toLocaleString('en-IN') || '0'}`}
              icon={TrendingUp}
            />
            <StatCard
              title="Irregular Expenses"
              value={`₹${summary.irregularTotal?.toLocaleString('en-IN') || '0'}`}
              icon={Receipt}
            />
          </div>
        ) : null}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Bucket Type Filter */}
              <Select
                value={filters.bucketType}
                onValueChange={(value) =>
                  setFilters({ ...filters, bucketType: value || 'All' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Bucket Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Buckets</SelectItem>
                  <SelectItem value="FIXED">Fixed</SelectItem>
                  <SelectItem value="VARIABLE">Variable</SelectItem>
                  <SelectItem value="IRREGULAR">Irregular</SelectItem>
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
                    bucketType: 'ALL',
                    category: 'ALL',
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

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-6 text-destructive">
                Failed to load expenses. Please try again.
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : expenses.length > 0 ? (
              <ExpensesTable expenses={expenses} />
            ) : (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your expenses by adding your first transaction
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Expense
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Dialog */}
      <ExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </DashboardLayout>
  )
}
