'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, TrendingUp, Flame, Percent, PiggyBank, Home } from 'lucide-react'
import { IncomeTaxCalculator } from '@/components/calculators/income-tax-calculator'
import { FIRECalculator } from '@/components/calculators/fire-calculator'
import { InflationCalculator } from '@/components/calculators/inflation-calculator'
import { SIPCalculator } from '@/components/calculators/sip-calculator'
import { EMICalculator } from '@/components/calculators/emi-calculator'
import { CompoundInterestCalculator } from '@/components/calculators/compound-interest-calculator'

export default function CalculatorsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Financial Calculators
          </h1>
          <p className="text-muted-foreground">
            Plan your finances with powerful calculation tools
          </p>
        </div>

        {/* Calculators Tabs */}
        <Tabs defaultValue="tax" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="tax" className="gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Income Tax</span>
            </TabsTrigger>
            <TabsTrigger value="fire" className="gap-2">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">FIRE</span>
            </TabsTrigger>
            <TabsTrigger value="inflation" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Inflation</span>
            </TabsTrigger>
            <TabsTrigger value="sip" className="gap-2">
              <PiggyBank className="h-4 w-4" />
              <span className="hidden sm:inline">SIP</span>
            </TabsTrigger>
            <TabsTrigger value="emi" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">EMI</span>
            </TabsTrigger>
            <TabsTrigger value="compound" className="gap-2">
              <Percent className="h-4 w-4" />
              <span className="hidden sm:inline">Compound</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Income Tax Calculator (India - FY 2024-25)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare Old Regime vs New Regime and find which saves you more
                </p>
              </CardHeader>
              <CardContent>
                <IncomeTaxCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fire">
            <Card>
              <CardHeader>
                <CardTitle>FIRE Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculate your Financial Independence, Retire Early number
                </p>
              </CardHeader>
              <CardContent>
                <FIRECalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inflation">
            <Card>
              <CardHeader>
                <CardTitle>Inflation Adjusted Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculate future value and purchasing power with inflation
                </p>
              </CardHeader>
              <CardContent>
                <InflationCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sip">
            <Card>
              <CardHeader>
                <CardTitle>SIP Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Systematic Investment Plan returns calculator
                </p>
              </CardHeader>
              <CardContent>
                <SIPCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emi">
            <Card>
              <CardHeader>
                <CardTitle>EMI Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculate your loan EMI and repayment schedule
                </p>
              </CardHeader>
              <CardContent>
                <EMICalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compound">
            <Card>
              <CardHeader>
                <CardTitle>Compound Interest Calculator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  See the power of compound interest over time
                </p>
              </CardHeader>
              <CardContent>
                <CompoundInterestCalculator />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
