/**
 * API Client for Finance Tracker
 * Centralized API calls with TypeScript types
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for session
  })

  const data: ApiResponse<T> = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'API request failed')
  }

  return data.data as T
}

// Portfolio API
export const portfolioAPI = {
  getSummary: () =>
    fetchAPI('/portfolio/summary'),

  getHoldings: () =>
    fetchAPI('/portfolio/holdings'),

  addHolding: (data: any) =>
    fetchAPI('/portfolio/holdings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateHolding: (id: string, data: any) =>
    fetchAPI(`/portfolio/holdings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteHolding: (id: string) =>
    fetchAPI(`/portfolio/holdings/${id}`, {
      method: 'DELETE',
    }),

  getRebalanceSuggestions: () =>
    fetchAPI('/portfolio/rebalance'),
}

// Expense API
export const expenseAPI = {
  getExpenses: (params?: {
    startDate?: string
    endDate?: string
    bucketType?: string
    category?: string
    page?: number
    pageSize?: number
  }) => {
    const queryString = params
      ? '?' + new URLSearchParams(params as any).toString()
      : ''
    return fetchAPI(`/expenses${queryString}`)
  },

  addExpense: (data: any) =>
    fetchAPI('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateExpense: (id: string, data: any) =>
    fetchAPI(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteExpense: (id: string) =>
    fetchAPI(`/expenses/${id}`, {
      method: 'DELETE',
    }),

  bulkImport: (expenses: any[]) =>
    fetchAPI('/expenses/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ expenses }),
    }),
}

// Category API
export const categoryAPI = {
  getExpenseCategories: () =>
    fetchAPI('/categories/expense'),

  addExpenseCategory: (data: any) =>
    fetchAPI('/categories/expense', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateExpenseCategory: (id: string, data: any) =>
    fetchAPI(`/categories/expense/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteExpenseCategory: (id: string) =>
    fetchAPI(`/categories/expense/${id}`, {
      method: 'DELETE',
    }),
}

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () =>
    fetchAPI('/auth/me'),
}
