import { Decimal } from '@prisma/client/runtime/library'

/**
 * Convert Prisma Decimal to number
 */
export function decimalToNumber(decimal: Decimal | null | undefined): number {
  if (!decimal) return 0
  return Number(decimal.toString())
}

/**
 * Convert number to Prisma Decimal
 */
export function numberToDecimal(num: number): Decimal {
  return new Decimal(num)
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Calculate profit/loss percentage
 */
export function calculateProfitLossPercentage(
  current: number,
  invested: number
): number {
  if (invested === 0) return 0
  return ((current - invested) / invested) * 100
}

/**
 * Round to 2 decimal places
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100
}
