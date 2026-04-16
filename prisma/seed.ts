import { PrismaClient, AssetType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed Asset Categories
  console.log('📊 Seeding asset categories...')

  const assetCategories = [
    { name: 'cash', displayName: 'Cash', type: 'ASSET' as AssetType, icon: '💵', color: '#10B981', sortOrder: 1 },
    { name: 'equity_indian_stocks', displayName: 'Indian Stocks', type: 'ASSET' as AssetType, icon: '📈', color: '#3B82F6', sortOrder: 2 },
    { name: 'equity_indian_mf', displayName: 'Indian Equity MF', type: 'ASSET' as AssetType, icon: '📊', color: '#6366F1', sortOrder: 3 },
    { name: 'equity_overseas', displayName: 'Overseas Equity', type: 'ASSET' as AssetType, icon: '🌍', color: '#8B5CF6', sortOrder: 4 },
    { name: 'debt_fixed', displayName: 'Debt/Fixed Deposits', type: 'ASSET' as AssetType, icon: '🏦', color: '#14B8A6', sortOrder: 5 },
    { name: 'gold', displayName: 'Gold', type: 'ASSET' as AssetType, icon: '🪙', color: '#F59E0B', sortOrder: 6 },
    { name: 'crypto', displayName: 'Cryptocurrency', type: 'ASSET' as AssetType, icon: '₿', color: '#F97316', sortOrder: 7 },
    { name: 'real_estate', displayName: 'Real Estate', type: 'ASSET' as AssetType, icon: '🏠', color: '#84CC16', sortOrder: 8 },
    { name: 'car_loan', displayName: 'Car Loan', type: 'LIABILITY' as AssetType, icon: '🚗', color: '#EF4444', sortOrder: 9 },
    { name: 'house_loan', displayName: 'House Loan', type: 'LIABILITY' as AssetType, icon: '🏡', color: '#DC2626', sortOrder: 10 },
    { name: 'other_loans', displayName: 'Other Loans', type: 'LIABILITY' as AssetType, icon: '💳', color: '#B91C1C', sortOrder: 11 },
  ]

  for (const category of assetCategories) {
    await prisma.assetCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log('✅ Asset categories seeded successfully!')

  // Seed Allocation Templates
  console.log('📋 Seeding allocation templates...')

  const templates = [
    {
      name: 'Conservative',
      description: 'Safe and stable portfolio with focus on capital preservation',
      allocations: {
        cash: 0.20,
        equity_indian_stocks: 0.05,
        equity_indian_mf: 0.15,
        equity_overseas: 0.10,
        debt_fixed: 0.40,
        gold: 0.10,
        crypto: 0.00,
        real_estate: 0.00,
      },
      isDefault: false,
      sortOrder: 1,
    },
    {
      name: 'Moderate',
      description: 'Balanced approach with mix of growth and stability',
      allocations: {
        cash: 0.10,
        equity_indian_stocks: 0.15,
        equity_indian_mf: 0.25,
        equity_overseas: 0.15,
        debt_fixed: 0.20,
        gold: 0.10,
        crypto: 0.05,
        real_estate: 0.00,
      },
      isDefault: true,
      sortOrder: 2,
    },
    {
      name: 'Aggressive',
      description: 'High-growth focused portfolio for long-term wealth creation',
      allocations: {
        cash: 0.05,
        equity_indian_stocks: 0.20,
        equity_indian_mf: 0.30,
        equity_overseas: 0.25,
        debt_fixed: 0.10,
        gold: 0.05,
        crypto: 0.05,
        real_estate: 0.00,
      },
      isDefault: false,
      sortOrder: 3,
    },
  ]

  for (const template of templates) {
    await prisma.allocationTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    })
  }

  console.log('✅ Allocation templates seeded successfully!')

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
