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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAddExpenseCategory, useUpdateExpenseCategory } from '@/hooks/use-categories'
import { Loader2 } from 'lucide-react'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  displayName: z.string().min(1, 'Display name is required').max(100),
  categoryType: z.enum(['EXPENSE', 'INCOME'], {
    required_error: 'Category type is required',
  }),
  isActive: z.boolean().optional().default(true),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface ExpenseCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: any
}

export function ExpenseCategoryDialog({
  open,
  onOpenChange,
  category,
}: ExpenseCategoryDialogProps) {
  const isEditMode = !!category
  const addCategory = useAddExpenseCategory()
  const updateCategory = useUpdateExpenseCategory()

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      displayName: '',
      categoryType: 'EXPENSE',
      isActive: true,
    },
  })

  useEffect(() => {
    if (open && category) {
      form.reset({
        name: category.name,
        displayName: category.displayName,
        categoryType: category.categoryType,
        isActive: category.isActive ?? true,
      })
    } else if (open && !category) {
      form.reset({
        name: '',
        displayName: '',
        categoryType: 'EXPENSE',
        isActive: true,
      })
    }
  }, [open, category, form])

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEditMode) {
        await updateCategory.mutateAsync({ id: category.id, data })
      } else {
        await addCategory.mutateAsync(data)
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Failed to save category:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the category details'
              : 'Create a new expense or income category'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name (Internal) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., GROCERIES"
                      {...field}
                      className="uppercase"
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/\s+/g, '_')
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Name */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries & Food" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Type */}
            <FormField
              control={form.control}
              name="categoryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Type *</FormLabel>
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
                      <SelectItem value="EXPENSE">Expense Category</SelectItem>
                      <SelectItem value="INCOME">Income Category</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this category for use in transactions
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
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
                disabled={addCategory.isPending || updateCategory.isPending}
              >
                {addCategory.isPending || updateCategory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  'Update Category'
                ) : (
                  'Add Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
