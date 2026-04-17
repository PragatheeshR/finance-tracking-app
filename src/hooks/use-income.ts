import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const API_BASE = '/api/v1/income'
const USER_ID = 'test-user-001'

interface Income {
  id: string
  date: string
  source: string
  category: string
  description: string
  amount: number
  tags: string[]
  isRecurring: boolean
  createdAt: string
  updatedAt: string
}

interface IncomeSummary {
  totalIncome: number
  bySource: Record<string, number>
  count: number
}

interface IncomeResponse {
  income: Income[]
  summary: IncomeSummary
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

/**
 * Fetch income with filters
 */
export function useIncome(params?: {
  startDate?: string
  endDate?: string
  source?: string
  category?: string
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: ['income', params],
    queryFn: async (): Promise<IncomeResponse> => {
      const queryParams = new URLSearchParams()
      if (params?.startDate) queryParams.append('startDate', params.startDate)
      if (params?.endDate) queryParams.append('endDate', params.endDate)
      if (params?.source) queryParams.append('source', params.source)
      if (params?.category) queryParams.append('category', params.category)
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

      const response = await fetch(
        `${API_BASE}?${queryParams.toString()}`,
        { headers: { 'x-user-id': USER_ID } }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch income')
      }
      return data.data
    },
  })
}

/**
 * Fetch income vs expense comparison
 */
export function useIncomeVsExpense(year: number, month: number) {
  return useQuery({
    queryKey: ['income', 'vs-expense', year, month],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/vs-expense?year=${year}&month=${month}`,
        { headers: { 'x-user-id': USER_ID } }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch comparison')
      }
      return data.data
    },
  })
}

/**
 * Add new income
 */
export function useAddIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
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
        throw new Error(result.error?.message || 'Failed to add income')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Income added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add income')
    },
  })
}

/**
 * Update income
 */
export function useUpdateIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
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
        throw new Error(result.error?.message || 'Failed to update income')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Income updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update income')
    },
  })
}

/**
 * Delete income
 */
export function useDeleteIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': USER_ID },
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to delete income')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] })
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Income deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete income')
    },
  })
}
