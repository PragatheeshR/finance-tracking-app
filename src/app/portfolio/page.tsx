'use client'

import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePortfolioSummary, useHoldings } from '@/hooks/use-portfolio'
import { EnhancedHoldingsTable } from '@/components/portfolio/enhanced-holdings-table'
import { HoldingDialog } from '@/components/portfolio/holding-dialog'
import { PortfolioCharts } from '@/components/portfolio/portfolio-charts'
import { PortfolioFilters, FilterState } from '@/components/portfolio/portfolio-filters'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  BarChart3,
  Download,
  Target,
} from 'lucide-react'

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string
  value: string
  icon: any
  trend?: { value: string; isPositive: boolean }
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
          <div className="flex items-center mt-1 text-xs">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span
              className={
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }
            >
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function PortfolioPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    profitLossFilter: 'all',
    sortBy: 'current',
    sortOrder: 'desc',
  })

  const { data: summary, isLoading: summaryLoading } = usePortfolioSummary()
  const { data: holdings = [], isLoading: holdingsLoading } = useHoldings()

  // Extract unique categories from holdings
  const categories = useMemo(() => {
    if (!Array.isArray(holdings)) return []
    const uniqueCategories = new Map()
    holdings.forEach((holding: any) => {
      if (!uniqueCategories.has(holding.category.id)) {
        uniqueCategories.set(holding.category.id, {
          id: holding.category.id,
          displayName: holding.category.displayName,
        })
      }
    })
    return Array.from(uniqueCategories.values())
  }, [holdings])

  // Filter and sort holdings
  const filteredHoldings = useMemo(() => {
    if (!Array.isArray(holdings)) return []
    let filtered = [...holdings]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (h: any) =>
          h.name.toLowerCase().includes(searchLower) ||
          (h.symbol && h.symbol.toLowerCase().includes(searchLower))
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter((h: any) => h.category.id === filters.category)
    }

    // P&L filter
    if (filters.profitLossFilter === 'profit') {
      filtered = filtered.filter((h: any) => parseFloat(h.profitLoss.toString()) > 0)
    } else if (filters.profitLossFilter === 'loss') {
      filtered = filtered.filter((h: any) => parseFloat(h.profitLoss.toString()) < 0)
    }

    // Sorting
    filtered.sort((a: any, b: any) => {
      let aVal: any, bVal: any

      switch (filters.sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'invested':
          aVal = parseFloat(a.investedAmount.toString())
          bVal = parseFloat(b.investedAmount.toString())
          break
        case 'current':
          aVal = parseFloat(a.currentAmount.toString())
          bVal = parseFloat(b.currentAmount.toString())
          break
        case 'pl':
          aVal = parseFloat(a.profitLoss.toString())
          bVal = parseFloat(b.profitLoss.toString())
          break
        case 'return':
          aVal = a.profitLossPercentage
          bVal = b.profitLossPercentage
          break
        case 'allocation':
          aVal = parseFloat(a.allocationPct.toString())
          bVal = parseFloat(b.allocationPct.toString())
          break
        default:
          return 0
      }

      if (typeof aVal === 'string') {
        return filters.sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

    return filtered
  }, [holdings, filters])

  // Calculate additional metrics
  const metrics = useMemo(() => {
    if (!summary || !Array.isArray(holdings)) return null

    const totalValue = (summary as any).totalCurrent
    const totalInvested = (summary as any).totalInvested
    const avgReturn = (summary as any).totalReturnPercentage

    // Calculate XIRR approximation (simplified)
    // In a real app, you'd calculate actual XIRR with transaction dates
    const years = 1 // This should be calculated from actual holding periods
    const cagr = totalInvested > 0 ? ((Math.pow(totalValue / totalInvested, 1 / years) - 1) * 100).toFixed(2) : '0.00'

    return {
      ...(summary as any),
      cagr: parseFloat(cagr),
      avgAllocation: holdings.length > 0 ? (100 / holdings.length).toFixed(1) : '0',
    }
  }, [summary, holdings])

  const exportToCSV = () => {
    if (!Array.isArray(filteredHoldings) || filteredHoldings.length === 0) {
      return
    }

    const csvContent = [
      [
        'Name',
        'Symbol',
        'Category',
        'Units',
        'Unit Price',
        'Invested Amount',
        'Current Amount',
        'P&L',
        'Return %',
        'Allocation %',
      ],
      ...filteredHoldings.map((h: any) => [
        h.name,
        h.symbol || '',
        h.category.displayName,
        h.units,
        h.unitPrice,
        h.investedAmount,
        h.currentAmount,
        h.profitLoss,
        h.profitLossPercentage,
        h.allocationPct,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
            <p className="text-muted-foreground">
              Track and analyze your investment holdings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} disabled={holdings.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        {summaryLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
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
        ) : metrics ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Total Invested"
              value={`₹${metrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              icon={DollarSign}
            />
            <StatCard
              title="Current Value"
              value={`₹${metrics.totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              icon={Wallet}
            />
            <StatCard
              title="Total P&L"
              value={`₹${Math.abs(metrics.totalProfitLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              icon={metrics.totalProfitLoss >= 0 ? TrendingUp : TrendingDown}
              trend={{
                value: `${metrics.totalReturnPercentage.toFixed(2)}%`,
                isPositive: metrics.totalProfitLoss >= 0,
              }}
            />
            <StatCard
              title="CAGR"
              value={`${metrics.cagr}%`}
              icon={BarChart3}
              trend={{
                value: 'Annualized',
                isPositive: metrics.cagr >= 0,
              }}
            />
            <StatCard
              title="Total Holdings"
              value={metrics.totalHoldings.toString()}
              icon={Target}
            />
          </div>
        ) : null}

        {/* Tabs for different views */}
        <Tabs defaultValue="holdings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Holdings Tab */}
          <TabsContent value="holdings" className="space-y-4">
            {/* Filters */}
            {holdings.length > 0 && (
              <PortfolioFilters categories={categories} onFilterChange={setFilters} />
            )}

            {/* Holdings Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Holdings ({filteredHoldings.length}
                    {filteredHoldings.length !== holdings.length && ` of ${holdings.length}`})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {holdingsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filteredHoldings.length > 0 ? (
                  <EnhancedHoldingsTable holdings={filteredHoldings} />
                ) : holdings.length > 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No holdings match your filters
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No holdings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your portfolio by adding your first holding
                    </p>
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Holding
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {holdings.length > 0 ? (
              <PortfolioCharts holdings={holdings} />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No analytics available
                    </h3>
                    <p className="text-muted-foreground">
                      Add holdings to see portfolio analytics and charts
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Holding Dialog */}
      <HoldingDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </DashboardLayout>
  )
}
