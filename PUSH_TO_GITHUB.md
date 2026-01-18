# Push to GitHub - Quick Commands

Since you already have the repository at [https://github.com/isaacoj94/class-booking-vc](https://github.com/isaacoj94/class-booking-vc), run these commands in your terminal:

## Step 1: Initialize Git and Add Remote

```bash
cd "/Users/isaacjeong/vibe coding test"

# Initialize git repository
git init

# Set main branch
git branch -M main

# Add your GitHub repository as remote
git remote add origin https://github.com/isaacoj94/class-booking-vc.git

# Or if remote already exists, update it:
# git remote set-url origin https://github.com/isaacoj94/class-booking-vc.git
```

## Step 2: Add All Files and Commit

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Ballet booking platform with AI integration"
```

## Step 3: Push to GitHub

```bash
# Push to GitHub
git push -u origin main
```

If you get authentication errors, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create isaacoj94/class-booking-vc --public --source=. --remote=origin --push
```

---

## After Pushing

Once the code is on GitHub, you can:

1. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import repository: `isaacoj94/class-booking-vc`
   - Add environment variables (see `DEPLOYMENT.md`)
   - Deploy!

2. **Or continue with local development**:
   - Set up `.env.local` file
   - Run `npm install`
   - Run `npm run db:generate`
   - Start dev server: `npm run dev`

---

**Your Repository**: https://github.com/isaacoj94/class-booking-vc

Ready to push! 🚀
