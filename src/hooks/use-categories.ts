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
      // For now, we'll fetch via a direct API call
      // This can be optimized later with a dedicated endpoint
      const response = await fetch('/api/v1/categories/asset', {
        headers: {
          'x-user-id': 'test-user-001',
        },
      })
      const data = await response.json()
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
    mutationFn: async (data: any) => {
      const response = await fetch('/api/v1/categories/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-001',
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to add category')
      }
      return result.data
    },
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
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/v1/categories/expense/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user-001',
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update category')
      }
      return result.data
    },
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
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/categories/expense/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': 'test-user-001',
        },
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to delete category')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete category')
    },
  })
}
