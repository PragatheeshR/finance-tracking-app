'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { CalculatorInfo } from './calculator-info'

export function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [timePeriod, setTimePeriod] = useState(20)

  const monthlyRate = expectedReturn / 100 / 12
  const months = timePeriod * 12
  const futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
  const invested = monthlyInvestment * months
  const returns = futureValue - invested

  const data = []
  for (let year = 1; year <= timePeriod; year++) {
    const m = year * 12
    const fv = monthlyInvestment * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate)
    const inv = monthlyInvestment * m
    data.push({
      year,
      invested: Math.round(inv),
      value: Math.round(fv),
      returns: Math.round(fv - inv),
    })
  }

  const pieData = [
    { name: 'Invested', value: invested },
    { name: 'Returns', value: returns },
  ]

  return (
    <div className="space-y-6">
      {/* Info Button */}
      <div className="flex justify-end">
        <CalculatorInfo
          title="SIP Calculator"
          description="Calculate returns from Systematic Investment Plan (SIP) - the most popular way to invest in mutual funds in India"
          purpose={[
            'Calculate future value of monthly mutual fund investments',
            'Understand wealth creation through disciplined investing',
            'See the power of rupee cost averaging',
            'Plan your financial goals with SIP strategy',
            'Compare different investment amounts and time horizons',
          ]}
          howToUse={[
            'Enter the amount you can invest every month',
            'Set expected annual return rate (equity funds: 12-15%, balanced: 10-12%, debt: 6-8%)',
            'Choose your investment time period in years',
            'View total invested amount, returns earned, and future value',
            'Analyze the growth chart to see wealth accumulation over time',
            'Use the pie chart to visualize invested vs returns ratio',
          ]}
          keyFeatures={[
            'Accurate SIP future value calculation using compound interest formula',
            'Visual breakdown of invested capital vs returns generated',
            'Year-wise growth chart showing exponential wealth creation',
            'Pie chart for easy understanding of investment composition',
            'Real-time calculation with instant updates',
          ]}
          tips={[
            'SIP benefits from rupee cost averaging - buy more units when market is low',
            'Long-term SIPs (15+ years) have historically given 12-15% returns in Indian equity',
            'Start small but start early - even ₹1,000/month compounds significantly',
            'Don\'t stop SIP during market corrections - that\'s when you accumulate more units',
            'Step up your SIP by 10% annually as your income grows',
            'Top up SIP during market crashes for accelerated wealth creation',
            'SIP works best in equity mutual funds for long-term goals (&gt;5 years)',
          ]}
          limitations={[
            'Assumes constant return rate (actual returns fluctuate with market)',
            'Does not account for expense ratio (0.5-2% annually)',
            'Exit load and tax implications not included',
            'Market volatility means actual returns may vary significantly',
            'Past performance does not guarantee future returns',
          ]}
          example={{
            title: 'Investing ₹10,000/month for 20 years at 12%',
            description:
              'Monthly SIP: ₹10,000 | Rate: 12% p.a. | Time: 20 years | Result: Total Invested = ₹24L | Returns = ₹75L | Future Value = ₹99.9L (4.16x returns!). Same ₹24L as lump sum would become only ₹76L - SIP adds ₹24L more through rupee cost averaging!',
          }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Monthly Investment (₹)</Label>
              <Input type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label>Expected Return (% p.a.)</Label>
              <Input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label>Time Period (Years)</Label>
              <Input type="number" value={timePeriod} onChange={(e) => setTimePeriod(Number(e.target.value))} className="mt-1" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Results</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><span className="text-muted-foreground">Total Invested:</span><p className="text-2xl font-bold">₹{(invested / 100000).toFixed(2)}L</p></div>
            <div><span className="text-muted-foreground">Returns:</span><p className="text-2xl font-bold text-green-600">₹{(returns / 100000).toFixed(2)}L</p></div>
            <div><span className="text-muted-foreground">Future Value:</span><p className="text-3xl font-bold text-blue-600">₹{(futureValue / 100000).toFixed(2)}L</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip formatter={(value: number) => `₹${(value / 100000).toFixed(2)}L`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Growth Over Time</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(value: number) => `₹${(value / 100000).toFixed(2)}L`} />
              <Legend />
              <Area type="monotone" dataKey="invested" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Invested" />
              <Area type="monotone" dataKey="returns" stackId="1" stroke="#10b981" fill="#10b981" name="Returns" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
