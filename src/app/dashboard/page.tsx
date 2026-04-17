'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePortfolioSummary } from '@/hooks/use-portfolio'
import { TrendingUp, TrendingDown, Wallet, DollarSign, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useGenerateRecurringExpenses } from '@/hooks/use-recurring-expenses'

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative'
  icon: any
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
        {change && (
          <div className="flex items-center mt-1 text-xs">
            {changeType === 'positive' ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span
              className={
                changeType === 'positive' ? 'text-green-500' : 'text-red-500'
              }
            >
              {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: summary, isLoading, error } = usePortfolioSummary()
  const generateRecurring = useGenerateRecurringExpenses()

  const handleGenerateRecurring = () => {
    generateRecurring.mutate()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your financial portfolio
            </p>
          </div>
          <Button
            onClick={handleGenerateRecurring}
            disabled={generateRecurring.isPending}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${generateRecurring.isPending ? 'animate-spin' : ''}`}
            />
            {generateRecurring.isPending
              ? 'Generating...'
              : 'Generate Recurring'}
          </Button>
        </div>

        {/* Stats grid */}

        {(isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : summary ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Invested"
              value={`₹${(summary as any).totalInvested.toLocaleString('en-IN')}`}
              icon={DollarSign}
            />
            <StatCard
              title="Current Value"
              value={`₹${(summary as any).totalCurrent.toLocaleString('en-IN')}`}
              icon={Wallet}
            />
            <StatCard
              title="Total P&L"
              value={`₹${Math.abs((summary as any).totalProfitLoss).toLocaleString('en-IN')}`}
              change={`${(summary as any).totalReturnPercentage.toFixed(2)}%`}
              changeType={(summary as any).totalProfitLoss >= 0 ? 'positive' : 'negative'}
              icon={TrendingUp}
            />
            <StatCard
              title="Total Holdings"
              value={(summary as any).totalHoldings.toString()}
              icon={Wallet}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No holdings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your portfolio by adding your first holding
                </p>
              </div>
            </CardContent>
          </Card>
        )) as React.ReactNode}

        {/* Charts section - placeholder for now */}
        {((summary as any) && (summary as any).totalHoldings > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart coming soon
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Chart coming soon
                </div>
              </CardContent>
            </Card>
          </div>
        )) as React.ReactNode}
      </div>
    </DashboardLayout>
  )
}
