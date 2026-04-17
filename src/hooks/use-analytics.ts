import { useQuery } from '@tanstack/react-query'

const API_BASE = '/api/v1/analytics'
const USER_ID = 'test-user-001'

/**
 * Get comprehensive analytics for all types
 */
export function useAnalytics(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString()

  return useQuery({
    queryKey: ['analytics', year, month],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}?year=${year}&month=${month}&startDate=${startDate}&endDate=${endDate}`,
        { headers: { 'x-user-id': USER_ID } }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch analytics')
      }
      return data.data
    },
  })
}

/**
 * Get expense trends over time
 */
export function useExpenseTrends(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics', 'trends', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}?type=trends&startDate=${startDate}&endDate=${endDate}`,
        { headers: { 'x-user-id': USER_ID } }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch trends')
      }
      return data.data
    },
  })
}

/**
 * Get category breakdown
 */
export function useCategoryBreakdown(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics', 'categories', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}?type=categories&startDate=${startDate}&endDate=${endDate}`,
        { headers: { 'x-user-id': USER_ID } }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch categories')
      }
      return data.data
    },
  })
}

/**
 * Get budget vs actual comparison
 */
export function useBudgetVsActual(year: number, month: number) {
  return useQuery({
    queryKey: ['analytics', 'budget-vs-actual', year, month],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}?type=budget-vs-actual&year=${year}&month=${month}`,
        { headers: { 'x-user-id': USER_ID } }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch budget comparison')
      }
      return data.data
    },
  })
}

/**
 * Get top spending categories
 */
export function useTopCategories(startDate: string, endDate: string, limit: number = 5) {
  return useQuery({
    queryKey: ['analytics', 'top-categories', startDate, endDate, limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}?type=top-categories&startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
        { headers: { 'x-user-id': USER_ID } }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch top categories')
      }
      return data.data
    },
  })
}

/**
 * Get expense statistics
 */
export function useExpenseStats(year: number, month: number) {
  return useQuery({
    queryKey: ['analytics', 'stats', year, month],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}?type=stats&year=${year}&month=${month}`,
        { headers: { 'x-user-id': USER_ID } }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch stats')
      }
      return data.data
    },
  })
}

/**
 * Get daily spending pattern
 */
export function useDailySpending(year: number, month: number) {
  return useQuery({
    queryKey: ['analytics', 'daily', year, month],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}?type=daily&year=${year}&month=${month}`,
        { headers: { 'x-user-id': USER_ID } }
      )
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch daily spending')
      }
      return data.data
    },
  })
}
