# Next Steps - You Have DATABASE_URL! 🎉

You've got your Supabase DATABASE_URL:
```
postgresql://postgres:[%9XZPBoOf4eLVGbp]@db.noekcwosefmfihtunnxy.supabase.co:5432/postgres
```

## ⚠️ Important Note

If Supabase shows the password in brackets `[%9XZPBoOf4eLVGbp]`, you can use it as-is. The brackets might be part of the password or Supabase's notation. If you have issues connecting, try removing the brackets.

---

## Step 1: Set Up Local Environment (Optional - for testing)

Create `.env.local` in your project root:

```bash
# Database
DATABASE_URL="postgresql://postgres:[%9XZPBoOf4eLVGbp]@db.noekcwosefmfihtunnxy.supabase.co:5432/postgres"

# JWT Secrets (generate these - see below)
JWT_SECRET="paste-random-32-char-string-here"
JWT_REFRESH_SECRET="paste-another-random-32-char-string-here"

# AI API (get from OpenAI or Anthropic)
OPENAI_API_KEY="sk-..."
# OR
ANTHROPIC_API_KEY="sk-ant-..."
```

**Generate JWT Secrets** (run twice):
```bash
openssl rand -hex 32
# Or on Mac/Linux:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 2: Test Database Connection (Optional)

If you want to test locally first:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npx prisma db push

# Start dev server
npm run dev
```

This will create all the database tables in your Supabase database!

---

## Step 3: Push Code to GitHub

```bash
cd "/Users/isaacjeong/vibe coding test"

# Initialize git (if not done)
git init
git branch -M main

# Add GitHub remote
git remote add origin https://github.com/isaacoj94/class-booking-vc.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Ballet booking platform"

# Push to GitHub
git push -u origin main
```

---

## Step 4: Deploy to Vercel

1. **Go to Vercel**: [vercel.com](https://vercel.com) → Sign up/Login with GitHub

2. **Import Repository**:
   - Click "Add New" → "Project"
   - Import `isaacoj94/class-booking-vc`

3. **Add Environment Variables**:
   In Vercel project settings → Environment Variables, add:

   ```env
   DATABASE_URL=postgresql://postgres:[%9XZPBoOf4eLVGbp]@db.noekcwosefmfihtunnxy.supabase.co:5432/postgres
   
   JWT_SECRET=paste-your-jwt-secret-here
   JWT_REFRESH_SECRET=paste-your-refresh-secret-here
   
   OPENAI_API_KEY=sk-your-openai-key
   # OR
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
   ```

4. **Deploy**: Click "Deploy" 🚀

---

## Step 5: Set Up Database After Deployment

After Vercel deploys, you need to run database migrations.

**Option A: Via Vercel CLI** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.local

# Run database setup
npm run db:generate
npx prisma db push
```

**Option B: Via Supabase SQL Editor**
- Go to your Supabase project → SQL Editor
- The schema will be created when you first use the app (if Prisma auto-runs)

**Option C: One-time migration** (via your local machine with DATABASE_URL)

---

## Step 6: Create Admin Account

1. Visit your deployed app: `https://your-app.vercel.app`
2. Sign up with your email
3. Update user role to ADMIN:

**Via Prisma Studio**:
```bash
npx prisma studio
# Opens at http://localhost:5555
# Go to User table → Find your user → Change role to "ADMIN"
```

**Via SQL** (Supabase SQL Editor):
```sql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';
```

---

## ✅ You're All Set!

After these steps:
- ✅ Code is on GitHub
- ✅ Database is connected (Supabase)
- ✅ App is deployed (Vercel)
- ✅ Database schema is set up
- ✅ You have admin access

**Visit your app and start using it!** 🎉

---

## Quick Checklist

- [ ] Create `.env.local` (for local testing)
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Add environment variables in Vercel
- [ ] Run database migrations (`npx prisma db push`)
- [ ] Create admin account
- [ ] Test the app!

---

**Need help?** Check:
- `DEPLOYMENT.md` - Detailed deployment guide
- `QUICK_START.md` - 5-minute quick start
- `SUPABASE_SETUP.md` - Supabase-specific help

**Your DATABASE_URL is ready!** 🚀
