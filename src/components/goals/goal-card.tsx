'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Edit,
  Trash2,
  PlusCircle,
  MinusCircle,
  Target,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { useDeleteGoal, useContributeToGoal } from '@/hooks/use-goals'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface GoalCardProps {
  goal: any
  onEdit: (goal: any) => void
}

const CATEGORY_LABELS: Record<string, string> = {
  EMERGENCY_FUND: 'Emergency Fund',
  VACATION: 'Vacation',
  HOUSE: 'House',
  CAR: 'Car',
  EDUCATION: 'Education',
  RETIREMENT: 'Retirement',
  WEDDING: 'Wedding',
  INVESTMENT: 'Investment',
  DEBT_PAYOFF: 'Debt Payoff',
  OTHER: 'Other',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const deleteGoal = useDeleteGoal()
  const contribute = useContributeToGoal()
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false)
  const [contributeAmount, setContributeAmount] = useState('')
  const [contributeType, setContributeType] = useState<'contribute' | 'withdraw'>(
    'contribute'
  )

  const progress =
    (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
  const remaining = Number(goal.targetAmount) - Number(goal.currentAmount)

  const daysRemaining = goal.deadline
    ? Math.ceil(
        (new Date(goal.deadline).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal.mutateAsync(goal.id)
    }
  }

  const handleContribute = () => {
    setContributeType('contribute')
    setContributeDialogOpen(true)
  }

  const handleWithdraw = () => {
    setContributeType('withdraw')
    setContributeDialogOpen(true)
  }

  const handleSubmitContribution = async () => {
    const amount = parseFloat(contributeAmount)
    if (isNaN(amount) || amount <= 0) return

    await contribute.mutateAsync({
      goalId: goal.id,
      amount,
      type: contributeType,
    })

    setContributeDialogOpen(false)
    setContributeAmount('')
  }

  return (
    <>
      <Card
        className="hover:shadow-lg transition-shadow"
        style={{ borderTop: `3px solid ${goal.color || '#3b82f6'}` }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">{goal.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {CATEGORY_LABELS[goal.category]}
                </Badge>
                <Badge
                  className={`text-xs ${PRIORITY_COLORS[goal.priority]}`}
                >
                  {goal.priority}
                </Badge>
                {goal.status === 'COMPLETED' && (
                  <Badge className="text-xs bg-green-500">Completed</Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(goal)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleContribute}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Contribution
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleWithdraw}>
                  <MinusCircle className="h-4 w-4 mr-2" />
                  Withdraw
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {goal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {goal.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(100, progress)} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>Target</span>
              </div>
              <p className="font-semibold">
                ₹{Number(goal.targetAmount).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Saved</span>
              </div>
              <p className="font-semibold">
                ₹{Number(goal.currentAmount).toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>Remaining</span>
            </div>
            <p className="font-semibold text-lg">
              ₹{remaining.toLocaleString('en-IN')}
            </p>
          </div>

          {daysRemaining !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span
                className={
                  daysRemaining < 0
                    ? 'text-destructive'
                    : daysRemaining < 30
                      ? 'text-orange-500'
                      : 'text-muted-foreground'
                }
              >
                {daysRemaining < 0
                  ? `${Math.abs(daysRemaining)} days overdue`
                  : `${daysRemaining} days remaining`}
              </span>
            </div>
          )}

          {goal.monthlyTarget && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              Monthly Target: ₹
              {Number(goal.monthlyTarget).toLocaleString('en-IN')}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={contributeDialogOpen} onOpenChange={setContributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {contributeType === 'contribute'
                ? 'Add Contribution'
                : 'Withdraw from Goal'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setContributeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitContribution}
                disabled={contribute.isPending}
              >
                {contribute.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
