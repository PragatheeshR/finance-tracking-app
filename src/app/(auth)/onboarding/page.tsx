'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Loader2, Check, ArrowRight, ArrowLeft, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

const STEPS = [
  { id: 1, title: 'Welcome', description: 'Let\'s get you started' },
  { id: 2, title: 'Profile', description: 'Tell us about yourself' },
  { id: 3, title: 'Preferences', description: 'Set your preferences' },
  { id: 4, title: 'Financial Goals', description: 'What are you aiming for?' },
  { id: 5, title: 'Complete', description: 'You\'re all set!' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    // Profile
    monthlyIncome: '',
    occupation: '',

    // Preferences
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    budgetCycle: 'MONTHLY',

    // Goals
    primaryGoal: '',
    retirementAge: '',
    savingsRate: '',
  })

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)

    try {
      // Save onboarding data
      const response = await fetch('/api/v1/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to complete onboarding')
      }

      toast.success('Welcome to Finance Tracker! 🎉')
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Failed to complete setup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Finance Tracker!</h2>
              <p className="text-muted-foreground text-lg">
                Let's set up your account in just a few steps
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 text-left">
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-semibold mb-1">📊 Track Expenses</div>
                <p className="text-sm text-muted-foreground">
                  Monitor where your money goes
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-semibold mb-1">💰 Manage Portfolio</div>
                <p className="text-sm text-muted-foreground">
                  Track all your investments
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-semibold mb-1">🎯 Set Goals</div>
                <p className="text-sm text-muted-foreground">
                  Plan for your future
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="font-semibold mb-1">📈 View Analytics</div>
                <p className="text-sm text-muted-foreground">
                  Insights at your fingertips
                </p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">Tell us about yourself</h3>
              <p className="text-sm text-muted-foreground">
                This helps us personalize your experience
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="e.g., 50000"
                  value={formData.monthlyIncome}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyIncome: e.target.value })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional - helps with budget recommendations
                </p>
              </div>
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  placeholder="e.g., Software Engineer"
                  value={formData.occupation}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">Set your preferences</h3>
              <p className="text-sm text-muted-foreground">
                Customize how you want to use the app
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value || 'INR' })
                  }
                >
                  <SelectTrigger id="currency" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                    <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                    <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budgetCycle">Budget Cycle</Label>
                <Select
                  value={formData.budgetCycle}
                  onValueChange={(value) =>
                    setFormData({ ...formData, budgetCycle: value })
                  }
                >
                  <SelectTrigger id="budgetCycle" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4 py-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">What are your financial goals?</h3>
              <p className="text-sm text-muted-foreground">
                Help us tailor recommendations for you
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="primaryGoal">Primary Financial Goal</Label>
                <Select
                  value={formData.primaryGoal}
                  onValueChange={(value) =>
                    setFormData({ ...formData, primaryGoal: value })
                  }
                >
                  <SelectTrigger id="primaryGoal" className="mt-1">
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retirement">Retirement Planning</SelectItem>
                    <SelectItem value="house">Buy a House</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="wealth">Build Wealth</SelectItem>
                    <SelectItem value="debt">Pay Off Debt</SelectItem>
                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="retirementAge">Target Retirement Age</Label>
                <Input
                  id="retirementAge"
                  type="number"
                  placeholder="e.g., 55"
                  value={formData.retirementAge}
                  onChange={(e) =>
                    setFormData({ ...formData, retirementAge: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="savingsRate">Target Savings Rate (%)</Label>
                <Input
                  id="savingsRate"
                  type="number"
                  placeholder="e.g., 30"
                  value={formData.savingsRate}
                  onChange={(e) =>
                    setFormData({ ...formData, savingsRate: e.target.value })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage of income you want to save
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">You're All Set!</h2>
              <p className="text-muted-foreground text-lg">
                Your account is ready. Let's start tracking your finances!
              </p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">What's next?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Add your first expense</li>
                <li>✓ Set up your investment portfolio</li>
                <li>✓ Create financial goals</li>
                <li>✓ Explore powerful calculators</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <CardTitle className="text-2xl mt-4">
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} disabled={isLoading}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
