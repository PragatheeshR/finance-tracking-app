import { Decimal } from '@prisma/client/runtime/library'

// Portfolio Types
export interface HoldingWithCategory {
  id: string
  name: string
  symbol: string | null
  subCategory: string | null
  units: Decimal
  unitPrice: Decimal
  investedAmount: Decimal
  currentAmount: Decimal
  profitLoss: Decimal
  profitLossPercentage: number
  allocationPct: Decimal
  purchaseDate: Date | null
  lastPriceUpdate: Date | null
  category: {
    id: string
    name: string
    displayName: string
    type: string
    icon: string | null
    color: string | null
  }
}

export interface PortfolioSummary {
  totalNetworth: number
  totalCurrent: number
  totalInvested: number
  totalProfitLoss: number
  profitLossPercentage: number
  totalReturnPercentage: number
  totalHoldings: number
  isEmpty: boolean
  allocationByCategory: AllocationComparison[]
}

export interface AllocationComparison {
  categoryName: string
  categoryDisplayName: string
  currentAmount: number
  currentAllocation: number
  idealAllocation: number
  difference: number
  differenceAmount: number
}

export interface RebalanceSuggestion {
  category: string
  action: 'BUY' | 'SELL' | 'HOLD'
  currentAllocation: number
  idealAllocation: number
  amount: number
}

// Expense Types
export interface ExpenseSummary {
  totalAmount: number
  fixedTotal: number
  variableTotal: number
  irregularTotal: number
  byCategory: Record<string, number>
  count: number
}

export interface ExpenseWithDetails {
  id: string
  date: Date
  bucketType: 'FIXED' | 'VARIABLE' | 'IRREGULAR'
  category: string
  description: string
  amount: Decimal
  tags: string[]
  receiptUrl: string | null
  isRecurring: boolean
}

// Budget Types
export interface BudgetItemWithStatus {
  id: string
  category: string
  monthlyAmount: Decimal
  spent: number
  remaining: number
  percentageUsed: number
  status: 'UNDER' | 'NEAR' | 'OVER'
}

export interface BudgetOverview {
  totalBudget: number
  totalSpent: number
  remaining: number
  percentageUsed: number
  fireNumber: number
  items: BudgetItemWithStatus[]
}

// Snapshot Types
export interface SnapshotData {
  categories: {
    name: string
    displayName: string
    amount: number
  }[]
}

export interface SnapshotWithGrowth {
  id: string
  snapshotDate: Date
  totalNetworth: Decimal
  snapshotData: SnapshotData
  notes: string | null
  growthAmount?: number
  growthPercentage?: number
}

// Analytics Types
export interface NetworthTrend {
  date: string
  networth: number
  growth: number
  growthPercentage: number
}

export interface ExpenseBreakdown {
  byCategory: Record<string, number>
  byBucketType: {
    FIXED: number
    VARIABLE: number
    IRREGULAR: number
  }
  monthlyTrend: {
    month: string
    amount: number
  }[]
}
