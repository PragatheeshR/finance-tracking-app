import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const API_BASE = '/api/v1/settings'

interface UserSettings {
  id: string
  userId: string
  currency: string
  timezone: string
  dateFormat: string
  fireNumber: number
  fireMultiplier: number
  theme: string
  notifications: any
  onboardingComplete: boolean
  showEmptyStates: boolean
  createdAt: string
  updatedAt: string
}

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
}

/**
 * Fetch user settings
 */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<UserSettings> => {
      const response = await fetch(API_BASE, {
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch settings')
      }
      return data.data
    },
  })
}

/**
 * Update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<UserSettings>) => {
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update settings')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update settings')
    },
  })
}

/**
 * Fetch user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await fetch(`${API_BASE}/profile`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch profile')
      }
      return data.data
    },
  })
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to update profile')
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}

/**
 * Export user data
 */
export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/export`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to export data')
      }
      return data.data
    },
    onSuccess: (data) => {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finance-tracker-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export data')
    },
  })
}
