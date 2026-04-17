import { z } from 'zod'

/**
 * Income source enum
 */
export const incomeSourceEnum = z.enum([
  'SALARY',
  'BUSINESS',
  'INVESTMENT',
  'FREELANCE',
  'RENTAL',
  'GIFT',
  'OTHER',
])

/**
 * Create income schema
 */
export const createIncomeSchema = z.object({
  date: z.string().datetime(),
  source: incomeSourceEnum,
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive('Amount must be positive'),
  tags: z.array(z.string()).optional().default([]),
  isRecurring: z.boolean().optional().default(false),
})

/**
 * Update income schema
 */
export const updateIncomeSchema = z.object({
  date: z.string().datetime().optional(),
  source: incomeSourceEnum.optional(),
  category: z.string().min(1).optional(),
  description: z.string().min(1).max(500).optional(),
  amount: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
})

/**
 * Create recurring income schema
 */
export const createRecurringIncomeSchema = z.object({
  source: incomeSourceEnum,
  category: z.string().min(1),
  description: z.string().min(1).max(500),
  amount: z.number().positive(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
})

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>
export type CreateRecurringIncomeInput = z.infer<typeof createRecurringIncomeSchema>
