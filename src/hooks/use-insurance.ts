import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const API_BASE = '/api/v1/insurance'
const USER_ID = 'test-user-001'

interface InsurancePolicy {
  id: string
  userId: string
  policyName: string
  policyType: 'HEALTH' | 'LIFE' | 'CAR' | 'BIKE' | 'OTHER'
  policyNumber?: string
  validTill?: string
  premiumAmount?: number
  premiumDueDate?: string
  amountInsured?: number
  nominee?: string
  remarks?: string
  documentUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Fetch all insurance policies
 */
export function useInsurance(filters?: {
  policyType?: string
  isActive?: boolean
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: ['insurance', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.policyType) params.append('policyType', filters.policyType)
      if (filters?.isActive !== undefined)
        params.append('isActive', filters.isActive.toString())
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`${API_BASE}?${params.toString()}`, {
        headers: { 'x-user-id': USER_ID },
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch policies')
      }
      return data.data
    },
  })
}

/**
 * Fetch insurance summary
 */
export function useInsuranceSummary() {
  return useQuery({
    queryKey: ['insurance', 'summary'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/summary`, {
        headers: { 'x-user-id': USER_ID },
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch summary')
      }
      return data.data
    },
  })
}

/**
 * Add new insurance policy
 */
export function useAddInsurance() {
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
        throw new Error(result.error?.message || 'Failed to add policy')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] })
      toast.success('Insurance policy added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add policy')
    },
  })
}

/**
 * Update insurance policy
 */
export function useUpdateInsurance() {
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
        throw new Error(result.error?.message || 'Failed to update policy')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] })
      toast.success('Insurance policy updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update policy')
    },
  })
}

/**
 * Delete insurance policy
 */
export function useDeleteInsurance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': USER_ID },
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to delete policy')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] })
      toast.success('Insurance policy deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete policy')
    },
  })
}
