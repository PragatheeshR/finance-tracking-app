import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryAPI } from '@/lib/api/client'
import { toast } from 'sonner'

/**
 * Get expense categories
 */
export function useExpenseCategories() {
  return useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: () => categoryAPI.getExpenseCategories(),
  })
}

/**
 * Get asset categories for portfolio
 */
export function useAssetCategories() {
  return useQuery({
    queryKey: ['categories', 'asset'],
    queryFn: async () => {
      const response = await fetch('/api/v1/categories/asset', {
        credentials: 'include', // Include cookies for session
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch asset categories')
      }
      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  })
}

/**
 * Add a new expense category
 */
export function useAddExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => categoryAPI.addExpenseCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add category')
    },
  })
}

/**
 * Update an expense category
 */
export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      categoryAPI.updateExpenseCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update category')
    },
  })
}

/**
 * Delete an expense category
 */
export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoryAPI.deleteExpenseCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category')
    },
  })
}
