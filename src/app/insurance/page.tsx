'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInsurance, useInsuranceSummary } from '@/hooks/use-insurance'
import { InsuranceTable } from '@/components/insurance/insurance-table'
import { InsuranceDialog } from '@/components/insurance/insurance-dialog'
import { PolicyDetailDialog } from '@/components/insurance/policy-detail-dialog'
import { InsuranceCalendar } from '@/components/insurance/insurance-calendar'
import {
  Plus,
  Shield,
  Heart,
  TrendingUp,
  AlertCircle,
  Search,
  Download,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color = 'blue',
}: {
  title: string
  value: string
  icon: any
  subtitle?: string
  color?: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
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
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function InsurancePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null)
  const [filterType, setFilterType] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const apiParams: any = {}
  if (filterType !== 'ALL') apiParams.policyType = filterType

  const { data, isLoading, error } = useInsurance(apiParams)
  const { data: summary, isLoading: summaryLoading } = useInsuranceSummary()

  const policies = data?.policies || []

  // Filter by search query
  const filteredPolicies = policies.filter((policy: any) =>
    policy.policyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.policyNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Prepare chart data
  const policyTypeChartData = summary
    ? Object.entries(summary.byType).map(([type, count], index) => ({
        name: type,
        value: count,
        fill: COLORS[index % COLORS.length],
      }))
    : []

  const coverageByTypeData = policies.reduce((acc: any[], policy: any) => {
    const existing = acc.find((item) => item.type === policy.policyType)
    const coverage = policy.amountInsured ? parseFloat(policy.amountInsured) : 0
    if (existing) {
      existing.coverage += coverage
    } else {
      acc.push({
        type: policy.policyType,
        coverage,
      })
    }
    return acc
  }, [])

  const handleExportData = () => {
    const dataStr = JSON.stringify(
      {
        policies,
        summary,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    )
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `insurance-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleViewDetails = (policy: any) => {
    setSelectedPolicy(policy)
    setDetailDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Insurance Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your insurance policies with detailed analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Policy
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
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
              title="Active Policies"
              value={summary.activePolicies.toString()}
              icon={Shield}
              subtitle={`${summary.totalPolicies} total policies`}
              color="blue"
            />
            <StatCard
              title="Total Coverage"
              value={`₹${summary.totalCoverage.toLocaleString('en-IN')}`}
              icon={TrendingUp}
              subtitle="Sum insured amount"
              color="green"
            />
            <StatCard
              title="Annual Premium"
              value={`₹${summary.totalAnnualPremium.toLocaleString('en-IN')}`}
              icon={Heart}
              subtitle="Total yearly premium"
              color="purple"
            />
            <StatCard
              title="Upcoming Renewals"
              value={summary.upcomingRenewals.length.toString()}
              icon={AlertCircle}
              subtitle="Next 90 days"
              color="orange"
            />
          </div>
        ) : null}

        {/* Upcoming Renewals Alert */}
        {summary && summary.upcomingRenewals.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Upcoming Renewals</AlertTitle>
            <AlertDescription>
              You have {summary.upcomingRenewals.length} policies expiring in
              the next 90 days. Check the calendar or table for details.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Policy Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Policy Distribution by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {policyTypeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={policyTypeChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name} (${value})`}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {policyTypeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No policy data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Coverage by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Coverage Amount by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {coverageByTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={coverageByTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: any) =>
                            `₹${value.toLocaleString('en-IN')}`
                          }
                        />
                        <Bar dataKey="coverage" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No coverage data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Renewals List */}
            {summary && summary.upcomingRenewals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Renewals (Next 90 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.upcomingRenewals.map((renewal: any) => (
                      <div
                        key={renewal.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{renewal.policyName}</p>
                          <p className="text-sm text-muted-foreground">
                            {renewal.policyType} • Expires in {renewal.daysUntilExpiry} days
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(renewal.validTill).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or policy number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Policy Type Filter */}
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Policy Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="HEALTH">🏥 Health Insurance</SelectItem>
                      <SelectItem value="LIFE">💖 Life Insurance</SelectItem>
                      <SelectItem value="CAR">🚗 Car Insurance</SelectItem>
                      <SelectItem value="BIKE">🏍️ Bike Insurance</SelectItem>
                      <SelectItem value="OTHER">📄 Other Insurance</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilterType('ALL')
                      setSearchQuery('')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Policies Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Insurance Policies ({filteredPolicies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-center py-6 text-destructive">
                    Failed to load policies. Please try again.
                  </div>
                )}

                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filteredPolicies.length > 0 ? (
                  <InsuranceTable
                    policies={filteredPolicies}
                    onViewDetails={handleViewDetails}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery || filterType !== 'ALL'
                        ? 'No matching policies'
                        : 'No policies yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || filterType !== 'ALL'
                        ? 'Try adjusting your search or filters'
                        : 'Start protecting yourself by adding your first insurance policy'}
                    </p>
                    {!searchQuery && filterType === 'ALL' && (
                      <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Policy
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <InsuranceCalendar policies={policies} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <InsuranceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <PolicyDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        policy={selectedPolicy}
      />
    </DashboardLayout>
  )
}
