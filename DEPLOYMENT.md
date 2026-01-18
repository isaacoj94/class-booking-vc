# Deployment Guide

## Prerequisites

### 1. **Database (PostgreSQL)**
Choose one:
- **Supabase** (Recommended for ease) - [supabase.com](https://supabase.com)
- **Neon** - [neon.tech](https://neon.tech)
- **Railway** - [railway.app](https://railway.app)
- **Vercel Postgres** - [vercel.com/storage/postgres](https://vercel.com/storage/postgres)

### 2. **Frontend/Backend Hosting**
- **Vercel** (Recommended - Free tier available) - [vercel.com](https://vercel.com)
  - Auto-deploys from GitHub
  - Free for personal projects
  - Built-in CI/CD

### 3. **AI API Key** (Choose one)
- **OpenAI** - [platform.openai.com](https://platform.openai.com/api-keys)
- **Anthropic Claude** - [console.anthropic.com](https://console.anthropic.com)

### 4. **Email Service** (Optional - for notifications)
- **Resend** (Recommended - Free tier) - [resend.com](https://resend.com)
- **SendGrid** - [sendgrid.com](https://sendgrid.com)

### 5. **Domain** (Optional)
- For custom domain on Vercel

---

## Step-by-Step Deployment

### Step 1: Set Up Database

#### Option A: Supabase (Easiest)
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (or select existing project)
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** or **Connection pooling**
5. Copy the **Connection String** (URI format)
   - Look for: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
   - Or with pooling: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres`
   - **Note**: Replace `[PASSWORD]` with your database password (set during project creation or reset in Settings → Database)

#### Option B: Neon
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string

#### Option C: Railway
1. Go to [railway.app](https://railway.app) and sign up
2. Create new project → Add **PostgreSQL** database
3. Copy the connection string from the database service

### Step 2: Set Up GitHub Repository

1. **Initialize Git** (if not done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com](https://github.com) and create a new repository
   - Don't initialize with README (we already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. **Go to Vercel**: [vercel.com](https://vercel.com)
2. **Sign up/Login** with GitHub
3. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

4. **Configure Environment Variables**:
   Add these in Vercel's project settings → Environment Variables:

   ```env
   # Database (from Step 1)
   DATABASE_URL=postgresql://user:password@host:5432/database

   # JWT Secrets (generate random strings)
   JWT_SECRET=your-random-secret-key-here
   JWT_REFRESH_SECRET=your-random-refresh-secret-here

   # AI API (choose one)
   OPENAI_API_KEY=sk-... OR
   ANTHROPIC_API_KEY=sk-ant-...

   # Optional: Email Service
   RESEND_API_KEY=re_...
   # OR
   SENDGRID_API_KEY=SG....

   # App URL (Vercel will auto-set this, but you can override)
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **Generate JWT Secrets** (run these commands):
   ```bash
   # On Mac/Linux
   openssl rand -hex 32

   # Or use Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Build Settings**:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

6. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Step 4: Set Up Database Schema

After deployment, you need to run Prisma migrations:

#### Option A: Via Vercel CLI (Recommended)
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Pull environment** (optional, to test locally):
   ```bash
   vercel env pull .env.local
   ```

4. **Run migrations locally** (with DATABASE_URL from .env.local):
   ```bash
   npm install
   npm run db:generate
   npx prisma db push
   ```

#### Option B: Via Supabase/Neon Dashboard
1. Go to your database dashboard
2. Find "SQL Editor" or "Query" section
3. Copy the schema from `prisma/schema.prisma`
4. Convert to SQL (or use Prisma Studio)

#### Option C: Via Vercel Build Command
You can add to `package.json` scripts:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma db push && next build"
  }
}
```

⚠️ **Note**: `prisma db push` in build is not recommended for production. Use migrations instead.

### Step 5: Create Admin Account

1. **Sign up through the app**:
   - Go to your deployed app URL
   - Sign up with any email (this will be your admin account)

2. **Update user role to ADMIN**:
   
   **Option A: Via Prisma Studio** (Easiest)
   ```bash
   # Set DATABASE_URL in .env.local
   npx prisma studio
   ```
   - Open in browser (usually http://localhost:5555)
   - Go to `User` table
   - Find your user
   - Change `role` from `CUSTOMER` to `ADMIN`
   - Save

   **Option B: Via SQL**
   ```sql
   UPDATE users 
   SET role = 'ADMIN' 
   WHERE email = 'your-email@example.com';
   ```

   **Option C: Via Database Dashboard**
   - Use Supabase/Neon SQL editor
   - Run the SQL above

### Step 6: Test Deployment

1. **Visit your app**: `https://your-app.vercel.app`
2. **Test Sign Up**: Create a test customer account
3. **Test Admin**: Login as admin (from Step 5)
4. **Test Features**:
   - Create a class
   - Generate instances
   - Book a class
   - View dashboard

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for access tokens | Random 32+ character string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Random 32+ character string |
| `OPENAI_API_KEY` OR `ANTHROPIC_API_KEY` | AI service API key | `sk-...` or `sk-ant-...` |

### Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend email API key | `re_...` |
| `SENDGRID_API_KEY` | SendGrid email API key | `SG....` |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `https://your-app.vercel.app` |

---

## Post-Deployment Checklist

- [ ] Database schema migrated
- [ ] Environment variables set
- [ ] Admin account created
- [ ] Test signup/login
- [ ] Test class creation
- [ ] Test booking flow
- [ ] Test admin features
- [ ] AI recommendations working (check API key)
- [ ] Notifications working (if email configured)

---

## Troubleshooting

### Database Connection Errors
- Check `DATABASE_URL` is correct
- Ensure database is accessible (not behind firewall)
- Check if connection pooling is needed (Supabase/Neon auto-handles this)

### Build Errors
- Check Node.js version (need 18+)
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run lint`

### Authentication Not Working
- Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Check they're long enough (32+ characters)
- Ensure they're different from each other

### AI Features Not Working
- Verify API key is set correctly
- Check API key has credits/quota
- Check console logs for API errors

### CORS Errors
- Next.js API routes handle CORS automatically
- If issues, check `next.config.js` settings

---

## Custom Domain Setup (Optional)

1. In Vercel project settings → Domains
2. Add your domain
3. Follow DNS instructions from Vercel
4. Wait for DNS propagation (can take 24 hours)

---

## Production Best Practices

1. **Use Prisma Migrations** (not `db push`):
   ```bash
   npx prisma migrate deploy
   ```

2. **Enable Vercel Analytics** (optional):
   - Project Settings → Analytics

3. **Set Up Error Tracking**:
   - Consider Sentry for production errors

4. **Database Backups**:
   - Enable automatic backups in your database provider

5. **Monitor Performance**:
   - Use Vercel's built-in analytics
   - Monitor API route performance

---

## Quick Deploy Commands Summary

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (create .env.local with DATABASE_URL, JWT_SECRET, etc.)
cp .env.example .env.local

# 3. Generate Prisma client
npm run db:generate

# 4. Push schema to database
npx prisma db push

# 5. Test locally
npm run dev

# 6. Deploy to Vercel (via GitHub or CLI)
# Via CLI: vercel
# Via GitHub: Push to main branch (auto-deploys)
```

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Ready to deploy!** 🚀

Once deployed, your ballet booking platform will be live and ready for customers!
