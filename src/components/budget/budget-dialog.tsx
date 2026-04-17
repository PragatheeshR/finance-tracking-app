'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useExpenseCategories } from '@/hooks/use-categories'
import { useCreateBudget, useUpdateBudget } from '@/hooks/use-budget'
import { Loader2 } from 'lucide-react'

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  monthlyAmount: z.string().min(1, 'Amount is required'),
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
})

type BudgetFormData = z.infer<typeof budgetSchema>

interface BudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget?: any
  currentYear: number
  currentMonth: number
}

export function BudgetDialog({
  open,
  onOpenChange,
  budget,
  currentYear,
  currentMonth,
}: BudgetDialogProps) {
  const isEditMode = !!budget
  const { data: categoriesData, isLoading: categoriesLoading } = useExpenseCategories()
  const categories = (categoriesData as any)?.categories || []
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: '',
      monthlyAmount: '',
      year: currentYear,
      month: currentMonth,
    },
  })

  useEffect(() => {
    if (open && budget) {
      form.reset({
        category: budget.category,
        monthlyAmount: budget.monthlyAmount.toString(),
        year: budget.year,
        month: budget.month,
      })
    } else if (open && !budget) {
      form.reset({
        category: '',
        monthlyAmount: '',
        year: currentYear,
        month: currentMonth,
      })
    }
  }, [open, budget, currentYear, currentMonth, form])

  const onSubmit = async (data: BudgetFormData) => {
    const payload = {
      category: data.category,
      monthlyAmount: parseFloat(data.monthlyAmount),
      year: data.year,
      month: data.month,
    }

    try {
      if (isEditMode) {
        await updateBudget.mutateAsync({ id: budget.id, data: payload })
      } else {
        await createBudget.mutateAsync(payload)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Failed to save budget:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Budget' : 'Add New Budget'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the budget amount for this category'
              : 'Set a monthly budget for a category'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={isEditMode}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.icon} {cat.displayName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monthly Amount */}
            <FormField
              control={form.control}
              name="monthlyAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Budget (₹) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="10000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBudget.isPending || updateBudget.isPending}
              >
                {createBudget.isPending || updateBudget.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Update'
                ) : (
                  'Add Budget'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
