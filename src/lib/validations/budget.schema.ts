import { z } from 'zod'

// Budget Schemas
export const createBudgetItemSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  monthlyAmount: z.number().positive('Amount must be positive'),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
})

export const createBudgetSchema = z.object({
  budgetItems: z.array(createBudgetItemSchema),
  fireMultiplier: z.number().int().positive().optional().default(28),
})

export const updateBudgetItemSchema = createBudgetItemSchema.partial()

// Onboarding Schemas
export const setupAllocationSchema = z.object({
  templateId: z.string().cuid().optional(),
  allocations: z
    .array(
      z.object({
        categoryId: z.string().cuid(),
        percentage: z.number().min(0).max(1),
      })
    )
    .optional(),
})

export const setupBudgetSchema = z.object({
  budgetItems: z.array(
    z.object({
      category: z.string().min(1),
      monthlyAmount: z.number().positive(),
    })
  ),
  fireMultiplier: z.number().int().positive().optional().default(28),
})

export type CreateBudgetItemInput = z.infer<typeof createBudgetItemSchema>
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetItemInput = z.infer<typeof updateBudgetItemSchema>
export type SetupAllocationInput = z.infer<typeof setupAllocationSchema>
export type SetupBudgetInput = z.infer<typeof setupBudgetSchema>
