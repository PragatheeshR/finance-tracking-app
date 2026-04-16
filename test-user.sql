-- Create a test user for API testing
INSERT INTO users (id, email, name, "createdAt", "updatedAt")
VALUES ('test-user-001', 'test@example.com', 'Test User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create user settings
INSERT INTO user_settings (id, "userId", "createdAt", "updatedAt")
VALUES ('test-settings-001', 'test-user-001', NOW(), NOW())
ON CONFLICT ("userId") DO NOTHING;

-- Create some ideal allocations for the test user
INSERT INTO ideal_allocations (id, "userId", "categoryId", percentage, "createdAt", "updatedAt")
SELECT
  'test-alloc-' || ac.id,
  'test-user-001',
  ac.id,
  CASE ac.name
    WHEN 'cash' THEN 0.10
    WHEN 'equity_indian_mf' THEN 0.30
    WHEN 'equity_overseas' THEN 0.20
    WHEN 'debt_fixed' THEN 0.20
    WHEN 'gold' THEN 0.10
    WHEN 'equity_indian_stocks' THEN 0.10
    ELSE 0.00
  END,
  NOW(),
  NOW()
FROM asset_categories ac
ON CONFLICT ("userId", "categoryId") DO NOTHING;

-- Verify test user
SELECT id, email, name FROM users WHERE id = 'test-user-001';
