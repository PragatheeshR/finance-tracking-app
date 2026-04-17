import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { portfolioAPI } from '@/lib/api/client'
import { toast } from 'sonner'

/**
 * Get portfolio summary
 */
export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: () => portfolioAPI.getSummary(),
  })
}

/**
 * Get all holdings
 */
export function useHoldings() {
  return useQuery({
    queryKey: ['portfolio', 'holdings'],
    queryFn: async () => {
      const response: any = await portfolioAPI.getHoldings()
      // The API returns { holdings, total }, we need just the holdings array
      return response.holdings || response || []
    },
  })
}

/**
 * Add a new holding
 */
export function useAddHolding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => portfolioAPI.addHolding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      toast.success('Holding added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add holding')
    },
  })
}

/**
 * Update a holding
 */
export function useUpdateHolding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      portfolioAPI.updateHolding(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      toast.success('Holding updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update holding')
    },
  })
}

/**
 * Delete a holding
 */
export function useDeleteHolding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => portfolioAPI.deleteHolding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
      toast.success('Holding deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete holding')
    },
  })
}

/**
 * Get rebalancing suggestions
 */
export function useRebalanceSuggestions() {
  return useQuery({
    queryKey: ['portfolio', 'rebalance'],
    queryFn: () => portfolioAPI.getRebalanceSuggestions(),
  })
}
