# Quick Start Guide

Get your ballet booking platform running in **5 minutes**! 🚀

## What You Need

1. ✅ **GitHub account** (free)
2. ✅ **Vercel account** (free) - [vercel.com](https://vercel.com)
3. ✅ **Supabase account** (free) - [supabase.com](https://supabase.com)
4. ✅ **OpenAI or Anthropic API key** (for AI features)

---

## Quick Deploy (5 Steps)

### 1️⃣ Push to GitHub

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2️⃣ Create Database (Supabase)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose **org** → **Project Name** → **Database Password**
3. Wait 2 minutes for setup
4. Go to **Settings** → **Database**
5. Copy **Connection String** (URI format)

### 3️⃣ Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Click **Configure Project**
5. **Add Environment Variables**:

   ```env
   DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT].supabase.co:5432/postgres
   
   JWT_SECRET=paste-random-32-char-string-here
   JWT_REFRESH_SECRET=paste-another-random-32-char-string-here
   
   OPENAI_API_KEY=sk-your-openai-key-here
   # OR
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
   ```

   **Generate JWT secrets** (run twice):
   ```bash
   openssl rand -hex 32
   ```

6. Click **Deploy** ⚡

### 4️⃣ Set Up Database Schema

After deployment completes:

```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel login
vercel env pull .env.local

# Run database setup
npm install
npm run db:generate
npx prisma db push
```

### 5️⃣ Create Admin Account

1. Go to your deployed app: `https://your-app.vercel.app`
2. **Sign up** with your email
3. **Update to admin**:
   ```bash
   npx prisma studio
   # Open http://localhost:5555
   # Find your user → Change role to "ADMIN"
   ```

**OR via SQL** (in Supabase SQL Editor):
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

---

## ✅ You're Done!

Visit your app and start:
- 📅 Creating classes
- 👥 Managing customers  
- 🏆 Tracking progress
- ✨ Using AI recommendations

---

## Need Help?

See `DEPLOYMENT.md` for detailed instructions.

---

**Time to Deploy: ~5 minutes** ⏱️
