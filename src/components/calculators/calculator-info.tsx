'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface CalculatorInfoProps {
  title: string
  description: string
  purpose: string[]
  howToUse: string[]
  keyFeatures?: string[]
  tips?: string[]
  limitations?: string[]
  example?: {
    title: string
    description: string
  }
}

export function CalculatorInfo({
  title,
  description,
  purpose,
  howToUse,
  keyFeatures,
  tips,
  limitations,
  example,
}: CalculatorInfoProps) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          How to Use
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Purpose */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  1
                </span>
                What is this calculator for?
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-8">
                {purpose.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  2
                </span>
                How to use this calculator
              </h3>
              <ol className="space-y-2 text-sm text-muted-foreground ml-8">
                {howToUse.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="font-semibold text-primary">
                      {index + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Key Features */}
          {keyFeatures && keyFeatures.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    ✓
                  </span>
                  Key Features
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-8">
                  {keyFeatures.map((feature, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          {tips && tips.length > 0 && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  💡 Pro Tips
                </h3>
                <ul className="space-y-2 text-sm ml-8">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-blue-500">→</span>
                      <span className="text-blue-700 dark:text-blue-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Example */}
          {example && (
            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3 text-purple-700 dark:text-purple-300">
                  📝 Example: {example.title}
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 ml-4">
                  {example.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Limitations */}
          {limitations && limitations.length > 0 && (
            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  ⚠️ Important Notes & Limitations
                </h3>
                <ul className="space-y-2 text-sm ml-8">
                  {limitations.map((limitation, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-orange-500">!</span>
                      <span className="text-orange-700 dark:text-orange-300">
                        {limitation}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
