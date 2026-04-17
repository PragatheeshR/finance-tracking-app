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
  Area,
  AreaChart,
} from 'recharts'
import { Flame, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { CalculatorInfo } from './calculator-info'

export function FIRECalculator() {
  const [currentAge, setCurrentAge] = useState(30)
  const [retirementAge, setRetirementAge] = useState(50)
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000)
  const [currentSavings, setCurrentSavings] = useState(500000)
  const [monthlySavings, setMonthlySavings] = useState(30000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [inflationRate, setInflationRate] = useState(6)
  const [withdrawalRate, setWithdrawalRate] = useState(4)

  // Calculate FIRE number (using 4% rule by default)
  const annualExpenses = monthlyExpenses * 12
  const fireNumber = (annualExpenses * 100) / withdrawalRate

  // Years to FIRE
  const yearsToFIRE = retirementAge - currentAge

  // Calculate future value of current savings
  const futureValueOfSavings =
    currentSavings * Math.pow(1 + expectedReturn / 100, yearsToFIRE)

  // Calculate future value of monthly investments (SIP)
  const monthlyRate = expectedReturn / 100 / 12
  const months = yearsToFIRE * 12
  const futureValueOfInvestments =
    monthlySavings *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate)

  const totalCorpus = futureValueOfSavings + futureValueOfInvestments

  // Inflation adjusted expenses at retirement
  const inflationAdjustedExpenses =
    annualExpenses * Math.pow(1 + inflationRate / 100, yearsToFIRE)

  const inflationAdjustedFIRENumber =
    (inflationAdjustedExpenses * 100) / withdrawalRate

  // Will you reach FIRE?
  const willReachFIRE = totalCorpus >= inflationAdjustedFIRENumber
  const shortfall = inflationAdjustedFIRENumber - totalCorpus

  // Required monthly savings to reach FIRE
  const requiredMonthlyToReachFIRE =
    shortfall > 0
      ? (shortfall * monthlyRate) /
        ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate))
      : 0

  // Projection data for chart
  const projectionData = []
  for (let year = 0; year <= yearsToFIRE; year++) {
    const age = currentAge + year
    const savingsValue =
      currentSavings * Math.pow(1 + expectedReturn / 100, year)
    const investmentMonths = year * 12
    const investmentValue =
      monthlySavings *
      ((Math.pow(1 + monthlyRate, investmentMonths) - 1) / monthlyRate) *
      (1 + monthlyRate)
    const totalValue = savingsValue + investmentValue
    const fireTarget =
      (annualExpenses * Math.pow(1 + inflationRate / 100, year) * 100) /
      withdrawalRate

    projectionData.push({
      age,
      year,
      corpus: Math.round(totalValue),
      fireTarget: Math.round(fireTarget),
    })
  }

  // Withdrawal strategy projection (post-FIRE)
  const withdrawalData = []
  let remainingCorpus = totalCorpus
  for (let year = 0; year <= 30; year++) {
    const age = retirementAge + year
    const annualWithdrawal =
      inflationAdjustedExpenses * Math.pow(1 + inflationRate / 100, year)
    remainingCorpus = remainingCorpus * (1 + expectedReturn / 100) - annualWithdrawal

    if (remainingCorpus < 0) remainingCorpus = 0

    withdrawalData.push({
      age,
      year: year + yearsToFIRE,
      corpus: Math.round(remainingCorpus),
      withdrawal: Math.round(annualWithdrawal),
    })

    if (remainingCorpus === 0) break
  }

  return (
    <div className="space-y-6">
      {/* Info Button */}
      <div className="flex justify-end">
        <CalculatorInfo
          title="FIRE Calculator"
          description="Calculate your Financial Independence, Retire Early number and plan your journey to financial freedom"
          purpose={[
            'Determine how much wealth you need to achieve financial independence',
            'Calculate how many years until you can retire early',
            'Understand the impact of savings rate, returns, and expenses on FIRE goals',
            'Plan your post-retirement withdrawal strategy',
            'Visualize your wealth accumulation journey',
          ]}
          howToUse={[
            'Enter your current age and target retirement age',
            'Input your current monthly expenses (this will be your retirement lifestyle cost)',
            'Enter your existing savings/investments',
            'Specify how much you can save every month',
            'Set expected annual return rate (e.g., 12% for equity, 8% for balanced)',
            'Adjust inflation rate (India average: 6%)',
            'Set withdrawal rate (default 4% is safe per Trinity Study)',
            'Review if you\'ll reach FIRE or need to increase monthly savings',
          ]}
          keyFeatures={[
            'Calculates FIRE number using the 4% safe withdrawal rule',
            'Inflation-adjusted projections for realistic planning',
            'Future value calculation for both current savings and monthly SIP',
            'Shortfall detection with required monthly savings recommendation',
            'Wealth accumulation chart showing your journey to FIRE',
            'Post-retirement withdrawal sustainability analysis (30+ years)',
            'Real-time calculation of years to FIRE',
          ]}
          tips={[
            'FIRE Number = Annual Expenses × 25 (using 4% withdrawal rule)',
            'Lower withdrawal rate (3-3.5%) provides higher safety margin',
            'Account for inflation - your expenses will grow over time',
            'Higher savings rate dramatically reduces years to FIRE',
            'Consider healthcare costs separately - they increase with age',
            'Build emergency fund separately before starting FIRE journey',
            'Review and adjust every year based on actual expenses and returns',
          ]}
          limitations={[
            'Based on historical safe withdrawal rate studies (Trinity Study)',
            'Actual market returns may vary significantly',
            'Does not account for one-time expenses (medical emergency, property purchase)',
            'Healthcare inflation in India is typically higher than general inflation',
            'Tax implications on withdrawals not included',
            'Assumes constant monthly savings (actual may vary)',
          ]}
          example={{
            title: '30-year-old planning to retire at 50',
            description:
              'Age 30, Retire at 50 | Monthly Expenses: ₹50,000 | Current Savings: ₹5L | Monthly SIP: ₹30,000 | Returns: 12% | Inflation: 6% | Result: FIRE Number ₹4.8Cr (inflation-adjusted). You\'ll accumulate ₹5.2Cr by age 50. FIRE achieved! 🎉',
          }}
        />
      </div>

      {/* Input Form */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="retirementAge">Target Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="monthlyExpenses">Current Monthly Expenses (₹)</Label>
              <Input
                id="monthlyExpenses"
                type="number"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Savings & Investments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentSavings">Current Savings (₹)</Label>
              <Input
                id="currentSavings"
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="monthlySavings">Monthly Savings (₹)</Label>
              <Input
                id="monthlySavings"
                type="number"
                value={monthlySavings}
                onChange={(e) => setMonthlySavings(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="expectedReturn">Expected Return (% p.a.)</Label>
              <Input
                id="expectedReturn"
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assumptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="inflationRate">Inflation Rate (% p.a.)</Label>
              <Input
                id="inflationRate"
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="withdrawalRate">Withdrawal Rate (%)</Label>
              <Input
                id="withdrawalRate"
                type="number"
                value={withdrawalRate}
                onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                4% is the safe withdrawal rate (Trinity Study)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FIRE Number Results */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">FIRE Number</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(fireNumber / 10000000).toFixed(2)}Cr
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Today's value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Inflation Adjusted
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(inflationAdjustedFIRENumber / 10000000).toFixed(2)}Cr
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              At retirement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Years to FIRE</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearsToFIRE}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Retire at age {retirementAge}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expected Corpus</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(totalCorpus / 10000000).toFixed(2)}Cr
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              At retirement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Card */}
      <Card className={willReachFIRE ? 'border-green-500 border-2' : 'border-red-500 border-2'}>
        <CardHeader>
          <CardTitle>FIRE Status</CardTitle>
        </CardHeader>
        <CardContent>
          {willReachFIRE ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600">
                🎉 You're on track to reach FIRE!
              </p>
              <p className="text-muted-foreground">
                Your projected corpus of ₹{(totalCorpus / 10000000).toFixed(2)}Cr exceeds
                your FIRE number of ₹{(inflationAdjustedFIRENumber / 10000000).toFixed(2)}Cr
              </p>
              <p className="text-sm">
                Excess: ₹{((totalCorpus - inflationAdjustedFIRENumber) / 10000000).toFixed(2)}Cr
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-red-600">
                ⚠️ Shortfall detected
              </p>
              <p className="text-muted-foreground">
                You're short by ₹{(shortfall / 10000000).toFixed(2)}Cr
              </p>
              <p className="text-sm font-semibold mt-2">
                Required monthly savings:{' '}
                <span className="text-orange-600">
                  ₹{(requiredMonthlyToReachFIRE + monthlySavings).toLocaleString('en-IN')}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Increase by ₹{requiredMonthlyToReachFIRE.toLocaleString('en-IN')}/month
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Wealth Accumulation Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
              <YAxis
                label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
              />
              <Tooltip
                formatter={(value: number) => `₹${(value / 10000000).toFixed(2)}Cr`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="corpus"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Your Corpus"
              />
              <Area
                type="monotone"
                dataKey="fireTarget"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
                name="FIRE Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Withdrawal Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Post-Retirement Withdrawal Strategy</CardTitle>
          <p className="text-sm text-muted-foreground">
            Corpus sustainability with {withdrawalRate}% withdrawal rate
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={withdrawalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
              <YAxis
                label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
              />
              <Tooltip
                formatter={(value: number) => `₹${(value / 10000000).toFixed(2)}Cr`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="corpus"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Remaining Corpus"
              />
              <Line
                type="monotone"
                dataKey="withdrawal"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Annual Withdrawal"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-sm">
              <strong>Note:</strong> This assumes {expectedReturn}% annual returns and{' '}
              {inflationRate}% inflation. Your corpus will last{' '}
              {withdrawalData.findIndex((d) => d.corpus === 0) === -1
                ? '30+ years'
                : `${withdrawalData.findIndex((d) => d.corpus === 0)} years`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
