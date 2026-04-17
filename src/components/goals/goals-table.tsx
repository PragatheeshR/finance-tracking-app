'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { useDeleteGoal } from '@/hooks/use-goals'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'

interface GoalsTableProps {
  goals: any[]
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

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  PAUSED: 'bg-yellow-500',
  CANCELLED: 'bg-gray-500',
}

export function GoalsTable({ goals, onEdit }: GoalsTableProps) {
  const deleteGoal = useDeleteGoal()

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal.mutateAsync(id)
    }
  }

  if (!goals || goals.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No goals found</p>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Goal</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Saved</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goals.map((goal) => {
            const progress =
              (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
            const daysRemaining = goal.deadline
              ? Math.ceil(
                  (new Date(goal.deadline).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null

            return (
              <TableRow key={goal.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{goal.name}</div>
                    {goal.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {goal.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {CATEGORY_LABELS[goal.category]}
                  </Badge>
                </TableCell>
                <TableCell>
                  ₹{Number(goal.targetAmount).toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  ₹{Number(goal.currentAmount).toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={Math.min(100, progress)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${
                      goal.priority === 'CRITICAL'
                        ? 'bg-red-500'
                        : goal.priority === 'HIGH'
                          ? 'bg-orange-500'
                          : goal.priority === 'MEDIUM'
                            ? 'bg-blue-500'
                            : 'bg-gray-500'
                    }`}
                  >
                    {goal.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {goal.deadline ? (
                    <div className="text-sm">
                      <div>{new Date(goal.deadline).toLocaleDateString()}</div>
                      {daysRemaining !== null && (
                        <div
                          className={`text-xs ${
                            daysRemaining < 0
                              ? 'text-destructive'
                              : daysRemaining < 30
                                ? 'text-orange-500'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {daysRemaining < 0
                            ? `${Math.abs(daysRemaining)}d overdue`
                            : `${daysRemaining}d left`}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[goal.status]}>
                    {goal.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
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
                      <DropdownMenuItem
                        onClick={() => handleDelete(goal.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
