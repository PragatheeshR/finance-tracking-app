import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expenseAPI } from '@/lib/api/client'
import { toast } from 'sonner'

/**
 * Get expenses with filters
 */
export function useExpenses(params?: {
  startDate?: string
  endDate?: string
  bucketType?: string
  category?: string
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expenseAPI.getExpenses(params),
  })
}

/**
 * Add a new expense
 */
export function useAddExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => expenseAPI.addExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Expense added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add expense')
    },
  })
}

/**
 * Update an expense
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      expenseAPI.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Expense updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update expense')
    },
  })
}

/**
 * Delete an expense
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => expenseAPI.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Expense deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete expense')
    },
  })
}

/**
 * Bulk import expenses
 */
export function useBulkImportExpenses() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (expenses: any[]) => expenseAPI.bulkImport(expenses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Expenses imported successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to import expenses')
    },
  })
}
