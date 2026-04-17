import { z } from 'zod'

// Holding Schemas
export const createHoldingSchema = z.object({
  categoryId: z.string().cuid('Invalid category ID'),
  name: z.string().min(1, 'Name is required').max(255),
  symbol: z.string().nullable().optional(),
  subCategory: z.string().nullable().optional(),
  units: z.number().positive('Units must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  investedAmount: z.number().positive('Invested amount must be positive'),
  purchaseDate: z.string().datetime().nullable().optional(),
  remarks: z.string().nullable().optional(),
  autoFetchPrice: z.boolean().optional().default(false),
})

export const updateHoldingSchema = createHoldingSchema.partial()

// Ideal Allocation Schema
export const idealAllocationSchema = z.object({
  allocations: z.array(
    z.object({
      categoryId: z.string().cuid(),
      percentage: z.number().min(0).max(1, 'Percentage must be between 0 and 1'),
    })
  ),
})

// Symbol Search Schema
export const symbolSearchSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  market: z.enum(['NSE', 'BSE', 'NASDAQ', 'ALL']).optional().default('ALL'),
})

export type CreateHoldingInput = z.infer<typeof createHoldingSchema>
export type UpdateHoldingInput = z.infer<typeof updateHoldingSchema>
export type IdealAllocationInput = z.infer<typeof idealAllocationSchema>
export type SymbolSearchInput = z.infer<typeof symbolSearchSchema>
