#!/bin/bash

echo "🚀 Finance Tracker - Deployment Helper"
echo "======================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Finance Tracker app"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create a GitHub repository:"
echo "   → Go to https://github.com/new"
echo "   → Name: finance-tracker"
echo "   → Click 'Create repository'"
echo ""
echo "2. Push your code:"
echo "   → git remote add origin https://github.com/YOUR-USERNAME/finance-tracker.git"
echo "   → git branch -M main"
echo "   → git push -u origin main"
echo ""
echo "3. Create Neon database:"
echo "   → Go to https://neon.tech"
echo "   → Sign up with GitHub (free)"
echo "   → Create a project named 'finance-tracker'"
echo "   → Copy the connection string"
echo ""
echo "4. Deploy to Vercel:"
echo "   → Go to https://vercel.com"
echo "   → Sign up with GitHub (free)"
echo "   → Click 'Add New' → 'Project'"
echo "   → Import your GitHub repo"
echo "   → Add environment variables:"
echo "     • DATABASE_URL (from Neon)"
echo "     • NEXTAUTH_URL (your Vercel URL)"
echo "     • NEXTAUTH_SECRET (run: openssl rand -base64 32)"
echo "   → Click 'Deploy'"
echo ""
echo "5. Run migrations:"
echo "   → After deployment, run:"
echo "   → DATABASE_URL='your-neon-url' npx prisma migrate deploy"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
