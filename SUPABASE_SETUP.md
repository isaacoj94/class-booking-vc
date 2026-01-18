# Supabase Setup - Getting DATABASE_URL

## Quick Guide

For **Prisma** to connect to your Supabase database, you need the **PostgreSQL connection string**, NOT the API keys.

## Steps to Get DATABASE_URL

1. **Go to Supabase Dashboard**:
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project (your project URL: `noekcwosefmfihtunnxy.supabase.co`)

2. **Navigate to Database Settings**:
   - Click **Settings** (gear icon) in the left sidebar
   - Click **Database** in the settings menu

3. **Find Connection String**:
   - Scroll down to **Connection string** or **Connection pooling** section
   - You'll see different connection methods

4. **Copy the URI Connection String**:
   
   **Option A: Direct Connection** (for Prisma migrations):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.noekcwosefmfihtunnxy.supabase.co:5432/postgres
   ```
   
   **Option B: Connection Pooling** (for production, recommended):
   ```
   postgresql://postgres.noekcwosefmfihtunnxy:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

5. **Replace `[YOUR-PASSWORD]`**:
   - This is the database password you set when creating the project
   - If you forgot it, click **Reset database password** in the same settings page
   - After reset, the connection string will update automatically

## Example

Based on your project (`noekcwosefmfihtunnxy`), your `DATABASE_URL` should look like:

```
postgresql://postgres:your-database-password@db.noekcwosefmfihtunnxy.supabase.co:5432/postgres
```

Or with pooling:
```
postgresql://postgres.noekcwosefmfihtunnxy:your-database-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## What About the API Keys?

The keys you saw (`sb_publishable_...` and `sb_secret_...`) are:
- For Supabase client SDK (authentication, storage, etc.)
- **NOT needed** for Prisma database connections
- Can be useful for future features (Supabase Auth, Storage)

**For now, you only need the `DATABASE_URL` for Prisma!**

## After Getting DATABASE_URL

Use this in your `.env.local` or Vercel environment variables:

```env
DATABASE_URL=postgresql://postgres:your-password@db.noekcwosefmfihtunnxy.supabase.co:5432/postgres
```

Then run:
```bash
npm run db:generate
npx prisma db push
```

---

**Your Supabase Project**: `noekcwosefmfihtunnxy.supabase.co`

Need help? The connection string is in **Settings → Database → Connection string** section!
