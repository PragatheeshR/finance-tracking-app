import { z } from 'zod'

// Expense Schemas
export const createExpenseSchema = z.object({
  date: z.string().datetime('Invalid date format'),
  bucketType: z.enum(['FIXED', 'VARIABLE', 'IRREGULAR']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive('Amount must be positive'),
  tags: z.array(z.string()).optional().default([]),
  receiptUrl: z.string().url().optional(),
  isRecurring: z.boolean().optional().default(false),
  recurringConfig: z
    .object({
      frequency: z.enum(['MONTHLY', 'WEEKLY', 'YEARLY']),
      endDate: z.string().datetime().optional(),
    })
    .optional(),
})

export const updateExpenseSchema = createExpenseSchema.partial()

// Bulk Import Schema
export const bulkImportExpensesSchema = z.object({
  expenses: z.array(createExpenseSchema),
})

// Expense Query Schema
export const expenseQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  bucketType: z.enum(['FIXED', 'VARIABLE', 'IRREGULAR']).optional(),
  category: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
})

// Expense Category Schema
export const createExpenseCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
})

export const updateExpenseCategorySchema = createExpenseCategorySchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type BulkImportExpensesInput = z.infer<typeof bulkImportExpensesSchema>
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>
export type CreateExpenseCategoryInput = z.infer<typeof createExpenseCategorySchema>
export type UpdateExpenseCategoryInput = z.infer<typeof updateExpenseCategorySchema>
