# RLS Policy Fix - Complete Solution Guide

## 🚨 Current Status
The hero media upload is failing with: **"new row violates row-level security policy"**

## ✅ Solution 1: Automated Fix (Try First)

**New Deployment:** https://gcpk91aisfxs.space.minimax.io/admin/hero-management

The updated application now includes:
1. **Automatic bucket creation** - Ensures hero-media bucket exists
2. **Edge function call** - Attempts to set up RLS policies automatically
3. **Fallback error handling** - Clear instructions if manual intervention needed

### Test the Fix
1. Go to: https://gcpk91aisfxs.space.minimax.io/admin/hero-management
2. Try uploading an image file
3. Check browser console for setup messages

## 🛠️ Solution 2: Manual RLS Setup (If Automated Fails)

If the automated fix doesn't work, run this SQL in your Supabase SQL Editor:

### Steps:
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a **new query**
4. Copy and paste the entire content from `MANUAL_RLS_SETUP.sql`
5. Click **Run**

### What This Does:
- Enables RLS on storage.objects table
- Creates 5 RLS policies for hero-media bucket:
  - `hero_media_upload_policy` - Allows authenticated users to upload
  - `hero_media_select_public` - Allows public to view files
  - `hero_media_select_auth` - Allows authenticated users to view files  
  - `hero_media_update_policy` - Allows authenticated users to update files
  - `hero_media_delete_policy` - Allows authenticated users to delete files
- Ensures hero-media bucket exists with public access
- Grants necessary permissions

## 📋 RLS Policies Created:

```sql
-- Upload Policy
CREATE POLICY "hero_media_upload_policy" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'hero-media' AND auth.jwt() ->> 'role' = 'authenticated');

-- Public View Policy  
CREATE POLICY "hero_media_select_public" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'hero-media');

-- Authenticated View Policy
CREATE POLICY "hero_media_select_auth" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'hero-media');

-- Update Policy
CREATE POLICY "hero_media_update_policy" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'hero-media') WITH CHECK (bucket_id = 'hero-media');

-- Delete Policy
CREATE POLICY "hero_media_delete_policy" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'hero-media');
```

## 🔧 If Issues Persist

### Check These:
1. **Bucket exists**: Confirm 'hero-media' bucket in Storage section
2. **Bucket is public**: Bucket settings → Public access = ON
3. **RLS enabled**: Storage.objects table should have RLS enabled
4. **Policies exist**: Query `SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE 'hero_media_%';`

### Manual Verification:
```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'hero-media';

-- Check if policies exist
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE 'hero_media_%';

-- Check RLS is enabled
SELECT relname, relrowsecurity FROM pg_class 
WHERE relname = 'objects' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');
```

## 📱 Test Upload
After running the manual SQL, test at:
**https://gcpk91aisfxs.space.minimax.io/admin/hero-management**

## 🎯 Expected Result
- Image uploads should succeed without RLS errors
- Uploaded media should be publicly accessible
- Admin interface should show uploaded files

---

## 🔍 Technical Details

**Root Cause:** Row Level Security (RLS) policies weren't properly configured for the storage.objects table, preventing authenticated users from inserting files into the hero-media bucket.

**Solution:** Create comprehensive RLS policies that allow authenticated users to perform all necessary operations on hero-media bucket files while keeping the bucket publicly accessible.

**Project ID:** dieqhiezcpexkivklxcw  
**Storage Bucket:** hero-media  
**Edge Functions:** create-storage-rls (for automated setup)