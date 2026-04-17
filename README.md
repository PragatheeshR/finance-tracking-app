# 💰 Finance Tracker

A comprehensive personal finance management application built with Next.js 16, featuring portfolio tracking, expense management, budgeting, and financial planning tools.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 📊 Portfolio Management
- Track stocks, mutual funds, ETFs, gold, and fixed deposits
- Real-time portfolio valuation and gains/losses
- Asset allocation visualization
- Rebalancing suggestions

### 💸 Expense Tracking
- Categorize expenses (Fixed, Variable, Irregular)
- Bulk import from CSV
- Month-over-month comparisons
- Category-wise analysis

### 🎯 Budget Management
- Monthly budget planning
- Track budget vs actual spending
- Budget alerts and recommendations
- Recurring expense automation

### 📈 Analytics Dashboard
- Net worth tracking over time
- Income vs expense trends
- Category breakdowns
- Custom date range analysis

### 🏆 Goals & Savings
- Set financial goals (emergency fund, retirement, vacation)
- Track progress with milestones
- Goal contributions and projections
- Achievement tracking

### 🛡️ Insurance Management
- Track all insurance policies
- Premium payment reminders
- Coverage analysis
- Family member management

### 🧮 Financial Calculators
- Income Tax Calculator (India)
- FIRE (Financial Independence) Calculator
- Inflation Impact Calculator
- SIP Return Calculator

### 💼 Income Management
- Track multiple income sources
- Regular vs irregular income
- Income trends and forecasts
- Tax planning insights

### ⚙️ Settings & Preferences
- Profile management
- Currency and timezone settings
- Theme customization (light/dark)
- Data export (JSON)
- Category management

## 🚀 Tech Stack

- **Framework**: Next.js 16.2 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js v4
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui + Base UI
- **State Management**: Zustand + React Query
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/finance-tracker.git
   cd finance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for dev)
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

4. **Set up database**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed  # Optional: seed with sample data
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

Deploy to Vercel with Neon PostgreSQL - **100% FREE!**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. **Create Neon Database**: [neon.tech](https://neon.tech) (free)
2. **Push to GitHub**: Your code repository
3. **Deploy on Vercel**: [vercel.com](https://vercel.com) (free)
4. **Add environment variables** in Vercel dashboard
5. **Run migrations**: `DATABASE_URL='...' npx prisma migrate deploy`

That's it! Your app is live 🎉

## 📁 Project Structure

```
finance-tracker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── api/v1/            # API routes
│   │   ├── dashboard/         # Main app pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── layout/            # Layout components
│   │   ├── portfolio/         # Portfolio components
│   │   ├── expenses/          # Expense components
│   │   └── ui/                # UI components (Shadcn)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and services
│   │   ├── services/          # Business logic
│   │   ├── validations/       # Zod schemas
│   │   └── utils/             # Helper functions
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data
├── public/                    # Static assets
└── package.json
```

## 🔒 Security

- Passwords hashed with bcrypt
- JWT-based authentication (NextAuth)
- SQL injection protection (Prisma)
- CSRF protection
- Environment variables for secrets
- HTTPS enforced in production

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Create new migration
npm run db:reset     # Reset database
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)
- [Neon](https://neon.tech/)

---

Built with ❤️ by Pragatheesh
