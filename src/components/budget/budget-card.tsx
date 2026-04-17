'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useDeleteBudget } from '@/hooks/use-budget'

interface BudgetCardProps {
  budget: {
    id: string
    category: string
    monthlyAmount: number
    spent: number
    remaining: number
    percentUsed: number
  }
  onEdit: (budget: any) => void
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteBudget = useDeleteBudget()

  const handleDelete = async () => {
    await deleteBudget.mutateAsync(budget.id)
    setDeleteDialogOpen(false)
  }

  const getStatusColor = (percentUsed: number) => {
    if (percentUsed >= 100) return 'text-red-600'
    if (percentUsed >= 80) return 'text-orange-600'
    if (percentUsed >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 100) return 'bg-red-600'
    if (percentUsed >= 80) return 'bg-orange-500'
    if (percentUsed >= 60) return 'bg-yellow-500'
    return 'bg-green-600'
  }

  const isOverBudget = budget.percentUsed >= 100
  const isWarning = budget.percentUsed >= 80 && budget.percentUsed < 100

  return (
    <>
      <Card className={isOverBudget ? 'border-red-500' : isWarning ? 'border-orange-500' : ''}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
            {budget.category.replace('_', ' ')}
            {isOverBudget && <AlertTriangle className="h-4 w-4 text-red-600" />}
            {isWarning && <AlertTriangle className="h-4 w-4 text-orange-600" />}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(budget)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Budget Amount */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Budget</span>
              <span className="text-sm font-semibold">
                ₹{budget.monthlyAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Spent Amount */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Spent</span>
              <span className={`text-sm font-semibold ${getStatusColor(budget.percentUsed)}`}>
                ₹{budget.spent.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Remaining Amount */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Remaining</span>
              <span className={`text-sm font-semibold ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{Math.abs(budget.remaining).toLocaleString('en-IN')}
                {budget.remaining < 0 && ' over'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className={`text-xs font-medium ${getStatusColor(budget.percentUsed)}`}>
                  {budget.percentUsed.toFixed(0)}%
                </span>
              </div>
              <Progress
                value={Math.min(budget.percentUsed, 100)}
                className={`h-2 ${getProgressColor(budget.percentUsed)}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the budget for "
              <span className="font-semibold capitalize">{budget.category.replace('_', ' ')}</span>
              "? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
