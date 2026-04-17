import { prisma } from '@/lib/prisma'
import { PolicyType, Prisma } from '@prisma/client'

export class InsuranceService {
  /**
   * Get all insurance policies for a user with filters
   */
  async getPolicies(
    userId: string,
    filters?: {
      policyType?: PolicyType
      isActive?: boolean
      startDate?: Date
      endDate?: Date
    }
  ) {
    const where: Prisma.InsurancePolicyWhereInput = {
      userId,
      ...(filters?.policyType && { policyType: filters.policyType }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters?.startDate &&
        filters?.endDate && {
          validTill: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        }),
    }

    const policies = await prisma.insurancePolicy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return policies
  }

  /**
   * Get insurance policy by ID
   */
  async getPolicyById(userId: string, policyId: string) {
    const policy = await prisma.insurancePolicy.findFirst({
      where: {
        id: policyId,
        userId,
      },
    })

    if (!policy) {
      throw new Error('Insurance policy not found')
    }

    return policy
  }

  /**
   * Get insurance summary and statistics
   */
  async getInsuranceSummary(userId: string) {
    const policies = await prisma.insurancePolicy.findMany({
      where: { userId, isActive: true },
    })

    const summary = {
      totalPolicies: policies.length,
      activePolicies: policies.filter((p) => p.isActive).length,
      totalCoverage: policies.reduce(
        (sum, p) => sum + (p.amountInsured ? Number(p.amountInsured) : 0),
        0
      ),
      totalAnnualPremium: policies.reduce(
        (sum, p) => sum + (p.premiumAmount ? Number(p.premiumAmount) : 0),
        0
      ),
      byType: {} as Record<PolicyType, number>,
      upcomingRenewals: [] as any[],
    }

    // Count by type
    policies.forEach((policy) => {
      summary.byType[policy.policyType] =
        (summary.byType[policy.policyType] || 0) + 1
    })

    // Get upcoming renewals (within next 90 days)
    const today = new Date()
    const ninetyDaysFromNow = new Date()
    ninetyDaysFromNow.setDate(today.getDate() + 90)

    summary.upcomingRenewals = policies
      .filter((p) => {
        if (!p.validTill) return false
        const validTill = new Date(p.validTill)
        return validTill >= today && validTill <= ninetyDaysFromNow
      })
      .map((p) => ({
        id: p.id,
        policyName: p.policyName,
        policyType: p.policyType,
        validTill: p.validTill,
        daysUntilExpiry: Math.floor(
          (new Date(p.validTill!).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)

    return summary
  }

  /**
   * Add new insurance policy
   */
  async addPolicy(
    userId: string,
    data: {
      policyName: string
      policyType: PolicyType
      policyNumber?: string
      validTill?: Date
      premiumAmount?: number
      premiumDueDate?: Date
      amountInsured?: number
      nominee?: string
      remarks?: string
      documentUrl?: string
      isActive?: boolean
    }
  ) {
    const policy = await prisma.insurancePolicy.create({
      data: {
        userId,
        policyName: data.policyName,
        policyType: data.policyType,
        policyNumber: data.policyNumber,
        validTill: data.validTill,
        premiumAmount: data.premiumAmount
          ? new Prisma.Decimal(data.premiumAmount)
          : null,
        premiumDueDate: data.premiumDueDate,
        amountInsured: data.amountInsured
          ? new Prisma.Decimal(data.amountInsured)
          : null,
        nominee: data.nominee,
        remarks: data.remarks,
        documentUrl: data.documentUrl,
        isActive: data.isActive ?? true,
      },
    })

    return policy
  }

  /**
   * Update insurance policy
   */
  async updatePolicy(
    userId: string,
    policyId: string,
    data: Partial<{
      policyName: string
      policyType: PolicyType
      policyNumber: string
      validTill: Date
      premiumAmount: number
      premiumDueDate: Date
      amountInsured: number
      nominee: string
      remarks: string
      documentUrl: string
      isActive: boolean
    }>
  ) {
    // Check if policy exists and belongs to user
    await this.getPolicyById(userId, policyId)

    const updated = await prisma.insurancePolicy.update({
      where: { id: policyId },
      data: {
        ...(data.policyName && { policyName: data.policyName }),
        ...(data.policyType && { policyType: data.policyType }),
        ...(data.policyNumber !== undefined && {
          policyNumber: data.policyNumber,
        }),
        ...(data.validTill !== undefined && { validTill: data.validTill }),
        ...(data.premiumAmount !== undefined && {
          premiumAmount: data.premiumAmount
            ? new Prisma.Decimal(data.premiumAmount)
            : null,
        }),
        ...(data.premiumDueDate !== undefined && {
          premiumDueDate: data.premiumDueDate,
        }),
        ...(data.amountInsured !== undefined && {
          amountInsured: data.amountInsured
            ? new Prisma.Decimal(data.amountInsured)
            : null,
        }),
        ...(data.nominee !== undefined && { nominee: data.nominee }),
        ...(data.remarks !== undefined && { remarks: data.remarks }),
        ...(data.documentUrl !== undefined && {
          documentUrl: data.documentUrl,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return updated
  }

  /**
   * Delete insurance policy
   */
  async deletePolicy(userId: string, policyId: string) {
    // Check if policy exists and belongs to user
    await this.getPolicyById(userId, policyId)

    await prisma.insurancePolicy.delete({
      where: { id: policyId },
    })

    return { success: true }
  }

  /**
   * Get expiring policies (within specified days)
   */
  async getExpiringPolicies(userId: string, daysThreshold: number = 30) {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + daysThreshold)

    const policies = await prisma.insurancePolicy.findMany({
      where: {
        userId,
        isActive: true,
        validTill: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: { validTill: 'asc' },
    })

    return policies.map((policy) => ({
      ...policy,
      daysUntilExpiry: Math.floor(
        (new Date(policy.validTill!).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    }))
  }
}

export const insuranceService = new InsuranceService()
