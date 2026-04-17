import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const API_BASE = '/api/v1/goals'
const USER_ID = 'test-user-001'

export function useGoals(filters?: {
  status?: string
  category?: string
  isActive?: boolean
}) {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.category) params.append('category', filters.category)
  if (filters?.isActive !== undefined)
    params.append('isActive', String(filters.isActive))

  return useQuery({
    queryKey: ['goals', filters],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}?${params}`, {
        headers: { 'x-user-id': USER_ID },
      })
      if (!res.ok) throw new Error('Failed to fetch goals')
      const data = await res.json()
      return data.data.goals
    },
  })
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goal', id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/${id}`, {
        headers: { 'x-user-id': USER_ID },
      })
      if (!res.ok) throw new Error('Failed to fetch goal')
      const data = await res.json()
      return data.data
    },
    enabled: !!id,
  })
}

export function useGoalsSummary() {
  return useQuery({
    queryKey: ['goals', 'summary'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/summary`, {
        headers: { 'x-user-id': USER_ID },
      })
      if (!res.ok) throw new Error('Failed to fetch goals summary')
      const data = await res.json()
      return data.data
    },
  })
}

export function useAddGoal() {
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
      if (!res.ok) throw new Error('Failed to add goal')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal added successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add goal')
    },
  })
}

export function useUpdateGoal() {
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
      if (!res.ok) throw new Error('Failed to update goal')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update goal')
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': USER_ID },
      })
      if (!res.ok) throw new Error('Failed to delete goal')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete goal')
    },
  })
}

export function useContributeToGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      amount,
      type,
    }: {
      goalId: string
      amount: number
      type: 'contribute' | 'withdraw'
    }) => {
      const res = await fetch(`${API_BASE}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': USER_ID,
        },
        body: JSON.stringify({ goalId, amount, type }),
      })
      if (!res.ok) throw new Error('Failed to update goal')
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['goal', variables.goalId] })
      toast.success(
        variables.type === 'contribute'
          ? 'Contribution added successfully'
          : 'Withdrawal recorded successfully'
      )
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update goal')
    },
  })
}
