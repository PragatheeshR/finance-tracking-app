import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const API_BASE = '/api/v1/budget'
const USER_ID = 'test-user-001'

interface BudgetItem {
  id: string
  category: string
  monthlyAmount: number
  spent: number
  remaining: number
  percentUsed: number
  year: number
  month: number
  isActive: boolean
}

interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  percentUsed: number
}

interface BudgetsResponse {
  budgets: BudgetItem[]
  summary: BudgetSummary
}

/**
 * Fetch budgets for a specific month
 */
export function useBudgets(year: number, month: number) {
  return useQuery({
    queryKey: ['budgets', year, month],
    queryFn: async (): Promise<BudgetsResponse> => {
      const response = await fetch(
        `${API_BASE}?year=${year}&month=${month}`,
        {
          headers: { 'x-user-id': USER_ID },
        }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch budgets')
      }
      return data.data
    },
  })
}

/**
 * Create a new budget
 */
export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      category: string
      monthlyAmount: number
      year: number
      month: number
    }) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID,
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to create budget')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budget')
    },
  })
}

/**
 * Update a budget
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<{
        category: string
        monthlyAmount: number
        year: number
        month: number
        isActive: boolean
      }>
    }) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID,
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update budget')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update budget')
    },
  })
}

/**
 * Delete a budget
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': USER_ID },
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to delete budget')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete budget')
    },
  })
}

/**
 * Bulk create budgets
 */
export function useBulkCreateBudgets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      year: number
      month: number
      budgets: Array<{ category: string; monthlyAmount: number }>
    }) => {
      const response = await fetch(`${API_BASE}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID,
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to create budgets')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budgets created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create budgets')
    },
  })
}

/**
 * Copy budgets from one month to another
 */
export function useCopyBudgets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      fromYear: number
      fromMonth: number
      toYear: number
      toMonth: number
    }) => {
      const response = await fetch(`${API_BASE}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID,
        },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to copy budgets')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budgets copied successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to copy budgets')
    },
  })
}
