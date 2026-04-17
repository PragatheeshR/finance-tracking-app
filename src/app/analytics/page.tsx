'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAnalytics } from '@/hooks/use-analytics'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Download,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Enhanced color palette with gradients
const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
]

const GRADIENT_COLORS = [
  { start: '#6366f1', end: '#818cf8' },
  { start: '#10b981', end: '#34d399' },
  { start: '#f59e0b', end: '#fbbf24' },
  { start: '#ef4444', end: '#f87171' },
  { start: '#8b5cf6', end: '#a78bfa' },
]

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
}: {
  title: string
  value: string
  subtitle?: string
  icon: any
  trend?: 'up' | 'down'
  color?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
    red: 'bg-red-500/10 text-red-500',
    purple: 'bg-purple-500/10 text-purple-500',
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
          <Icon className="h-4 w-4" />
        </div>
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

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, prefix = '₹' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {prefix}
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })
              : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [activeTab, setActiveTab] = useState('overview')

  const { data, isLoading } = useAnalytics(selectedYear, selectedMonth)

  const currentYearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  // Format data for charts
  const categoryChartData = data?.categories?.map((cat: any, index: number) => ({
    name: cat.category.replace(/_/g, ' '),
    value: cat.total,
    percentage: cat.percentage,
    fill: COLORS[index % COLORS.length],
  })) || []

  const budgetVsActualData = data?.budgetVsActual?.map((item: any) => ({
    category: item.category.replace(/_/g, ' '),
    budget: item.budget,
    actual: item.actual,
    difference: item.difference,
  })) || []

  const trendsData = data?.trends?.map((trend: any, index: number) => ({
    month: new Date(trend.date + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    amount: trend.total,
    transactions: trend.count,
  })) || []

  // Enhanced top categories with colors
  const topCategoriesData = data?.topCategories?.map((cat: any, index: number) => ({
    ...cat,
    color: COLORS[index % COLORS.length],
  })) || []

  const handleExportData = () => {
    const exportData = {
      period: `${MONTHS[selectedMonth - 1]} ${selectedYear}`,
      stats: data?.stats,
      categories: data?.categories,
      budgetVsActual: data?.budgetVsActual,
      topCategories: data?.topCategories,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${selectedYear}-${selectedMonth}.json`
    a.click()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Enhanced Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Interactive insights into your spending patterns and financial health
            </p>
          </div>
          <Button onClick={handleExportData} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        {/* Enhanced Controls */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Month
                </label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value || '1'))}
                >
                  <SelectTrigger className="border-2">
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
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value || new Date().getFullYear().toString()))}
                >
                  <SelectTrigger className="border-2">
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
              <div className="flex-1 min-w-[200px] flex items-end">
                <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
                  Period: <span className="font-semibold">{MONTHS[selectedMonth - 1]} {selectedYear}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Summary Stats with colors */}
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
        ) : data?.stats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Spending"
              value={`₹${data.stats.total.toLocaleString('en-IN')}`}
              icon={DollarSign}
              subtitle={`${data.stats.count} transactions`}
              color="blue"
            />
            <StatCard
              title="Average Transaction"
              value={`₹${data.stats.average.toLocaleString('en-IN', {
                maximumFractionDigits: 0,
              })}`}
              icon={TrendingUp}
              subtitle="per transaction"
              color="green"
            />
            <StatCard
              title="Highest Expense"
              value={`₹${data.stats.highest.toLocaleString('en-IN')}`}
              icon={Zap}
              subtitle="single expense"
              color="orange"
            />
            <StatCard
              title="Lowest Expense"
              value={`₹${data.stats.lowest.toLocaleString('en-IN')}`}
              icon={Receipt}
              subtitle="single expense"
              color="purple"
            />
          </div>
        ) : null}

        {/* Interactive Tabs for Different Views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <Activity className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="gap-2">
              <PieChartIcon className="h-4 w-4" />
              Breakdown
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Enhanced Spending Trends with Area Chart */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Spending Trends (Last 6 Months)
                  </CardTitle>
                  <CardDescription>Track your monthly spending patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[350px] w-full" />
                  ) : trendsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={trendsData}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                          dataKey="month"
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorAmount)"
                          name="Spending"
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No trend data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Budget vs Actual */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Budget vs Actual
                  </CardTitle>
                  <CardDescription>Compare your budget with actual spending</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : budgetVsActualData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={budgetVsActualData} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                          dataKey="category"
                          stroke="#9ca3af"
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar
                          dataKey="budget"
                          fill="#10b981"
                          name="Budget"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1000}
                        />
                        <Bar
                          dataKey="actual"
                          fill="#6366f1"
                          name="Actual"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1000}
                          animationBegin={500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No budget data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Categories with enhanced styling */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Top Spending Categories
                  </CardTitle>
                  <CardDescription>Your highest expense categories this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : topCategoriesData.length > 0 ? (
                    <div className="space-y-3">
                      {topCategoriesData.map((cat: any, index: number) => (
                        <div
                          key={cat.category}
                          className="flex items-center justify-between p-4 rounded-xl border-2 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                          style={{ borderLeftWidth: '4px', borderLeftColor: cat.color }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm"
                              style={{ backgroundColor: cat.color }}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold capitalize text-sm">
                                {cat.category.replace(/_/g, ' ')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {cat.count} transactions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              ₹{cat.total.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ₹{cat.average.toLocaleString('en-IN', {
                                maximumFractionDigits: 0,
                              })}{' '}
                              avg
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Monthly Spending Trends
                </CardTitle>
                <CardDescription>Detailed view of your spending over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : trendsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendsData}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis
                        dataKey="month"
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="url(#colorGradient)"
                        strokeWidth={4}
                        dot={{ fill: '#6366f1', r: 6 }}
                        activeDot={{ r: 8 }}
                        name="Spending"
                        animationDuration={1500}
                      />
                      <Line
                        type="monotone"
                        dataKey="transactions"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#10b981', r: 4 }}
                        name="Transactions"
                        animationDuration={1500}
                        animationBegin={300}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No trend data available</p>
                      <p className="text-sm">Add more expenses to see trends</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Enhanced Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Category Distribution
                  </CardTitle>
                  <CardDescription>Percentage breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : categoryChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(1)}%)`}
                          outerRadius={120}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {categoryChartData.map((entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.fill}
                              strokeWidth={2}
                              stroke="#fff"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <PieChartIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No category data</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category Details Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Details</CardTitle>
                  <CardDescription>Detailed breakdown with amounts</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : categoryChartData.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {categoryChartData.map((cat: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: cat.fill }}
                            />
                            <span className="font-medium capitalize">{cat.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{cat.value.toLocaleString('en-IN')}</p>
                            <p className="text-xs text-muted-foreground">
                              {cat.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
