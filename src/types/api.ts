// API Response Types
export interface ApiResponse<T = any> {
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

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

// Common Types
export type { User, UserSettings } from '@prisma/client'
export type { Holding, Snapshot, Expense, BudgetItem } from '@prisma/client'
export type { InsurancePolicy, AssetCategory, AllocationTemplate } from '@prisma/client'
