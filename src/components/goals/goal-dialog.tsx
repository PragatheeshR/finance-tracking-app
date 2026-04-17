'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAddGoal, useUpdateGoal } from '@/hooks/use-goals'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const goalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum([
    'EMERGENCY_FUND',
    'VACATION',
    'HOUSE',
    'CAR',
    'EDUCATION',
    'RETIREMENT',
    'WEDDING',
    'INVESTMENT',
    'DEBT_PAYOFF',
    'OTHER',
  ]),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount must be non-negative').optional(),
  deadline: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  monthlyTarget: z.number().positive().optional(),
  color: z.string().optional(),
})

type GoalFormData = z.infer<typeof goalSchema>

interface GoalDialogProps {
  open: boolean
  onClose: () => void
  goal?: any
}

const CATEGORIES = [
  { value: 'EMERGENCY_FUND', label: 'Emergency Fund' },
  { value: 'VACATION', label: 'Vacation' },
  { value: 'HOUSE', label: 'House' },
  { value: 'CAR', label: 'Car' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'RETIREMENT', label: 'Retirement' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'DEBT_PAYOFF', label: 'Debt Payoff' },
  { value: 'OTHER', label: 'Other' },
]

const PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
]

export function GoalDialog({ open, onClose, goal }: GoalDialogProps) {
  const addGoal = useAddGoal()
  const updateGoal = useUpdateGoal()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      category: 'OTHER',
      priority: 'MEDIUM',
      currentAmount: 0,
    },
  })

  const category = watch('category')
  const priority = watch('priority')

  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name,
        description: goal.description || '',
        category: goal.category,
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount) || 0,
        deadline: goal.deadline
          ? new Date(goal.deadline).toISOString().split('T')[0]
          : '',
        priority: goal.priority || 'MEDIUM',
        monthlyTarget: goal.monthlyTarget ? Number(goal.monthlyTarget) : undefined,
        color: goal.color || '',
      })
    } else {
      reset({
        category: 'OTHER',
        priority: 'MEDIUM',
        currentAmount: 0,
      })
    }
  }, [goal, reset])

  const onSubmit = async (data: GoalFormData) => {
    try {
      if (goal) {
        await updateGoal.mutateAsync({
          id: goal.id,
          data: {
            ...data,
            deadline: data.deadline || undefined,
          },
        })
      } else {
        await addGoal.mutateAsync({
          ...data,
          deadline: data.deadline || undefined,
        })
      }
      onClose()
    } catch (error) {
      console.error('Failed to save goal:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Goal Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Emergency Fund"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={(value) => setValue('category', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetAmount">Target Amount *</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                {...register('targetAmount', { valueAsNumber: true })}
                placeholder="100000"
              />
              {errors.targetAmount && (
                <p className="text-sm text-destructive mt-1">
                  {errors.targetAmount.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="currentAmount">Current Amount</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                {...register('currentAmount', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.currentAmount && (
                <p className="text-sm text-destructive mt-1">
                  {errors.currentAmount.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" {...register('deadline')} />
            </div>

            <div>
              <Label htmlFor="monthlyTarget">Monthly Target</Label>
              <Input
                id="monthlyTarget"
                type="number"
                step="0.01"
                {...register('monthlyTarget', { valueAsNumber: true })}
                placeholder="5000"
              />
            </div>

            <div>
              <Label htmlFor="color">Color (Hex)</Label>
              <Input
                id="color"
                {...register('color')}
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addGoal.isPending || updateGoal.isPending}
            >
              {addGoal.isPending || updateGoal.isPending
                ? 'Saving...'
                : goal
                  ? 'Update Goal'
                  : 'Add Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
