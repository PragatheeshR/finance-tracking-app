'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Calculator, TrendingDown, AlertCircle, AlertTriangle } from 'lucide-react'
import { CalculatorInfo } from './calculator-info'

export function IncomeTaxCalculator() {
  const [grossSalary, setGrossSalary] = useState(1200000)
  const [age, setAge] = useState('below60')
  const [section80C, setSection80C] = useState(150000)
  const [section80D, setSection80D] = useState(25000)
  const [hra, setHra] = useState(0)
  const [lta, setLta] = useState(0)
  const [homeLoanInterest, setHomeLoanInterest] = useState(0)
  const [nps80CCD1B, setNps80CCD1B] = useState(0)
  const [nps80CCD2, setNps80CCD2] = useState(0)
  const [otherDeductions, setOtherDeductions] = useState(0)

  // Old Regime Tax Slabs (FY 2024-25) with Age-based exemptions
  const calculateOldRegimeTax = () => {
    // Standard deduction ₹50,000
    const standardDeduction = 50000
    const incomeAfterStandardDeduction = Math.max(grossSalary - standardDeduction, 0)

    // Calculate deductions with proper caps
    const section80CAmount = Math.min(section80C, 150000)
    const section80DAmount = Math.min(section80D, 100000)
    const nps80CCD1BAmount = Math.min(nps80CCD1B, 50000)
    const nps80CCD2Amount = Math.min(nps80CCD2, grossSalary * 0.10) // 10% of salary, employer contribution
    const homeLoanInterestAmount = Math.min(homeLoanInterest, 200000)

    const totalDeductions =
      section80CAmount +
      section80DAmount +
      nps80CCD1BAmount +
      nps80CCD2Amount +
      hra +
      lta +
      homeLoanInterestAmount +
      otherDeductions

    const taxableIncome = Math.max(incomeAfterStandardDeduction - totalDeductions, 0)

    // Age-based tax slabs
    let tax = 0
    let basicExemption = 250000

    if (age === 'senior') {
      basicExemption = 300000 // 60-80 years
    } else if (age === 'superSenior') {
      basicExemption = 500000 // 80+ years
    }

    if (taxableIncome <= basicExemption) {
      tax = 0
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - basicExemption) * 0.05
    } else if (taxableIncome <= 1000000) {
      tax = (500000 - basicExemption) * 0.05 + (taxableIncome - 500000) * 0.2
    } else {
      tax = (500000 - basicExemption) * 0.05 + 500000 * 0.2 + (taxableIncome - 1000000) * 0.3
    }

    // Tax rebate under Section 87A (before surcharge and cess)
    const rebate = taxableIncome <= 500000 ? Math.min(tax, 12500) : 0
    const taxAfterRebate = tax - rebate

    // Surcharge calculation for high income
    let surcharge = 0
    let surchargeRate = 0
    if (taxableIncome > 5000000) {
      surchargeRate = 0.37 // 37%
      surcharge = taxAfterRebate * surchargeRate
    } else if (taxableIncome > 2000000) {
      surchargeRate = 0.25 // 25%
      surcharge = taxAfterRebate * surchargeRate
    } else if (taxableIncome > 1000000) {
      surchargeRate = 0.15 // 15%
      surcharge = taxAfterRebate * surchargeRate
    } else if (taxableIncome > 5000000) {
      surchargeRate = 0.10 // 10%
      surcharge = taxAfterRebate * surchargeRate
    }

    // Marginal Relief (if applicable)
    let marginalRelief = 0
    if (surcharge > 0) {
      const taxThreshold = surchargeRate === 0.37 ? 5000000 :
                          surchargeRate === 0.25 ? 2000000 :
                          surchargeRate === 0.15 ? 1000000 : 5000000

      const taxAtThreshold = calculateTaxAtIncome(taxThreshold, basicExemption, rebate)
      const incomeAboveThreshold = taxableIncome - taxThreshold
      const taxOnAdditionalIncome = (taxAfterRebate + surcharge) - taxAtThreshold

      if (taxOnAdditionalIncome > incomeAboveThreshold) {
        marginalRelief = taxOnAdditionalIncome - incomeAboveThreshold
      }
    }

    const taxAfterSurcharge = taxAfterRebate + surcharge - marginalRelief

    // 4% Health and Education Cess
    const cessAmount = taxAfterSurcharge * 0.04
    const totalTax = taxAfterSurcharge + cessAmount

    return {
      grossSalary,
      standardDeduction,
      incomeAfterStandardDeduction,
      taxableIncome,
      basicExemption,
      tax,
      rebate,
      taxAfterRebate,
      surcharge,
      surchargeRate: surchargeRate * 100,
      marginalRelief,
      cess: cessAmount,
      totalTax,
      takeHome: grossSalary - totalTax,
      deductions: {
        standard: standardDeduction,
        section80C: section80CAmount,
        section80D: section80DAmount,
        nps80CCD1B: nps80CCD1BAmount,
        nps80CCD2: nps80CCD2Amount,
        hra,
        lta,
        homeLoan: homeLoanInterestAmount,
        other: otherDeductions,
        total: totalDeductions,
      },
    }
  }

  // Helper function for marginal relief calculation
  const calculateTaxAtIncome = (income: number, basicExemption: number, rebate: number) => {
    let tax = 0
    if (income <= basicExemption) {
      tax = 0
    } else if (income <= 500000) {
      tax = (income - basicExemption) * 0.05
    } else if (income <= 1000000) {
      tax = (500000 - basicExemption) * 0.05 + (income - 500000) * 0.2
    } else {
      tax = (500000 - basicExemption) * 0.05 + 500000 * 0.2 + (income - 1000000) * 0.3
    }
    return tax - (income <= 500000 ? Math.min(tax, rebate) : 0)
  }

  // New Regime Tax Slabs (FY 2024-25)
  const calculateNewRegimeTax = () => {
    // Standard deduction ₹50,000
    const standardDeduction = 50000
    const taxableIncome = Math.max(grossSalary - standardDeduction, 0)

    // New Regime Tax Slabs (no age-based differentiation)
    let tax = 0
    if (taxableIncome <= 300000) {
      tax = 0
    } else if (taxableIncome <= 600000) {
      tax = (taxableIncome - 300000) * 0.05
    } else if (taxableIncome <= 900000) {
      tax = 15000 + (taxableIncome - 600000) * 0.1
    } else if (taxableIncome <= 1200000) {
      tax = 15000 + 30000 + (taxableIncome - 900000) * 0.15
    } else if (taxableIncome <= 1500000) {
      tax = 15000 + 30000 + 45000 + (taxableIncome - 1200000) * 0.2
    } else {
      tax = 15000 + 30000 + 45000 + 60000 + (taxableIncome - 1500000) * 0.3
    }

    // Tax rebate under Section 87A (before surcharge and cess)
    const rebate = taxableIncome <= 700000 ? Math.min(tax, 25000) : 0
    const taxAfterRebate = tax - rebate

    // Surcharge calculation
    let surcharge = 0
    let surchargeRate = 0
    if (taxableIncome > 5000000) {
      surchargeRate = 0.25 // 25% for new regime
      surcharge = taxAfterRebate * surchargeRate
    } else if (taxableIncome > 2000000) {
      surchargeRate = 0.15 // 15%
      surcharge = taxAfterRebate * surchargeRate
    } else if (taxableIncome > 1000000) {
      surchargeRate = 0.10 // 10%
      surcharge = taxAfterRebate * surchargeRate
    } else if (taxableIncome > 5000000) {
      surchargeRate = 0.10 // 10%
      surcharge = taxAfterRebate * surchargeRate
    }

    // Marginal Relief
    let marginalRelief = 0
    if (surcharge > 0) {
      const taxThreshold = surchargeRate === 0.25 ? 5000000 :
                          surchargeRate === 0.15 ? 2000000 :
                          1000000

      const taxAtThreshold = calculateNewRegimeTaxAtIncome(taxThreshold, rebate)
      const incomeAboveThreshold = taxableIncome - taxThreshold
      const taxOnAdditionalIncome = (taxAfterRebate + surcharge) - taxAtThreshold

      if (taxOnAdditionalIncome > incomeAboveThreshold) {
        marginalRelief = taxOnAdditionalIncome - incomeAboveThreshold
      }
    }

    const taxAfterSurcharge = taxAfterRebate + surcharge - marginalRelief

    // 4% Health and Education Cess
    const cessAmount = taxAfterSurcharge * 0.04
    const totalTax = taxAfterSurcharge + cessAmount

    return {
      grossSalary,
      standardDeduction,
      taxableIncome,
      tax,
      rebate,
      taxAfterRebate,
      surcharge,
      surchargeRate: surchargeRate * 100,
      marginalRelief,
      cess: cessAmount,
      totalTax,
      takeHome: grossSalary - totalTax,
      deductions: {
        standard: standardDeduction,
        total: standardDeduction,
      },
    }
  }

  // Helper for new regime marginal relief
  const calculateNewRegimeTaxAtIncome = (income: number, rebate: number) => {
    let tax = 0
    if (income <= 300000) {
      tax = 0
    } else if (income <= 600000) {
      tax = (income - 300000) * 0.05
    } else if (income <= 900000) {
      tax = 15000 + (income - 600000) * 0.1
    } else if (income <= 1200000) {
      tax = 15000 + 30000 + (income - 900000) * 0.15
    } else if (income <= 1500000) {
      tax = 15000 + 30000 + 45000 + (income - 1200000) * 0.2
    } else {
      tax = 15000 + 30000 + 45000 + 60000 + (income - 1500000) * 0.3
    }
    return tax - (income <= 700000 ? Math.min(tax, rebate) : 0)
  }

  const oldRegime = calculateOldRegimeTax()
  const newRegime = calculateNewRegimeTax()

  const savings = oldRegime.totalTax - newRegime.totalTax
  const betterRegime = savings > 0 ? 'New Regime' : 'Old Regime'

  const comparisonData = [
    {
      name: 'Gross Salary',
      old: grossSalary,
      new: grossSalary,
    },
    {
      name: 'Deductions',
      old: oldRegime.deductions.total + oldRegime.standardDeduction,
      new: newRegime.deductions.total,
    },
    {
      name: 'Taxable Income',
      old: oldRegime.taxableIncome,
      new: newRegime.taxableIncome,
    },
    {
      name: 'Tax Amount',
      old: oldRegime.totalTax,
      new: newRegime.totalTax,
    },
    {
      name: 'Take Home',
      old: oldRegime.takeHome,
      new: newRegime.takeHome,
    },
  ]

  const pieData = [
    { name: 'Tax', value: Math.min(oldRegime.totalTax, newRegime.totalTax) },
    {
      name: 'Take Home',
      value: Math.max(oldRegime.takeHome, newRegime.takeHome),
    },
  ]

  const COLORS = ['#ef4444', '#10b981']

  return (
    <div className="space-y-6">
      {/* Info Button */}
      <div className="flex justify-end">
        <CalculatorInfo
          title="Income Tax Calculator"
          description="Compare Old vs New Tax Regime and find which one saves you more money for FY 2024-25"
          purpose={[
            'Calculate your income tax liability under both Old and New tax regimes',
            'Compare tax amounts and identify which regime is more beneficial for you',
            'Understand the impact of deductions on your tax liability',
            'Plan your tax-saving investments and deductions',
            'Get accurate tax calculations with surcharge and cess for all income levels',
          ]}
          howToUse={[
            'Enter your Gross Annual Salary (CTC or total income)',
            'Select your Age Category (below 60, senior citizen, or super senior citizen)',
            'For Old Regime: Enter all applicable deductions (80C, 80D, HRA, Home Loan, etc.)',
            'The calculator will automatically compute tax for both regimes',
            'Check the recommendation card to see which regime saves you more money',
            'Review detailed breakdowns for both regimes side by side',
          ]}
          keyFeatures={[
            'Age-based calculations (different slabs for senior & super senior citizens)',
            'Surcharge calculation for high incomes (>₹50L, >₹1Cr, >₹2Cr, >₹5Cr)',
            'Marginal relief to prevent tax anomalies at surcharge thresholds',
            'Section 87A rebate for eligible taxpayers',
            'Visual comparison charts and detailed tax breakdown',
            'Takes into account 4% Health & Education Cess',
          ]}
          tips={[
            'Old Regime benefits those with significant deductions (>₹2.5L typically)',
            'New Regime is simpler and better for those with fewer deductions',
            'Senior citizens get higher basic exemptions only in Old Regime',
            'HRA and LTA should be entered as pre-calculated exempt amounts',
            'Section 80CCD(1B) provides additional ₹50K deduction over 80C limit',
            'Home loan interest is capped at ₹2L under Section 24(b)',
          ]}
          limitations={[
            'This calculator is for ESTIMATION PURPOSES ONLY',
            'For final tax filing, consult a Chartered Accountant',
            'HRA exemption calculation is not included - enter pre-calculated amount',
            'LTA exemption rules are complex - enter only exempt portion',
            'Agricultural income consideration is not included',
            'Assumes self-occupied property for home loan interest',
            'Does not include state-specific professional tax',
          ]}
          example={{
            title: 'Salaried Employee with ₹12L Income',
            description:
              'Annual Salary: ₹12,00,000 | 80C: ₹1,50,000 | 80D: ₹25,000 | Result: Old Regime saves ₹24,700 due to deductions. Without deductions, New Regime would save ₹22,500.',
          }}
        />
      </div>

      {/* Legal Disclaimer */}
      <Card className="border-red-500 border-2">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-bold text-red-600">LEGAL DISCLAIMER</p>
              <p className="text-xs text-muted-foreground">
                This calculator is for ESTIMATION PURPOSES ONLY. Tax laws are complex and individual circumstances vary.
                This tool does NOT constitute professional tax advice. For accurate tax calculations and filing, please consult
                a Chartered Accountant or use the official Income Tax Department calculator. The developers assume no liability
                for any financial decisions made based on these calculations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Assumptions */}
      <Card className="border-orange-500">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Calculation Assumptions:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• FY 2024-25 (AY 2025-26) tax slabs and rates</li>
                <li>• Standard deduction of ₹50,000 applied in both regimes</li>
                <li>• Section 80C capped at ₹1.5L, 80D at ₹1L, 80CCD(1B) at ₹50K</li>
                <li>• Home Loan Interest (24b) capped at ₹2L (self-occupied property)</li>
                <li>• Surcharge and marginal relief calculated for income &gt; ₹50L</li>
                <li>• HRA/LTA should be pre-calculated exempt portions only</li>
                <li>• Rebate u/s 87A: ₹12,500 (Old ≤₹5L), ₹25,000 (New ≤₹7L)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Form */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="grossSalary">Gross Annual Salary (₹)</Label>
              <Input
                id="grossSalary"
                type="number"
                value={grossSalary}
                onChange={(e) => setGrossSalary(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="age">Age Category</Label>
              <Select value={age} onValueChange={setAge}>
                <SelectTrigger id="age" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="below60">Below 60 years</SelectItem>
                  <SelectItem value="senior">60-80 years (Senior Citizen)</SelectItem>
                  <SelectItem value="superSenior">Above 80 years (Super Senior)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Senior citizen benefits apply to Old Regime only
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deductions (Old Regime Only)</CardTitle>
            <CardDescription className="text-xs">
              Not applicable in New Regime
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="section80C">Section 80C (Max ₹1.5L)</Label>
              <Input
                id="section80C"
                type="number"
                value={section80C}
                onChange={(e) => setSection80C(Number(e.target.value))}
                className="mt-1"
                placeholder="PPF, ELSS, EPF, LIC"
              />
            </div>
            <div>
              <Label htmlFor="section80D">Section 80D (Max ₹1L total)</Label>
              <Input
                id="section80D"
                type="number"
                value={section80D}
                onChange={(e) => setSection80D(Number(e.target.value))}
                className="mt-1"
                placeholder="Health Insurance"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Self ₹25K/₹50K + Parents ₹25K/₹50K (if senior)
              </p>
            </div>
            <div>
              <Label htmlFor="nps1b">Section 80CCD(1B) - NPS (Max ₹50K)</Label>
              <Input
                id="nps1b"
                type="number"
                value={nps80CCD1B}
                onChange={(e) => setNps80CCD1B(Number(e.target.value))}
                className="mt-1"
                placeholder="Additional NPS deduction"
              />
            </div>
            <div>
              <Label htmlFor="nps2">Section 80CCD(2) - Employer NPS</Label>
              <Input
                id="nps2"
                type="number"
                value={nps80CCD2}
                onChange={(e) => setNps80CCD2(Number(e.target.value))}
                className="mt-1"
                placeholder="Max 10% of salary"
              />
            </div>
            <div>
              <Label htmlFor="hra">HRA Exemption (Pre-calculated)</Label>
              <Input
                id="hra"
                type="number"
                value={hra}
                onChange={(e) => setHra(Number(e.target.value))}
                className="mt-1"
                placeholder="Exempt HRA amount"
              />
            </div>
            <div>
              <Label htmlFor="lta">LTA (Pre-calculated)</Label>
              <Input
                id="lta"
                type="number"
                value={lta}
                onChange={(e) => setLta(Number(e.target.value))}
                className="mt-1"
                placeholder="Exempt LTA amount"
              />
            </div>
            <div>
              <Label htmlFor="homeLoan">Section 24(b) - Home Loan Interest (Max ₹2L)</Label>
              <Input
                id="homeLoan"
                type="number"
                value={homeLoanInterest}
                onChange={(e) => setHomeLoanInterest(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="other">Other Deductions (80E, 80G, etc.)</Label>
              <Input
                id="other"
                type="number"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-primary">
              Choose {betterRegime}
            </p>
            <p className="text-muted-foreground">
              {betterRegime === 'New Regime' ? (
                <>
                  You will save ₹{Math.abs(savings).toLocaleString('en-IN')} with the New Regime
                </>
              ) : (
                <>
                  You will save ₹{Math.abs(savings).toLocaleString('en-IN')} with the Old Regime
                  (your deductions are significant)
                </>
              )}
            </p>
            {betterRegime === 'New Regime' && (
              <Badge className="bg-green-500">
                <TrendingDown className="h-3 w-3 mr-1" />
                Lower Tax
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Old Regime</CardTitle>
            <CardDescription>
              {age === 'superSenior' ? 'Basic exemption: ₹5L' :
               age === 'senior' ? 'Basic exemption: ₹3L' : 'Basic exemption: ₹2.5L'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Salary</span>
              <span className="font-semibold">₹{grossSalary.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Standard Deduction</span>
              <span className="font-semibold text-green-600">-₹{oldRegime.standardDeduction.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Chapter VI-A</span>
              <span className="font-semibold text-green-600">-₹{oldRegime.deductions.total.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground font-medium">Taxable Income</span>
              <span className="font-semibold">₹{oldRegime.taxableIncome.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-semibold">₹{oldRegime.tax.toLocaleString('en-IN')}</span>
            </div>
            {oldRegime.rebate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rebate u/s 87A</span>
                <span className="font-semibold text-green-600">-₹{oldRegime.rebate.toLocaleString('en-IN')}</span>
              </div>
            )}
            {oldRegime.surcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Surcharge ({oldRegime.surchargeRate}%)</span>
                <span className="font-semibold text-red-600">+₹{oldRegime.surcharge.toLocaleString('en-IN')}</span>
              </div>
            )}
            {oldRegime.marginalRelief > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marginal Relief</span>
                <span className="font-semibold text-green-600">-₹{oldRegime.marginalRelief.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cess (4%)</span>
              <span className="font-semibold">₹{oldRegime.cess.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Total Tax</span>
              <span className="font-bold text-red-600 text-lg">₹{oldRegime.totalTax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <span className="font-medium">Take Home</span>
              <span className="font-bold text-green-600 text-lg">₹{oldRegime.takeHome.toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Regime</CardTitle>
            <CardDescription>Basic exemption: ₹3L (no age benefit)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Salary</span>
              <span className="font-semibold">₹{grossSalary.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Standard Deduction</span>
              <span className="font-semibold text-green-600">-₹{newRegime.deductions.standard.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
              No other deductions in New Regime
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground font-medium">Taxable Income</span>
              <span className="font-semibold">₹{newRegime.taxableIncome.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-semibold">₹{newRegime.tax.toLocaleString('en-IN')}</span>
            </div>
            {newRegime.rebate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rebate u/s 87A</span>
                <span className="font-semibold text-green-600">-₹{newRegime.rebate.toLocaleString('en-IN')}</span>
              </div>
            )}
            {newRegime.surcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Surcharge ({newRegime.surchargeRate}%)</span>
                <span className="font-semibold text-red-600">+₹{newRegime.surcharge.toLocaleString('en-IN')}</span>
              </div>
            )}
            {newRegime.marginalRelief > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marginal Relief</span>
                <span className="font-semibold text-green-600">-₹{newRegime.marginalRelief.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cess (4%)</span>
              <span className="font-semibold">₹{newRegime.cess.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Total Tax</span>
              <span className="font-bold text-red-600 text-lg">₹{newRegime.totalTax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <span className="font-medium">Take Home</span>
              <span className="font-bold text-green-600 text-lg">₹{newRegime.takeHome.toLocaleString('en-IN')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Regime Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="old" fill="#3b82f6" name="Old Regime" />
                <Bar dataKey="new" fill="#10b981" name="New Regime" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax vs Take Home ({betterRegime})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tax Slabs Reference */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Old Regime Tax Slabs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {age === 'superSenior' ? (
                <>
                  <div className="flex justify-between"><span>₹0 - ₹5L:</span><span className="font-semibold">Nil</span></div>
                  <div className="flex justify-between"><span>₹5L - ₹10L:</span><span className="font-semibold">20%</span></div>
                </>
              ) : age === 'senior' ? (
                <>
                  <div className="flex justify-between"><span>₹0 - ₹3L:</span><span className="font-semibold">Nil</span></div>
                  <div className="flex justify-between"><span>₹3L - ₹5L:</span><span className="font-semibold">5%</span></div>
                  <div className="flex justify-between"><span>₹5L - ₹10L:</span><span className="font-semibold">20%</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span>₹0 - ₹2.5L:</span><span className="font-semibold">Nil</span></div>
                  <div className="flex justify-between"><span>₹2.5L - ₹5L:</span><span className="font-semibold">5%</span></div>
                  <div className="flex justify-between"><span>₹5L - ₹10L:</span><span className="font-semibold">20%</span></div>
                </>
              )}
              <div className="flex justify-between"><span>Above ₹10L:</span><span className="font-semibold">30%</span></div>
              <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                <div>+ Surcharge: 10% (&gt;₹50L), 15% (&gt;₹1Cr), 25% (&gt;₹2Cr), 37% (&gt;₹5Cr)</div>
                <div>+ 4% Cess on (Tax + Surcharge)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Regime Tax Slabs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>₹0 - ₹3L:</span><span className="font-semibold">Nil</span></div>
              <div className="flex justify-between"><span>₹3L - ₹6L:</span><span className="font-semibold">5%</span></div>
              <div className="flex justify-between"><span>₹6L - ₹9L:</span><span className="font-semibold">10%</span></div>
              <div className="flex justify-between"><span>₹9L - ₹12L:</span><span className="font-semibold">15%</span></div>
              <div className="flex justify-between"><span>₹12L - ₹15L:</span><span className="font-semibold">20%</span></div>
              <div className="flex justify-between"><span>Above ₹15L:</span><span className="font-semibold">30%</span></div>
              <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                <div>+ Surcharge: 10% (&gt;₹50L), 15% (&gt;₹1Cr), 25% (&gt;₹2Cr &amp; &gt;₹5Cr)</div>
                <div>+ 4% Cess on (Tax + Surcharge)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
