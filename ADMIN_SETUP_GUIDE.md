# Admin Account Setup Guide

## Overview
Your marketplace admin panel is accessible at: **https://06v4i7ut5ixl.space.minimax.io/admin/login**

To access the admin dashboard, you need to create an admin user account in Supabase.

---

## Step-by-Step Setup Instructions

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Log in to your Supabase account
3. Select your project: **dieqhiezcpexkivklxcw**
   - Or navigate directly to: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw

### Step 2: Create Admin User
1. In the left sidebar, click on **Authentication** (🔐 icon)
2. Click on **Users** tab
3. Click the **Add user** button (top right)
4. Choose **Create new user** option
5. Fill in the form:
   - **Email**: Enter your preferred admin email (e.g., `admin@yourdomain.com`)
   - **Password**: Create a strong password (minimum 6 characters)
   - **Auto Confirm User**: ✅ **Enable this option** (important!)
6. Click **Create user**

### Step 3: Log Into Admin Panel
1. Navigate to: https://06v4i7ut5ixl.space.minimax.io/admin/login
2. Enter the email and password you just created
3. Click **Sign In**
4. You'll be redirected to the admin dashboard

---

## Admin Credentials (Example)

Choose your own credentials when setting up:

```
Email: admin@yourdomain.com
Password: [Your secure password]
```

**Important Notes:**
- ⚠️ **Auto Confirm User** must be enabled when creating the user, otherwise you'll need to verify the email
- 🔒 Store your credentials securely
- 🔑 You can create multiple admin accounts if needed by repeating Step 2

---

## Admin Dashboard Features

Once logged in, you can:
- ✅ Add new games and programs
- ✅ Upload images for listings
- ✅ Create and publish blog posts
- ✅ Manage all marketplace content
- ✅ Feature items on the homepage

---

## Troubleshooting

### "Invalid login credentials" error
- Double-check your email and password
- Ensure the user was created with **Auto Confirm User** enabled
- Try resetting the password in Supabase Authentication panel

### Can't access Supabase dashboard
- Verify you're logged into the correct Supabase account
- Ensure you have access to project ID: `dieqhiezcpexkivklxcw`

### Need to reset password
1. Go to Supabase Dashboard → Authentication → Users
2. Find your admin user
3. Click on the user row
4. Click **Reset Password** or **Send Magic Link**

---

## Security Recommendations

1. **Use a strong password**: Minimum 12 characters with letters, numbers, and symbols
2. **Keep credentials private**: Don't share admin access
3. **Regular password changes**: Update your password periodically
4. **Monitor access**: Check Authentication → Users regularly for unauthorized accounts

---

## Quick Reference

| Item | Value |
|------|-------|
| Admin Login URL | https://06v4i7ut5ixl.space.minimax.io/admin/login |
| Supabase Project ID | dieqhiezcpexkivklxcw |
| Supabase Dashboard | https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw |

---

**Need Help?** If you encounter any issues during setup, verify that:
- ✓ You're creating the user in the correct Supabase project
- ✓ "Auto Confirm User" is checked
- ✓ Email format is valid
- ✓ Password meets minimum requirements (6+ characters)
