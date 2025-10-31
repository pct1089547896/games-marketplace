# 🚀 Quick Vercel Deployment Checklist

## Pre-Deployment Setup ✅

- [ ] Git repository created (GitHub/GitLab/Bitbucket)
- [ ] Project code committed and pushed to repository
- [ ] `.env` file created with correct environment variables
- [ ] Local build tested (`npm run build` works)
- [ ] Vercel account created

## Vercel Configuration ✅

- [ ] Project imported from Git repository
- [ ] Framework: Vite
- [ ] Root Directory: `./`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

## Environment Variables in Vercel ✅

- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] Variables marked for Production, Preview, and Development

## Deployment ✅

- [ ] First deployment successful
- [ ] Theme management system working
- [ ] All 31 themes loading correctly
- [ ] Admin panel accessible
- [ ] Theme effects and animations working
- [ ] Hero section media preserved

## Post-Deployment ✅

- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics enabled (optional)
- [ ] Performance monitoring set up
- [ ] Team members added (if needed)

## Commands for Quick Deploy

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to production
vercel --prod

# 4. View deployments
vercel ls

# 5. Rollback if needed
vercel rollback <deployment-url>
```

## Troubleshooting Commands

```bash
# Check build locally
npm run build

# Clear Vercel cache
vercel rm <deployment-url>

# Preview local build
npm run preview

# Check environment variables
vercel env ls
```

## Deployment URLs

- **Production**: https://your-project.vercel.app
- **Preview**: https://your-project-git-branch.vercel.app
- **Development**: http://localhost:3000

---

**Quick Start**: 1. Push code to Git → 2. Import to Vercel → 3. Set env vars → 4. Deploy! 🎉
