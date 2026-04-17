'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CalculatorInfo } from './calculator-info'

export function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(5000000)
  const [interestRate, setInterestRate] = useState(8.5)
  const [tenure, setTenure] = useState(20)

  const monthlyRate = interestRate / 100 / 12
  const months = tenure * 12
  const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  const totalPayment = emi * months
  const totalInterest = totalPayment - loanAmount

  const yearlyData = []
  let balance = loanAmount
  for (let year = 1; year <= tenure; year++) {
    let yearPrincipal = 0
    let yearInterest = 0
    for (let m = 0; m < 12; m++) {
      const interest = balance * monthlyRate
      const principal = emi - interest
      yearPrincipal += principal
      yearInterest += interest
      balance -= principal
    }
    yearlyData.push({
      year,
      principal: Math.round(yearPrincipal),
      interest: Math.round(yearInterest),
      balance: Math.round(balance > 0 ? balance : 0),
    })
  }

  return (
    <div className="space-y-6">
      {/* Info Button */}
      <div className="flex justify-end">
        <CalculatorInfo
          title="EMI Calculator"
          description="Calculate your Equated Monthly Installment for home loans, car loans, or any other loans with detailed repayment schedule"
          purpose={[
            'Calculate exact monthly EMI for any loan',
            'Understand total interest payable over loan tenure',
            'View year-wise principal vs interest breakdown',
            'Plan your loan affordability and budget',
            'Compare different loan options by varying parameters',
          ]}
          howToUse={[
            'Enter the total loan amount you need',
            'Input the annual interest rate offered by lender',
            'Set the loan tenure in years',
            'View your monthly EMI instantly',
            'Check total payment and total interest',
            'Analyze the yearly repayment schedule chart',
          ]}
          keyFeatures={[
            'Accurate EMI calculation using standard formula: EMI = [P × r × (1+r)^n] / [(1+r)^n-1]',
            'Year-wise repayment breakdown showing principal and interest components',
            'Visual chart showing how interest proportion decreases over time',
            'Total cost of loan with interest percentage',
            'Outstanding balance tracking year by year',
          ]}
          tips={[
            'In early years, most of EMI goes towards interest, not principal',
            'Shorter tenure means higher EMI but much lower total interest',
            'Even 0.5% reduction in interest rate saves lakhs over 20 years',
            'Prepayment reduces total interest significantly (do it in early years)',
            'Home loan rates in India: 8-9% (2024), Car loan: 9-11%, Personal: 11-24%',
            'Consider processing fees, insurance in total loan cost',
            'EMI should not exceed 40-50% of monthly income for comfortable living',
          ]}
          limitations={[
            'Based on reducing balance method (standard in India)',
            'Does not include processing fees, insurance, or other charges',
            'Assumes fixed interest rate throughout tenure',
            'Prepayment options and their impact not included',
            'Does not account for tax benefits (e.g., Section 24 for home loans)',
            'Actual EMI may vary slightly due to bank-specific calculation methods',
          ]}
          example={{
            title: 'Home loan of ₹50L at 8.5% for 20 years',
            description:
              'Loan: ₹50,00,000 | Rate: 8.5% p.a. | Tenure: 20 years | Result: Monthly EMI = ₹43,391 | Total Payment = ₹1.04Cr | Total Interest = ₹54L (108% of principal!). Reducing tenure to 15 years increases EMI to ₹49,237 but saves ₹15L in interest.',
          }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label>Loan Amount (₹)</Label>
              <Input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label>Interest Rate (% p.a.)</Label>
              <Input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label>Tenure (Years)</Label>
              <Input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="mt-1" />
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>EMI Breakdown</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-muted-foreground">Monthly EMI</p>
              <p className="text-3xl font-bold text-blue-600">₹{emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <p className="text-sm text-muted-foreground">Principal Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{(loanAmount / 100000).toFixed(2)}L</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded">
              <p className="text-sm text-muted-foreground">Total Interest</p>
              <p className="text-2xl font-bold text-red-600">₹{(totalInterest / 100000).toFixed(2)}L</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Repayment Schedule (Yearly)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip formatter={(value: number) => `₹${(value / 100000).toFixed(2)}L`} />
              <Legend />
              <Bar dataKey="principal" stackId="a" fill="#10b981" name="Principal" />
              <Bar dataKey="interest" stackId="a" fill="#ef4444" name="Interest" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between"><span>Total Payment:</span><span className="font-bold">₹{(totalPayment / 100000).toFixed(2)}L</span></div>
            <div className="flex justify-between"><span>Total Interest:</span><span className="font-bold text-red-600">₹{(totalInterest / 100000).toFixed(2)}L</span></div>
            <div className="flex justify-between"><span>Interest %:</span><span className="font-bold">{((totalInterest / loanAmount) * 100).toFixed(1)}%</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
