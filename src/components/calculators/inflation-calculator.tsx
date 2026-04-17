'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { CalculatorInfo } from './calculator-info'

export function InflationCalculator() {
  const [currentValue, setCurrentValue] = useState(1000000)
  const [inflationRate, setInflationRate] = useState(6)
  const [years, setYears] = useState(20)
  const [investmentReturn, setInvestmentReturn] = useState(12)

  // Future value with inflation
  const futureValue = currentValue * Math.pow(1 + inflationRate / 100, years)

  // Real rate of return (Fisher equation)
  const realReturn = ((1 + investmentReturn / 100) / (1 + inflationRate / 100) - 1) * 100

  // Investment needed to maintain purchasing power
  const investmentNeeded = currentValue * Math.pow(1 + investmentReturn / 100, years)

  // Loss in purchasing power
  const purchasingPowerLoss = ((futureValue - currentValue) / currentValue) * 100

  // Chart data
  const data = []
  for (let year = 0; year <= years; year++) {
    data.push({
      year,
      nominalValue: Math.round(currentValue * Math.pow(1 + inflationRate / 100, year)),
      investmentValue: Math.round(currentValue * Math.pow(1 + investmentReturn / 100, year)),
      realValue: currentValue,
    })
  }

  return (
    <div className="space-y-6">
      {/* Info Button */}
      <div className="flex justify-end">
        <CalculatorInfo
          title="Inflation Calculator"
          description="Understand how inflation erodes purchasing power and calculate what you need to invest to beat inflation"
          purpose={[
            'Visualize the silent wealth killer - inflation\'s long-term impact',
            'Calculate future cost of goods and services',
            'Understand real returns vs nominal returns',
            'Determine investment needed to maintain purchasing power',
            'Plan for inflation-adjusted retirement corpus',
          ]}
          howToUse={[
            'Enter the current value or cost (e.g., ₹10L annual expenses)',
            'Set the time period (how many years ahead to calculate)',
            'Input expected inflation rate (India average: 5-7%)',
            'Enter your investment return rate to see if you beat inflation',
            'View real return rate (inflation-adjusted returns)',
            'Analyze the chart showing nominal vs real value divergence',
          ]}
          keyFeatures={[
            'Fisher Equation for accurate real return calculation: Real Return = [(1+Nominal)/(1+Inflation)] - 1',
            'Purchasing power loss calculation over time',
            'Visual comparison: Real Value vs Inflated Value vs Investment Growth',
            'Investment amount needed to beat inflation and maintain lifestyle',
            'Historical context for India\'s inflation trends',
          ]}
          tips={[
            'India\'s inflation averages 5-7% historically, healthcare/education much higher',
            'Cash and fixed deposits (4-6%) actually lose purchasing power over time',
            'Need minimum 8-10% returns to meaningfully beat inflation in India',
            'Gold has historically moved with inflation (7-8% long-term CAGR)',
            'Equity has beaten inflation by 5-7% over 15+ year periods',
            'Real estate inflation often exceeds general CPI in metros',
            'Plan retirement corpus with inflation - ₹50k/month today = ₹1.6L/month in 20 years at 6% inflation',
          ]}
          limitations={[
            'Uses average inflation rate (actual varies by category and region)',
            'Healthcare and education inflation is 2-3x higher than general CPI',
            'Does not account for lifestyle inflation (increased spending patterns)',
            'Urban vs rural inflation rates differ significantly',
            'Assumes constant inflation rate (actual fluctuates yearly)',
          ]}
          example={{
            title: '₹10L today at 6% inflation for 20 years',
            description:
              'Current Value: ₹10,00,000 | Inflation: 6% | Years: 20 | Investment Return: 12% | Result: Future Cost = ₹32L (you need ₹32L to buy what ₹10L buys today). Real Return = 5.66%. Investment grows to ₹96L, easily beating inflation!',
          }}
        />
      </div>

      {/* Input Form */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Input Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentValue">Current Value (₹)</Label>
              <Input
                id="currentValue"
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="years">Time Period (Years)</Label>
              <Input
                id="years"
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="inflationRate">Inflation Rate (% p.a.)</Label>
              <Input
                id="inflationRate"
                type="number"
                step="0.1"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="investmentReturn">Investment Return (% p.a.)</Label>
              <Input
                id="investmentReturn"
                type="number"
                step="0.1"
                value={investmentReturn}
                onChange={(e) => setInvestmentReturn(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Future Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(futureValue / 100000).toFixed(2)}L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              After {years} years
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Real Return</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realReturn.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              After inflation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Power Loss</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {purchasingPowerLoss.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Purchasing power
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Investment Needed</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(investmentNeeded / 100000).toFixed(2)}L
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              To beat inflation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Inflation Impact Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis
                label={{ value: 'Value (₹)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
              />
              <Tooltip formatter={(value: any) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="realValue"
                stroke="#6b7280"
                strokeWidth={2}
                name="Real Value (Today)"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="nominalValue"
                stroke="#ef4444"
                strokeWidth={2}
                name="Nominal Value (with inflation)"
              />
              <Line
                type="monotone"
                dataKey="investmentValue"
                stroke="#10b981"
                strokeWidth={2}
                name="Investment Value"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding the Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
            <p className="text-sm">
              <strong>Purchasing Power:</strong> Due to {inflationRate}% inflation,
              ₹{currentValue.toLocaleString('en-IN')} today will need ₹
              {futureValue.toLocaleString('en-IN')} after {years} years to buy the same
              goods.
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
            <p className="text-sm">
              <strong>Beat Inflation:</strong> Investing at {investmentReturn}% will grow
              your money to ₹{investmentNeeded.toLocaleString('en-IN')}, maintaining
              purchasing power and providing real returns of {realReturn.toFixed(2)}%.
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-sm">
              <strong>Historical Context:</strong> India's average inflation has been
              around 5-7% over the past decades. Keeping money idle results in guaranteed
              loss of purchasing power.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
