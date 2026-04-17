'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Shield, Calendar, DollarSign, User, FileText, ExternalLink } from 'lucide-react'

interface PolicyDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: any
}

const policyTypeLabels: Record<string, string> = {
  HEALTH: '🏥 Health Insurance',
  LIFE: '💖 Life Insurance',
  CAR: '🚗 Car Insurance',
  BIKE: '🏍️ Bike Insurance',
  OTHER: '📄 Other Insurance',
}

export function PolicyDetailDialog({
  open,
  onOpenChange,
  policy,
}: PolicyDetailDialogProps) {
  if (!policy) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified'
    return `₹${parseFloat(amount.toString()).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getDaysUntilExpiry = () => {
    if (!policy.validTill) return null
    const today = new Date()
    const expiryDate = new Date(policy.validTill)
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilExpiry = getDaysUntilExpiry()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {policy.policyName}
          </DialogTitle>
          <DialogDescription>
            Complete details of your insurance policy
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status and Type */}
          <div className="flex items-center gap-3">
            <Badge variant={policy.isActive ? 'default' : 'secondary'} className="text-sm">
              {policy.isActive ? '✓ Active' : 'Inactive'}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {policyTypeLabels[policy.policyType]}
            </Badge>
            {daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
              <Badge variant="destructive" className="text-sm">
                ⏰ Expires in {daysUntilExpiry} days
              </Badge>
            )}
          </div>

          <Separator />

          {/* Policy Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Policy Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Policy Number</p>
                <p className="font-mono font-medium">
                  {policy.policyNumber || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Policy Type</p>
                <p className="font-medium">{policyTypeLabels[policy.policyType]}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                <p className="text-sm text-muted-foreground mb-1">Coverage Amount</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(policy.amountInsured)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <p className="text-sm text-muted-foreground mb-1">Premium Amount</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {formatCurrency(policy.premiumAmount)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Important Dates
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Valid Till</p>
                <p className="font-medium">{formatDate(policy.validTill)}</p>
                {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {daysUntilExpiry} days remaining
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Premium Due Date</p>
                <p className="font-medium">{formatDate(policy.premiumDueDate)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Nominee */}
          {policy.nominee && (
            <>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Nominee
                </h3>
                <p className="font-medium">{policy.nominee}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Policy Document */}
          {policy.documentUrl && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Policy Document
                </h3>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a
                    href={policy.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Policy Document
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
              <Separator />
            </>
          )}

          {/* Remarks */}
          {policy.remarks && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Additional Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {policy.remarks}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <p>Created: {formatDate(policy.createdAt)}</p>
              </div>
              <div>
                <p>Last Updated: {formatDate(policy.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
