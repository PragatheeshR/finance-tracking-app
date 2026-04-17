'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Search,
  Download,
  Filter,
  BarChart3,
} from 'lucide-react'
import { useGoals, useGoalsSummary } from '@/hooks/use-goals'
import { Skeleton } from '@/components/ui/skeleton'
import { GoalDialog } from '@/components/goals/goal-dialog'
import { GoalsTable } from '@/components/goals/goals-table'
import { GoalCard } from '@/components/goals/goal-card'
import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GoalCharts } from '@/components/goals/goal-charts'
import { GoalComparison } from '@/components/goals/goal-comparison'
import { GoalAnalytics } from '@/components/goals/goal-analytics'

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string
  value: string | number
  icon: any
  subtitle?: string
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
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function GoalsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('priority')

  const { data: goals, isLoading: goalsLoading } = useGoals({ isActive: true })
  const { data: summary, isLoading: summaryLoading } = useGoalsSummary()

  // Filter and search logic
  const filteredGoals = useMemo(() => {
    if (!goals) return []

    let filtered = [...goals]

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (goal) =>
          goal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          goal.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((goal) => goal.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((goal) => goal.category === categoryFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((goal) => goal.priority === priorityFilter)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          )
        case 'deadline':
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case 'progress':
          const progressA = (Number(a.currentAmount) / Number(a.targetAmount)) * 100
          const progressB = (Number(b.currentAmount) / Number(b.targetAmount)) * 100
          return progressB - progressA
        case 'amount':
          return Number(b.targetAmount) - Number(a.targetAmount)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [goals, searchQuery, statusFilter, categoryFilter, priorityFilter, sortBy])

  const handleEdit = (goal: any) => {
    setSelectedGoal(goal)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedGoal(null)
  }

  const handleExport = () => {
    if (!goals) return

    const dataStr = JSON.stringify(goals, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `goals-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    if (!goals) return

    const headers = [
      'Name',
      'Category',
      'Priority',
      'Status',
      'Target Amount',
      'Current Amount',
      'Progress %',
      'Deadline',
      'Monthly Target',
    ]

    const rows = goals.map((goal: any) => [
      goal.name,
      goal.category,
      goal.priority,
      goal.status,
      goal.targetAmount,
      goal.currentAmount,
      ((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100).toFixed(2),
      goal.deadline || '',
      goal.monthlyTarget || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `goals-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Goals & Savings
            </h1>
            <p className="text-muted-foreground">
              Track your financial goals and savings progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summaryLoading ? (
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
              title="Total Goals"
              value={summary.totalGoals}
              icon={Target}
              subtitle={`${summary.byStatus?.IN_PROGRESS || 0} in progress`}
            />
            <StatCard
              title="Target Amount"
              value={`₹${summary.totalTargetAmount.toLocaleString('en-IN')}`}
              icon={TrendingUp}
            />
            <StatCard
              title="Saved Amount"
              value={`₹${summary.totalSavedAmount.toLocaleString('en-IN')}`}
              icon={CheckCircle2}
              subtitle={`${summary.progressPercentage.toFixed(1)}% of target`}
            />
            <StatCard
              title="At Risk"
              value={summary.atRiskGoals}
              icon={AlertCircle}
              subtitle={`${summary.onTrackGoals} on track`}
            />
          </div>
        ) : null}

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search goals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="EMERGENCY_FUND">Emergency Fund</SelectItem>
                  <SelectItem value="VACATION">Vacation</SelectItem>
                  <SelectItem value="HOUSE">House</SelectItem>
                  <SelectItem value="CAR">Car</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                  <SelectItem value="RETIREMENT">Retirement</SelectItem>
                  <SelectItem value="WEDDING">Wedding</SelectItem>
                  <SelectItem value="INVESTMENT">Investment</SelectItem>
                  <SelectItem value="DEBT_PAYOFF">Debt Payoff</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value || 'priority')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredGoals.length} of {goals?.length || 0} goals
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="cards" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cards">Card View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-4">
            {goalsLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-8 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredGoals.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredGoals.map((goal: any) => (
                  <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                        ? 'No goals match your filters'
                        : 'No goals yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Start tracking your financial goals'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                      <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Goal
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="table">
            {goalsLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ) : (
              <GoalsTable goals={filteredGoals} onEdit={handleEdit} />
            )}
          </TabsContent>

          <TabsContent value="charts">
            <GoalCharts goals={filteredGoals} summary={summary} />
          </TabsContent>

          <TabsContent value="analytics">
            <GoalAnalytics goals={filteredGoals} summary={summary} />
          </TabsContent>

          <TabsContent value="comparison">
            <GoalComparison goals={filteredGoals} />
          </TabsContent>
        </Tabs>

        {/* Goal Dialog */}
        <GoalDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          goal={selectedGoal}
        />
      </div>
    </DashboardLayout>
  )
}
