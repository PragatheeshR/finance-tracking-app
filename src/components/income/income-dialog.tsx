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
import { useAddIncome, useUpdateIncome } from '@/hooks/use-income'
import { Loader2 } from 'lucide-react'

const incomeSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  source: z.enum(['SALARY', 'BUSINESS', 'INVESTMENT', 'FREELANCE', 'RENTAL', 'GIFT', 'OTHER'], {
    required_error: 'Income source is required',
  }),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.string().min(1, 'Amount is required'),
  tags: z.string().optional(),
})

type IncomeFormData = z.infer<typeof incomeSchema>

interface IncomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  income?: any
}

const INCOME_SOURCES = [
  { value: 'SALARY', label: '💼 Salary', description: 'Regular employment income' },
  { value: 'BUSINESS', label: '🏢 Business', description: 'Business profits' },
  { value: 'INVESTMENT', label: '📈 Investment', description: 'Dividends, interest, capital gains' },
  { value: 'FREELANCE', label: '💻 Freelance', description: 'Freelance/contract work' },
  { value: 'RENTAL', label: '🏠 Rental', description: 'Rental property income' },
  { value: 'GIFT', label: '🎁 Gift', description: 'Gifts and bonuses' },
  { value: 'OTHER', label: '📝 Other', description: 'Other income sources' },
]

export function IncomeDialog({ open, onOpenChange, income }: IncomeDialogProps) {
  const isEditMode = !!income
  const addIncome = useAddIncome()
  const updateIncome = useUpdateIncome()

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      source: 'SALARY',
      category: '',
      description: '',
      amount: '',
      tags: '',
    },
  })

  useEffect(() => {
    if (open && income) {
      form.reset({
        date: income.date
          ? new Date(income.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        source: income.source,
        category: income.category,
        description: income.description,
        amount: income.amount.toString(),
        tags: income.tags?.join(', ') || '',
      })
    } else if (open && !income) {
      form.reset({
        date: new Date().toISOString().split('T')[0],
        source: 'SALARY',
        category: '',
        description: '',
        amount: '',
        tags: '',
      })
    }
  }, [open, income, form])

  const onSubmit = async (data: IncomeFormData) => {
    const payload = {
      date: new Date(data.date).toISOString(),
      source: data.source,
      category: data.category,
      description: data.description,
      amount: parseFloat(data.amount),
      tags: data.tags
        ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      isRecurring: false,
    }

    try {
      if (isEditMode) {
        await updateIncome.mutateAsync({ id: income.id, data: payload })
      } else {
        await addIncome.mutateAsync(payload)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Failed to save income:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Income' : 'Add New Income'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details of your income'
              : 'Record a new income transaction'}
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

              {/* Income Source */}
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Source *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INCOME_SOURCES.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            <div>
                              <div>{source.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {source.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
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
                    <FormControl>
                      <Input placeholder="e.g., Monthly Salary" {...field} />
                    </FormControl>
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
                        placeholder="50000"
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
                    <Input placeholder="e.g., April 2026 Salary" {...field} />
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
                    <Input placeholder="e.g., salary, monthly, regular" {...field} />
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
                disabled={addIncome.isPending || updateIncome.isPending}
              >
                {addIncome.isPending || updateIncome.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Update'
                ) : (
                  'Add Income'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
