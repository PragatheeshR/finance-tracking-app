'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

interface PortfolioChartsProps {
  holdings: any[]
}

export function PortfolioCharts({ holdings }: PortfolioChartsProps) {
  // Check if holdings is valid array
  if (!Array.isArray(holdings) || holdings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No data available for charts
      </div>
    )
  }

  // Asset Allocation by Category
  const categoryData = holdings.reduce((acc: any[], holding) => {
    const existing = acc.find((item) => item.name === holding.category.displayName)
    const currentAmount = parseFloat(holding.currentAmount.toString())

    if (existing) {
      existing.value += currentAmount
    } else {
      acc.push({
        name: holding.category.displayName,
        value: currentAmount,
      })
    }
    return acc
  }, [])

  // Top Gainers and Losers
  const sortedByPL = [...holdings].sort((a, b) => {
    const apl = parseFloat(a.profitLoss.toString())
    const bpl = parseFloat(b.profitLoss.toString())
    return bpl - apl
  })

  const topGainers = sortedByPL.filter((h) => parseFloat(h.profitLoss.toString()) > 0).slice(0, 5)
  const topLosers = sortedByPL
    .filter((h) => parseFloat(h.profitLoss.toString()) < 0)
    .reverse()
    .slice(0, 5)

  const gainerLoserData = [
    ...topGainers.map((h) => ({
      name: h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name,
      value: parseFloat(h.profitLoss.toString()),
      type: 'Gainer',
    })),
    ...topLosers.map((h) => ({
      name: h.name.length > 15 ? h.name.substring(0, 15) + '...' : h.name,
      value: Math.abs(parseFloat(h.profitLoss.toString())),
      type: 'Loser',
    })),
  ]

  // Performance by Category (P&L)
  const categoryPerformance = holdings.reduce((acc: any[], holding) => {
    const existing = acc.find((item) => item.name === holding.category.displayName)
    const profitLoss = parseFloat(holding.profitLoss.toString())
    const investedAmount = parseFloat(holding.investedAmount.toString())

    if (existing) {
      existing.profitLoss += profitLoss
      existing.invested += investedAmount
    } else {
      acc.push({
        name: holding.category.displayName,
        profitLoss: profitLoss,
        invested: investedAmount,
      })
    }
    return acc
  }, [])

  // Calculate return percentage for each category
  categoryPerformance.forEach((cat) => {
    cat.returnPct = cat.invested > 0 ? (cat.profitLoss / cat.invested) * 100 : 0
  })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Asset Allocation Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Gainers and Losers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gainerLoserData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip
                formatter={(value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              />
              <Bar dataKey="value" fill="#8884d8">
                {gainerLoserData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.type === 'Gainer' ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Category-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v.toFixed(0)}%`} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'returnPct') return `${value.toFixed(2)}%`
                  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="invested" fill="#3b82f6" name="Invested" />
              <Bar yAxisId="left" dataKey="profitLoss" fill="#10b981" name="P&L" />
              <Line yAxisId="right" type="monotone" dataKey="returnPct" stroke="#f59e0b" name="Return %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
