# Safe Development Guide

## 🛡️ Best Practices for Adding Features

### 1. **Always Test Locally First**

Before pushing to GitHub/Vercel:

```bash
# 1. Run the development server locally
npm run dev

# 2. Test your changes at http://localhost:3000

# 3. Build locally to catch errors
npm run build

# 4. If build succeeds, then push to GitHub
```

**Why?** Catches TypeScript errors, build issues, and runtime bugs before they hit production.

---

### 2. **Use Git Branches for New Features**

**Never work directly on `main` branch!**

```bash
# Create a new branch for your feature
git checkout -b feature/new-feature-name

# Make your changes, test locally
# ... edit files ...

# Commit your changes
git add .
git commit -m "Add: new feature description"

# Push the branch (not main!)
git push origin feature/new-feature-name

# Test on Vercel preview deployment
# Then merge to main when ready
```

**Benefits:**
- Vercel creates preview deployments for each branch
- You can test without affecting production
- Easy to rollback if something breaks

---

### 3. **Incremental Changes**

**Don't change everything at once!**

✅ **Good:**
- Add one feature → test → commit
- Fix one bug → test → commit
- Update one component → test → commit

❌ **Bad:**
- Change 10 files at once
- Add feature + refactor + fix bugs all together
- Push without testing

---

### 4. **Test Checklist Before Pushing**

Before `git push`, verify:

- [ ] `npm run build` succeeds (no TypeScript errors)
- [ ] `npm run dev` works locally
- [ ] New feature works in browser
- [ ] Existing features still work (don't break old stuff!)
- [ ] No console errors in browser DevTools
- [ ] API routes work (if you added/changed any)

---

### 5. **Database Changes (Prisma Schema)**

**⚠️ CRITICAL: Database changes need special care**

```bash
# 1. Edit prisma/schema.prisma
# 2. Test migration locally FIRST
npx prisma migrate dev --name your_migration_name

# 3. Verify it works locally
npm run dev

# 4. Push schema changes
git add prisma/schema.prisma
git commit -m "Update: database schema for new feature"
git push

# 5. After Vercel deploys, run migration on production:
#    - Go to Vercel → Your Project → Settings → Environment Variables
#    - Copy DATABASE_URL
#    - Run locally: export DATABASE_URL="your-production-url" && npx prisma migrate deploy
#    OR use Supabase SQL Editor to apply changes manually
```

**⚠️ WARNING:** Always backup your database before migrations!

---

### 6. **API Route Changes**

When adding/modifying API routes:

1. **Test locally first:**
   ```bash
   npm run dev
   # Test at http://localhost:3000/api/your-route
   ```

2. **Check authentication:**
   - If it's an admin route, verify role check exists
   - If it's a customer route, verify user authentication

3. **Error handling:**
   - Always return proper error responses
   - Use try/catch blocks

4. **Example safe pattern:**
   ```typescript
   export async function GET(request: NextRequest) {
     const authResult = await authenticateRequest(request);
     if (authResult instanceof NextResponse) {
       return authResult; // Handles 401 automatically
     }
     
     // Check role if needed
     if (authResult.user.role !== 'ADMIN') {
       return NextResponse.json(
         { error: 'Forbidden' },
         { status: 403 }
       );
     }
     
     try {
       // Your logic here
       return NextResponse.json({ data: result });
     } catch (error: any) {
       return NextResponse.json(
         { error: error.message || 'Failed' },
         { status: 500 }
       );
     }
   }
   ```

---

### 7. **Component Changes**

**Safe component development:**

1. **Create new components in isolation:**
   ```bash
   # Create component file
   touch components/NewFeature.tsx
   ```

2. **Test component separately:**
   - Create a test page: `app/test/page.tsx`
   - Import and render your component
   - Test at `/test` route

3. **Then integrate:**
   - Once it works, add to actual pages
   - Test the full flow

---

### 8. **Environment Variables**

**Adding new env variables:**

1. **Add to `.env.local` (local development):**
   ```bash
   NEW_API_KEY=your-key-here
   ```

2. **Add to Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add the variable
   - **Redeploy** for changes to take effect

3. **Update `.env.example`** (if you have one) for documentation

---

### 9. **Rollback Strategy**

**If something breaks in production:**

```bash
# Option 1: Revert last commit
git revert HEAD
git push

# Option 2: Rollback to previous working commit
git log  # Find the commit hash before the break
git revert <commit-hash>
git push

# Option 3: Vercel Dashboard
# Go to Vercel → Deployments → Find working deployment → "Promote to Production"
```

---

### 10. **Code Review Checklist**

Before merging to `main`:

- [ ] Code follows existing patterns
- [ ] No hardcoded values (use env variables)
- [ ] Error handling added
- [ ] TypeScript types are correct
- [ ] No console.logs left in production code
- [ ] Comments added for complex logic
- [ ] Database queries are efficient (no N+1 problems)

---

## 🚨 Emergency Fixes

**If production is broken RIGHT NOW:**

1. **Don't panic** - Vercel keeps previous deployments
2. **Promote previous working deployment:**
   - Vercel Dashboard → Deployments
   - Find last working one → "Promote to Production"
3. **Fix the issue in a branch**
4. **Test thoroughly**
5. **Deploy when ready**

---

## 📋 Recommended Workflow

```bash
# 1. Create feature branch
git checkout -b feature/add-calendar-view

# 2. Make changes
# ... edit files ...

# 3. Test locally
npm run dev
# Test in browser

# 4. Build check
npm run build

# 5. Commit
git add .
git commit -m "Add: calendar view feature"

# 6. Push branch (creates Vercel preview)
git push origin feature/add-calendar-view

# 7. Test preview deployment URL from Vercel

# 8. If good, merge to main
git checkout main
git merge feature/add-calendar-view
git push origin main

# 9. Production auto-deploys from main
```

---

## 🎯 Quick Reference

| Action | Command | When to Use |
|--------|---------|-------------|
| Test locally | `npm run dev` | Before every push |
| Check build | `npm run build` | Before pushing |
| Create branch | `git checkout -b feature/name` | Starting new feature |
| Test API | `curl http://localhost:3000/api/route` | Testing API routes |
| Check logs | Vercel Dashboard → Deployments → View Logs | Debugging production issues |
| Rollback | Vercel Dashboard → Promote Deployment | Production broken |

---

## 💡 Pro Tips

1. **Keep `main` branch always deployable** - Only merge tested, working code
2. **Use Vercel preview deployments** - Test branches before merging
3. **Test in production-like environment** - Use same database, env vars
4. **Document breaking changes** - If you change API, update docs
5. **Communicate changes** - If working with a team, notify about major changes

---

## 🔧 Common Mistakes to Avoid

❌ **Pushing directly to `main`**
- Use branches!

❌ **Skipping local testing**
- Always test before pushing

❌ **Changing database schema without testing**
- Test migrations locally first

❌ **Hardcoding values**
- Use environment variables

❌ **Breaking existing features**
- Test old features when adding new ones

❌ **Large commits**
- Make small, incremental changes

---

**Remember: Slow and steady wins the race. It's better to take 10 minutes to test than 2 hours to fix a broken production!** 🚀
