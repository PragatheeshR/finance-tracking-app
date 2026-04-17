import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Adding default expense categories to users...')

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  })

  const defaultCategories = [
    { name: 'groceries', displayName: 'Groceries', icon: '🛒', color: '#10B981', sortOrder: 1 },
    { name: 'dining', displayName: 'Dining & Food', icon: '🍽️', color: '#F59E0B', sortOrder: 2 },
    { name: 'transport', displayName: 'Transportation', icon: '🚗', color: '#3B82F6', sortOrder: 3 },
    { name: 'utilities', displayName: 'Utilities', icon: '💡', color: '#6366F1', sortOrder: 4 },
    { name: 'rent', displayName: 'Rent/Mortgage', icon: '🏠', color: '#8B5CF6', sortOrder: 5 },
    { name: 'healthcare', displayName: 'Healthcare', icon: '🏥', color: '#EF4444', sortOrder: 6 },
    { name: 'entertainment', displayName: 'Entertainment', icon: '🎬', color: '#EC4899', sortOrder: 7 },
    { name: 'shopping', displayName: 'Shopping', icon: '🛍️', color: '#F97316', sortOrder: 8 },
    { name: 'education', displayName: 'Education', icon: '📚', color: '#14B8A6', sortOrder: 9 },
    { name: 'insurance', displayName: 'Insurance', icon: '🛡️', color: '#06B6D4', sortOrder: 10 },
    { name: 'subscriptions', displayName: 'Subscriptions', icon: '📱', color: '#8B5CF6', sortOrder: 11 },
    { name: 'personal_care', displayName: 'Personal Care', icon: '💆', color: '#A855F7', sortOrder: 12 },
    { name: 'travel', displayName: 'Travel', icon: '✈️', color: '#0EA5E9', sortOrder: 13 },
    { name: 'gifts', displayName: 'Gifts & Donations', icon: '🎁', color: '#EC4899', sortOrder: 14 },
    { name: 'savings', displayName: 'Savings & Investments', icon: '💰', color: '#84CC16', sortOrder: 15 },
    { name: 'other', displayName: 'Other', icon: '📝', color: '#64748B', sortOrder: 16 },
  ]

  for (const user of users) {
    // Check if user already has categories
    const existingCount = await prisma.expenseCategory.count({
      where: { userId: user.id },
    })

    if (existingCount === 0) {
      console.log(`  Adding categories for user: ${user.email}`)

      await prisma.expenseCategory.createMany({
        data: defaultCategories.map(cat => ({
          userId: user.id,
          ...cat,
          isDefault: true,
          isActive: true,
        })),
      })

      console.log(`  ✅ Added ${defaultCategories.length} categories`)
    } else {
      console.log(`  ⏭️  User ${user.email} already has ${existingCount} categories, skipping`)
    }
  }

  console.log('✅ Completed adding default categories!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
