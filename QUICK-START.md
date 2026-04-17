# 🚀 Quick Start - Deploy in 10 Minutes

## Step 1: Create Neon Database (2 mins)
1. Go to **[neon.tech](https://neon.tech)** → Sign up with GitHub
2. Create Project → Name: `finance-tracker`
3. Copy the **connection string** (looks like `postgresql://...`)
   ```
   Save this! You'll need it for Vercel ⬇️
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/finance_tracker?sslmode=require
   ```

## Step 2: Push to GitHub (3 mins)
```bash
# In your project directory
cd /Users/I753046/Desktop/Pragatheesh/Finance\ Tracking\ App/finance-tracker

# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub: https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR-USERNAME/finance-tracker.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel (5 mins)
1. Go to **[vercel.com](https://vercel.com)** → Sign up with GitHub
2. Click **Add New** → **Project**
3. Import your `finance-tracker` repository
4. Add these **Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `NEXTAUTH_URL` | `https://finance-tracker-xxx.vercel.app` (you'll get this URL after deploy) |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` and paste output |

5. Click **Deploy** → Wait 2-3 minutes

## Step 4: Update NEXTAUTH_URL
1. After deployment, copy your Vercel URL (e.g., `https://finance-tracker-xxx.vercel.app`)
2. Go to Vercel → Your Project → **Settings** → **Environment Variables**
3. Edit `NEXTAUTH_URL` → Paste your actual URL
4. **Redeploy**: Go to **Deployments** → Click ⋯ on latest → **Redeploy**

## Step 5: Run Database Migrations
```bash
# Set DATABASE_URL temporarily
export DATABASE_URL="your-neon-connection-string-here"

# Run migrations
npx prisma migrate deploy

# Done! ✅
```

## 🎉 You're Live!

Visit your app: `https://your-app-name.vercel.app`

1. Click **Get Started** → **Register**
2. Create your account
3. Complete onboarding
4. Start tracking your finances!

---

## Generate NEXTAUTH_SECRET

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Troubleshooting

### "Database connection failed"
- Check DATABASE_URL has `?sslmode=require` at the end
- Verify Neon database is active

### "NEXTAUTH_URL missing"
- Add it in Vercel environment variables
- Must be your actual Vercel URL
- Redeploy after adding

### Build fails
- Check Vercel logs
- Ensure all 3 env vars are set
- Try: `npm run build` locally first

---

## Free Tier Limits

✅ **Neon**: 512 MB storage, unlimited queries
✅ **Vercel**: 100 GB bandwidth, unlimited projects

**Both 100% free forever!** Perfect for personal use.

---

## What's Next?

- ✅ Add custom domain (optional)
- ✅ Invite family members
- ✅ Set up automatic backups
- ✅ Enable analytics in Vercel

📖 Full guide: See **DEPLOYMENT.md**

---

**Need help?** Check the detailed [DEPLOYMENT.md](./DEPLOYMENT.md) guide.
