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
import { useAddExpense, useUpdateExpense } from '@/hooks/use-expenses'
import { Loader2 } from 'lucide-react'

const expenseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  bucketType: z.enum(['FIXED', 'VARIABLE', 'IRREGULAR'], {
    required_error: 'Bucket type is required',
  }),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.string().min(1, 'Amount is required'),
  tags: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: any
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
}: ExpenseDialogProps) {
  const isEditMode = !!expense
  const { data: categoriesData, isLoading: categoriesLoading } = useExpenseCategories()
  const categories = categoriesData?.categories || []
  const addExpense = useAddExpense()
  const updateExpense = useUpdateExpense()

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      bucketType: 'VARIABLE',
      category: '',
      description: '',
      amount: '',
      tags: '',
      isRecurring: false,
    },
  })

  useEffect(() => {
    if (open && expense) {
      form.reset({
        date: expense.date
          ? new Date(expense.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        bucketType: expense.bucketType,
        category: expense.category,
        description: expense.description,
        amount: expense.amount.toString(),
        tags: expense.tags?.join(', ') || '',
        isRecurring: expense.isRecurring || false,
      })
    } else if (open && !expense) {
      form.reset({
        date: new Date().toISOString().split('T')[0],
        bucketType: 'VARIABLE',
        category: '',
        description: '',
        amount: '',
        tags: '',
        isRecurring: false,
      })
    }
  }, [open, expense, form])

  const onSubmit = async (data: ExpenseFormData) => {
    const payload = {
      date: new Date(data.date).toISOString(),
      bucketType: data.bucketType,
      category: data.category,
      description: data.description,
      amount: parseFloat(data.amount),
      tags: data.tags
        ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      isRecurring: data.isRecurring || false,
    }

    try {
      if (isEditMode) {
        await updateExpense.mutateAsync({ id: expense.id, data: payload })
      } else {
        await addExpense.mutateAsync(payload)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Failed to save expense:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details of your expense'
              : 'Record a new expense transaction'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bucket Type */}
              <FormField
                control={form.control}
                name="bucketType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bucket Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FIXED">Fixed</SelectItem>
                        <SelectItem value="VARIABLE">Variable</SelectItem>
                        <SelectItem value="IRREGULAR">Irregular</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                          categories?.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.displayName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Grocery shopping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., food, monthly, essential" {...field} />
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
                disabled={addExpense.isPending || updateExpense.isPending}
              >
                {addExpense.isPending || updateExpense.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Update'
                ) : (
                  'Add Expense'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
