import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const API_BASE = '/api/v1/recurring-expenses'
const USER_ID = 'test-user-001'

export function useRecurringExpenses(filters?: {
  isActive?: boolean
  bucketType?: string
}) {
  const params = new URLSearchParams()
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
  if (filters?.bucketType) params.append('bucketType', filters.bucketType)

  return useQuery({
    queryKey: ['recurring-expenses', filters],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}?${params}`, {
        headers: { 'x-user-id': USER_ID },
      })
      if (!res.ok) throw new Error('Failed to fetch recurring expenses')
      const data = await res.json()
      return data.data.recurringExpenses
    },
  })
}

export function useRecurringExpense(id: string) {
  return useQuery({
    queryKey: ['recurring-expense', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${id}`, {
        headers: { 'x-user-id': USER_ID },
      })
      if (!res.ok) throw new Error('Failed to fetch recurring expense')
      const data = await res.json()
      return data.data
    },
    enabled: !!id,
  })
}

export function useAddRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID,
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add recurring expense')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] })
      toast.success('Recurring expense added successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add recurring expense')
    },
  })
}

export function useUpdateRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID,
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update recurring expense')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] })
      toast.success('Recurring expense updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update recurring expense')
    },
  })
}

export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': USER_ID },
      })
      if (!res.ok) throw new Error('Failed to delete recurring expense')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] })
      toast.success('Recurring expense deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete recurring expense')
    },
  })
}

export function useUpcomingRecurring() {
  return useQuery({
    queryKey: ['recurring-expenses', 'upcoming'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/upcoming`, {
        headers: { 'x-user-id': USER_ID },
      })
      if (!res.ok) throw new Error('Failed to fetch upcoming recurring expenses')
      const data = await res.json()
      return data.data.upcoming
    },
  })
}

export function useGenerateRecurringExpenses() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_CRON_API_KEY || 'dev-key-123',
        },
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error?.message || 'Failed to generate recurring expenses')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] })

      if (data.data.count === 0) {
        toast.info('No recurring expenses due today')
      } else {
        toast.success(`Generated ${data.data.count} recurring expense(s)`)
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate recurring expenses')
    },
  })
}
