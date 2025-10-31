# 🚀 Vercel Deployment Guide for Your Marketplace

This guide will help you deploy your React marketplace with theme management system to Vercel for free hosting and fast global CDN.

## 📋 Prerequisites

- GitHub, GitLab, or Bitbucket account
- Vercel account (free tier available)
- Your project should be in a Git repository

## 🔧 Step 1: Prepare Your Project

### 1.1 Update Environment Variables
Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://dieqhiezcpexkivklxcw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXFoaWV6Y3BleGtpdmtseGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDQ0ODIsImV4cCI6MjA3NzI4MDQ4Mn0.ZPl_HnCEmr9tPDhCOZ_Ks7zyjHIZLEu3cDFsEQYPYbo

# Vercel automatically uses VITE_ prefixed variables for frontend
```

### 1.2 Update Code for Production
Make sure your code uses the correct environment variable names:

```typescript
// In your Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### 1.3 Test Build Locally
```bash
# Install dependencies
npm install

# Test production build
npm run build

# Preview production build
npm run preview
```

## 🔧 Step 2: Push to Git Repository

### 2.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit with theme management system"
```

### 2.2 Push to GitHub/GitLab/Bitbucket
```bash
# Add your repository
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to main branch
git branch -M main
git push -u origin main
```

## 🔧 Step 3: Deploy to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub/GitLab/Bitbucket
3. Import your repository

### 3.2 Configure Project Settings
1. **Framework Preset**: Vite
2. **Root Directory**: `./` (default)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 3.3 Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL = https://dieqhiezcpexkivklxcw.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXFoaWV6Y3BleGtpdmtseGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDQ0ODIsImV4cCI6MjA3NzI4MDQ4Mn0.ZPl_HnCEmr9tPDhCOZ_Ks7zyjHIZLEu3cDFsEQYPYbo
```

### 3.4 Deploy
Click "Deploy" - Vercel will automatically build and deploy your project!

## 🔧 Step 4: Configure Vercel Settings

### 4.1 Vercel.json Configuration
Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "framework": "vite",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

### 4.2 Update package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "vercel --prod"
  }
}
```

## 🌐 Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `yourmarketplace.com`)
3. Follow DNS configuration instructions

### 5.2 SSL Certificate
Vercel automatically provides free SSL certificates for custom domains.

## 📊 Step 6: Advanced Configuration

### 6.1 Performance Optimization
Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin/dashboard",
      "permanent": false
    }
  ]
}
```

### 6.2 Analytics
Enable Vercel Analytics:
1. Vercel Dashboard → Analytics
2. Add to your application:

```typescript
// In main.tsx
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  )
}
```

## 🔄 Step 7: Continuous Deployment

### 7.1 Automatic Deployments
- Every push to main branch = new deployment
- Previews for pull requests
- Rollback to any previous deployment

### 7.2 Deploy Commands
```bash
# Deploy from command line
npm install -g vercel
vercel login
vercel --prod
```

## 🛠️ Troubleshooting

### Build Errors
```bash
# Check build locally
npm run build

# Clear Vercel cache
vercel rm <deployment-url>
```

### Environment Variables
- Ensure all `VITE_` prefixed variables are set
- Check Vercel dashboard → Settings → Environment Variables

### Routing Issues
- Add `_redirects` file: `/* /index.html 200`
- Or use `vercel.json` routing configuration

## 🎯 Final Checklist

- [ ] Git repository created and pushed
- [ ] Vercel account set up
- [ ] Environment variables configured
- [ ] Build settings correct (Vite, dist folder)
- [ ] Project deployed successfully
- [ ] Theme management system working
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

## 🎉 Success!

Your marketplace is now deployed on Vercel with:
- ⚡ Fast global CDN
- 🔄 Automatic deployments
- 📊 Built-in analytics
- 🛡️ Free SSL certificate
- 🎯 Perfect for React apps

Your theme management system with 31 themes and dramatic effects will work perfectly on Vercel!

## 💡 Pro Tips

1. **Branches**: Use feature branches for testing
2. **Preview Deployments**: Every PR gets a preview URL
3. **Rollback**: Easily rollback to any previous deployment
4. **Monitoring**: Use Vercel Analytics to track performance
5. **Functions**: Add serverless functions for advanced features

---

**Need help?** Check Vercel's documentation at [vercel.com/docs](https://vercel.com/docs)
