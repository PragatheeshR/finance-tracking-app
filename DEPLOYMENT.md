# Deployment Guide - Finance Tracker

This guide will help you deploy your Finance Tracker app for **FREE** using Vercel and Neon.

## Prerequisites

- GitHub account
- Vercel account (sign up with GitHub)
- Neon account (sign up with GitHub)

---

## Step 1: Create Free PostgreSQL Database (Neon)

### 1.1 Sign Up for Neon
1. Go to [neon.tech](https://neon.tech)
2. Click **Sign Up** and use your GitHub account
3. It's completely free - no credit card required!

### 1.2 Create Database
1. Click **Create Project**
2. Name it: `finance-tracker`
3. Select region closest to you
4. PostgreSQL version: **16** (latest)
5. Click **Create Project**

### 1.3 Get Connection String
1. After project is created, you'll see the **Connection String**
2. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/finance_tracker?sslmode=require
   ```
3. **Save this!** You'll need it for Vercel

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository (if not already done)
```bash
cd /Users/I753046/Desktop/Pragatheesh/Finance\ Tracking\ App/finance-tracker
git init
git add .
git commit -m "Initial commit - Finance Tracker app"
```

### 2.2 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click **New Repository**
3. Name it: `finance-tracker`
4. Keep it **Private** (recommended) or Public
5. **Do NOT** initialize with README (we already have code)
6. Click **Create Repository**

### 2.3 Push to GitHub
```bash
# Replace YOUR-USERNAME with your GitHub username
git remote add origin https://github.com/YOUR-USERNAME/finance-tracker.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Sign Up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** and use your GitHub account
3. Free forever for personal projects!

### 3.2 Import Project
1. Click **Add New** → **Project**
2. Select **Import Git Repository**
3. Find your `finance-tracker` repository
4. Click **Import**

### 3.3 Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### 3.4 Add Environment Variables
Click **Environment Variables** and add these:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1.3 |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` (you'll get this after deploy) |
| `NEXTAUTH_SECRET` | Generate using: `openssl rand -base64 32` |

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```
Copy the output and use it as the value.

### 3.5 Deploy
1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://finance-tracker-xxx.vercel.app`

---

## Step 4: Run Database Migrations

After first deployment, you need to set up the database schema:

### 4.1 Update NEXTAUTH_URL
1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Edit `NEXTAUTH_URL` to your actual Vercel URL
4. Redeploy: Go to **Deployments** → Click ⋯ on latest → **Redeploy**

### 4.2 Run Migrations from Local
```bash
# Set the production DATABASE_URL temporarily
export DATABASE_URL="your-neon-connection-string"

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

**OR** use Vercel CLI (recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration in production
vercel env pull .env.production
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy
```

---

## Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. You should see the landing page
3. Click **Get Started** → **Register**
4. Create an account
5. Complete onboarding
6. Start using the app!

---

## Free Tier Limits

### Neon (Database)
- ✅ 512 MB storage
- ✅ 1 project
- ✅ Unlimited queries
- ✅ Auto-scaling
- ⚠️ Database sleeps after inactivity (wakes up automatically in <1s)

### Vercel (Hosting)
- ✅ Unlimited personal projects
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains (1 free)
- ✅ Serverless functions
- ⚠️ 100 GB bandwidth limit (plenty for personal use)

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Make sure `package.json` has correct build script

### Database Connection Error
- Verify DATABASE_URL is correct
- Ensure `?sslmode=require` is at the end
- Check Neon project is active (not deleted)

### "NEXTAUTH_URL is not defined"
- Add NEXTAUTH_URL in Vercel environment variables
- Must match your actual Vercel URL
- Redeploy after adding

### Prisma Client Error
- Run migrations: `npx prisma migrate deploy`
- Regenerate client: `npx prisma generate`
- Commit and redeploy

---

## Automatic Deployments

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push

# Vercel will automatically deploy!
```

---

## Custom Domain (Optional)

### Free Domain Options:
1. **Vercel Subdomain** (free, included)
   - Example: `finance-tracker.vercel.app`

2. **Custom Domain** (if you own one)
   - Go to Vercel → Your Project → **Settings** → **Domains**
   - Add your domain
   - Update DNS settings as instructed

---

## Monitoring & Logs

### View Logs
1. Go to Vercel dashboard
2. Click your project
3. Click **Logs** tab
4. See real-time application logs

### Monitor Usage
- Go to **Analytics** tab
- See page views, performance, etc.

---

## Security Checklist

- ✅ `.env` is in `.gitignore` (never commit secrets!)
- ✅ NEXTAUTH_SECRET is random and secure
- ✅ Database connection uses SSL
- ✅ Vercel automatic HTTPS enabled
- ✅ GitHub repository is private (recommended)

---

## Cost Estimate

**Total Monthly Cost: $0** 🎉

Both Neon and Vercel offer generous free tiers perfect for personal projects!

---

## Next Steps

1. ✅ Deploy to production
2. ✅ Create your account
3. ✅ Add your first holdings
4. ✅ Track expenses
5. ✅ Set financial goals

Happy tracking! 🚀
