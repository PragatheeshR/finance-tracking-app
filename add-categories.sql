-- ================================================
-- SQL Script to Add Default Categories
-- ================================================

-- ==============================================
-- 1. ADD ASSET CATEGORIES (Portfolio - System-wide)
-- ==============================================
-- These categories are shared by all users

INSERT INTO asset_categories (id, name, "displayName", type, icon, color, "sortOrder", "isDefault", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'cash', 'Cash', 'ASSET', '💵', '#10B981', 1, true, true, NOW(), NOW()),
  (gen_random_uuid(), 'equity_indian_stocks', 'Indian Stocks', 'ASSET', '📈', '#3B82F6', 2, true, true, NOW(), NOW()),
  (gen_random_uuid(), 'equity_indian_mf', 'Indian Equity MF', 'ASSET', '📊', '#6366F1', 3, true, true, NOW(), NOW()),
  (gen_random_uuid(), 'equity_overseas', 'Overseas Equity', 'ASSET', '🌍', '#8B5CF6', 4, true, true, NOW(), NOW()),
  (gen_random_uuid(), 'debt_fixed', 'Debt/Fixed Deposits', 'ASSET', '🏦', '#14B8A6', 5, true, true, NOW(), NOW()),
  (gen_random_uuid(), 'gold', 'Gold', 'ASSET', '🪙', '#F59E0B', 6, true, true, NOW(), NOW()),
  (gen_random_uuid(), 'crypto', 'Cryptocurrency', 'ASSET', '₿', '#F97316', 7, true, true, NOW(), NOW()),
  (gen_random_uuid(), 'real_estate', 'Real Estate', 'ASSET', '🏠', '#84CC16', 8, true, true, NOW(), NOW()),
  (gen_random_uuid(), 'car_loan', 'Car Loan', 'LIABILITY', '🚗', '#EF4444', 9, true, true, NOW(), NOW()),
  (gen_random_uuid(), 'house_loan', 'House Loan', 'LIABILITY', '🏡', '#DC2626', 10, true, true, NOW(), NOW()),
  (gen_random_uuid(), 'other_loans', 'Other Loans', 'LIABILITY', '💳', '#B91C1C', 11, true, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;


-- ==============================================
-- 2. ADD EXPENSE CATEGORIES FOR ALL USERS
-- ==============================================
-- This adds default expense categories for every user in the system

INSERT INTO expense_categories (id, "userId", name, "displayName", icon, color, "sortOrder", "isDefault", "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  cat.name,
  cat."displayName",
  cat.icon,
  cat.color,
  cat."sortOrder",
  true,
  true,
  NOW(),
  NOW()
FROM users u
CROSS JOIN (
  VALUES
    ('groceries', 'Groceries', '🛒', '#10B981', 1),
    ('dining', 'Dining & Food', '🍽️', '#F59E0B', 2),
    ('transport', 'Transportation', '🚗', '#3B82F6', 3),
    ('utilities', 'Utilities', '💡', '#6366F1', 4),
    ('rent', 'Rent/Mortgage', '🏠', '#8B5CF6', 5),
    ('healthcare', 'Healthcare', '🏥', '#EF4444', 6),
    ('entertainment', 'Entertainment', '🎬', '#EC4899', 7),
    ('shopping', 'Shopping', '🛍️', '#F97316', 8),
    ('education', 'Education', '📚', '#14B8A6', 9),
    ('insurance', 'Insurance', '🛡️', '#06B6D4', 10),
    ('subscriptions', 'Subscriptions', '📱', '#8B5CF6', 11),
    ('personal_care', 'Personal Care', '💆', '#A855F7', 12),
    ('travel', 'Travel', '✈️', '#0EA5E9', 13),
    ('gifts', 'Gifts & Donations', '🎁', '#EC4899', 14),
    ('savings', 'Savings & Investments', '💰', '#84CC16', 15),
    ('other', 'Other', '📝', '#64748B', 16)
) AS cat(name, "displayName", icon, color, "sortOrder")
WHERE NOT EXISTS (
  SELECT 1 FROM expense_categories ec
  WHERE ec."userId" = u.id AND ec.name = cat.name
);


-- ==============================================
-- 3. VERIFY CATEGORIES WERE ADDED
-- ==============================================

-- Check asset categories count
SELECT COUNT(*) as asset_categories_count FROM asset_categories;

-- Check expense categories per user
SELECT
  u.email,
  COUNT(ec.id) as expense_categories_count
FROM users u
LEFT JOIN expense_categories ec ON ec."userId" = u.id
GROUP BY u.email
ORDER BY u.email;


-- ==============================================
-- NOTES:
-- ==============================================
-- 1. Asset categories are system-wide (same for all users)
-- 2. Expense categories are user-specific (each user gets their own copy)
-- 3. This script is idempotent - safe to run multiple times
-- 4. New users will get categories automatically during onboarding
-- ==============================================
