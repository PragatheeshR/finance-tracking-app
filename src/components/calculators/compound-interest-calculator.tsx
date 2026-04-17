'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CalculatorInfo } from './calculator-info'

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(10)
  const [time, setTime] = useState(10)
  const [frequency, setFrequency] = useState('12') // Monthly

  const n = Number(frequency)
  const amount = principal * Math.pow(1 + rate / 100 / n, n * time)
  const interest = amount - principal

  const data = []
  for (let year = 0; year <= time; year++) {
    const value = principal * Math.pow(1 + rate / 100 / n, n * year)
    data.push({
      year,
      value: Math.round(value),
      principal: principal,
      interest: Math.round(value - principal),
    })
  }

  return (
    <div className="space-y-6">
      {/* Info Button */}
      <div className="flex justify-end">
        <CalculatorInfo
          title="Compound Interest Calculator"
          description="Calculate the power of compound interest and see how your investments grow exponentially over time"
          purpose={[
            'Understand how compound interest multiplies your wealth',
            'Compare different compounding frequencies (daily, monthly, quarterly, annual)',
            'Visualize exponential growth over time',
            'Calculate future value of lump sum investments',
            'See the dramatic difference between simple and compound interest',
          ]}
          howToUse={[
            'Enter your principal amount (initial investment)',
            'Input the annual interest rate (e.g., 10% for equity funds, 7% for debt)',
            'Set the time period in years',
            'Choose compounding frequency (more frequent = higher returns)',
            'View future value, interest earned, and growth percentage',
            'Observe the growth chart to understand exponential nature',
          ]}
          keyFeatures={[
            'Supports 5 compounding frequencies: Annual, Semi-annual, Quarterly, Monthly, Daily',
            'Real-time calculation with instant results',
            'Visual growth chart showing principal vs interest accumulation',
            'Growth percentage and detailed breakdown',
            'Comparative analysis of different compounding frequencies',
          ]}
          tips={[
            'More frequent compounding yields higher returns (Daily &gt; Monthly &gt; Quarterly)',
            'Even small differences in interest rates compound to large amounts over time',
            'Time is the most powerful factor - start early!',
            'Compound interest works both ways: great for investments, expensive for loans',
            'Rule of 72: Divide 72 by interest rate to find years to double your money',
            'Reinvest all returns to maximize compounding effect',
          ]}
          limitations={[
            'Assumes constant interest rate (actual rates fluctuate)',
            'Does not account for taxes on interest earned',
            'Inflation not considered (use Inflation Calculator separately)',
            'No provision for additional investments (use SIP Calculator for that)',
            'Bank/fund charges and fees not included',
          ]}
          example={{
            title: 'Investing ₹1L at 10% for 10 years',
            description:
              'Principal: ₹1,00,000 | Rate: 10% p.a. | Time: 10 years | Monthly Compounding | Result: Future Value = ₹2,70,704 | Interest Earned = ₹1,70,704 (170.7% growth). Same investment with annual compounding gives only ₹2,59,374 - ₹11,330 less!',
          }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Principal Amount (₹)</Label>
              <Input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label>Annual Interest Rate (%)</Label>
              <Input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label>Time Period (Years)</Label>
              <Input type="number" value={time} onChange={(e) => setTime(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label>Compounding Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Annually</SelectItem>
                  <SelectItem value="2">Semi-Annually</SelectItem>
                  <SelectItem value="4">Quarterly</SelectItem>
                  <SelectItem value="12">Monthly</SelectItem>
                  <SelectItem value="365">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Results</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-muted-foreground">Future Value</p>
              <p className="text-3xl font-bold text-blue-600">₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-sm text-muted-foreground">Interest Earned</p>
              <p className="text-2xl font-bold text-green-600">₹{interest.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-muted-foreground">Principal:</span>
              <span className="font-semibold">₹{principal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Growth:</span>
              <span className="font-semibold text-green-600">{((interest / principal) * 100).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Compound Growth Over Time</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
              <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Area type="monotone" dataKey="principal" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Principal" />
              <Area type="monotone" dataKey="interest" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} name="Interest" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Power of Compounding</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            With {frequency === '12' ? 'monthly' : frequency === '4' ? 'quarterly' : frequency === '365' ? 'daily' : 'annual'} compounding at {rate}% for {time} years, your ₹{principal.toLocaleString('en-IN')} grows to ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}, earning ₹{interest.toLocaleString('en-IN', { maximumFractionDigits: 0 })} in interest—a {((interest / principal) * 100).toFixed(1)}% return!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
