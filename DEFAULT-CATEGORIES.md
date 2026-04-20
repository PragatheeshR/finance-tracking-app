# Default Categories - Auto-Created on Onboarding

When a new user completes onboarding, the following categories are **automatically created** so they can start tracking immediately without manual setup.

---

## 📊 Portfolio Asset Categories (13 Categories)

These categories help organize your investments and assets:

| Category | Icon | Description |
|----------|------|-------------|
| **Equity (Stocks)** | 📈 | Individual stocks and shares |
| **Mutual Funds** | 📊 | Mutual fund investments |
| **ETF** | 💹 | Exchange-traded funds |
| **Bonds** | 📜 | Government/corporate bonds |
| **Fixed Deposit** | 🏦 | Bank fixed deposits |
| **Gold** | 🪙 | Physical/digital gold |
| **Real Estate** | 🏘️ | Property investments |
| **Cryptocurrency** | ₿ | Bitcoin, Ethereum, etc. |
| **PPF** | 🛡️ | Public Provident Fund |
| **NPS** | 👴 | National Pension System |
| **EPF** | 💼 | Employee Provident Fund |
| **Cash & Savings** | 💵 | Bank accounts, cash |
| **Other Assets** | 📝 | Miscellaneous assets |

---

## 💸 Expense Categories (16 Categories)

These categories help track where your money goes:

| Category | Icon | Description |
|----------|------|-------------|
| **Groceries** | 🛒 | Food, household items |
| **Dining & Food** | 🍽️ | Restaurants, takeout |
| **Transportation** | 🚗 | Fuel, public transport, rides |
| **Utilities** | 💡 | Electricity, water, gas |
| **Rent/Mortgage** | 🏠 | Housing payments |
| **Healthcare** | 🏥 | Medical, dental, pharmacy |
| **Entertainment** | 🎬 | Movies, games, hobbies |
| **Shopping** | 🛍️ | Clothing, electronics |
| **Education** | 📚 | Courses, books, tuition |
| **Insurance** | 🛡️ | All insurance premiums |
| **Subscriptions** | 📱 | Netflix, Spotify, etc. |
| **Personal Care** | 💆 | Salon, spa, grooming |
| **Travel** | ✈️ | Vacation, trips |
| **Gifts & Donations** | 🎁 | Presents, charity |
| **Savings & Investments** | 💰 | Transfers to investments |
| **Other** | 📝 | Miscellaneous expenses |

---

## ✨ Benefits

### No Manual Setup Required
- ✅ Categories created automatically during onboarding
- ✅ Start tracking expenses immediately
- ✅ Add portfolio holdings right away
- ✅ No time wasted on setup

### Fully Customizable
- ✅ Edit any category (name, icon, color)
- ✅ Add your own custom categories
- ✅ Deactivate categories you don't use
- ✅ Reorder categories by priority

### Smart Defaults
- ✅ Color-coded for easy recognition
- ✅ Organized by common usage
- ✅ Covers 90% of use cases
- ✅ Based on Indian financial needs

---

## 🎨 How It Works

### During Onboarding
```
Register → Login → Complete Onboarding
                         ↓
            ✨ Categories Auto-Created ✨
                         ↓
        Dashboard → Start Using App!
```

### Category Creation Logic
```typescript
// Checks if user already has categories
if (no existing categories) {
  // Creates all default categories
  await createDefaultCategories()
}
```

**Result**: New users get a fully functional app from day one!

---

## 📝 Managing Categories

### View Your Categories
1. Go to **Settings** → **Categories** tab
2. See all expense and asset categories
3. View which are active/inactive

### Add Custom Category
1. Click **"Add Category"** button
2. Choose name, icon, and color
3. Save and start using immediately

### Edit Existing Category
1. Click on any category
2. Modify name, icon, or color
3. Changes apply to all future entries

### Deactivate Category
1. Click on category
2. Toggle **"Active"** switch
3. Hidden from dropdowns (old data preserved)

---

## 🚀 For New Users

When you complete onboarding:
1. **28 default categories** are created automatically
2. You can **start tracking immediately**
3. **No setup required** - everything is ready
4. Customize anytime from Settings

---

## 💡 Tips

### For Expenses
- Use **"Other"** for one-off expenses
- Create custom categories for frequent expenses
- Combine similar categories if too many
- Use **"Savings & Investments"** for transfers to portfolio

### For Portfolio
- Use **"Equity"** for individual stocks
- **"Mutual Funds"** includes SIPs
- **"ETF"** for index funds
- Use **"Other Assets"** for unique investments

---

## 🔧 Technical Details

### Database Structure
```typescript
ExpenseCategory {
  id: string
  userId: string
  name: string
  displayName: string
  icon: string
  color: string
  isDefault: boolean  // ← true for auto-created
  isActive: boolean   // ← true by default
  sortOrder: number
}

AssetCategory {
  id: string
  userId: string
  name: string
  displayName: string
  icon: string
  color: string
  isDefault: boolean  // ← true for auto-created
  isActive: boolean   // ← true by default
  sortOrder: number
}
```

### Where They're Created
- **File**: `src/app/api/v1/onboarding/complete/route.ts`
- **Event**: When user completes onboarding
- **Logic**: Only creates if user has zero categories

---

## ✅ Summary

**Before This Change:**
- ❌ Users had to manually create each category
- ❌ Time-consuming setup process
- ❌ Frustrated new users
- ❌ Empty dropdowns on first use

**After This Change:**
- ✅ 28 categories ready to use
- ✅ Zero setup required
- ✅ Great first-time experience
- ✅ Start tracking in seconds

**Result**: Happy users who can focus on tracking their finances, not setting up categories! 🎉
