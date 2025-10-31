# Admin Content Upload Fix - RLS Policy Issue

## 🚨 **CRITICAL ISSUE IDENTIFIED**

The admin content upload is failing because of Row Level Security (RLS) policy configuration.

### **Root Cause**
The RLS policies for `games`, `programs`, and `blog_posts` tables only allow:
- `auth.role() = 'anon'` (anonymous users)
- `auth.role() = 'service_role'` (service role)

But when admin users log in, they become `auth.role() = 'authenticated'`, which the current policies **DO NOT ALLOW** to insert content.

### **Solution**
Update the RLS policies to also allow `authenticated` users.

### **How to Fix**

1. **Go to your Supabase Dashboard**:
   - Navigate to https://app.supabase.com/project/dieqhiezcpexkivklxcw
   - Go to **SQL Editor**

2. **Run the Migration**:
   Copy and paste the entire content from `/workspace/supabase/migrations/1761738200_fix_admin_rls_policies.sql` into the SQL Editor and execute it.

3. **Verification**:
   After running the migration, test the admin content upload again. The enhanced error logging should now show successful saves.

### **What the Fix Does**
- Updates all admin policies to include `auth.role() = 'authenticated'`
- Allows logged-in admin users to create, update, and delete content
- Preserves existing security for anonymous and service role access

### **After Applying the Fix**
1. Test admin content upload (games, programs, blog posts)
2. Check browser console for success messages instead of permission errors
3. Verify content appears in the admin dashboard after creation

### **Status**
- ❌ **Issue**: RLS policies blocking authenticated users
- ✅ **Solution**: Migration script created
- ⏳ **Action Required**: Apply migration in Supabase SQL Editor