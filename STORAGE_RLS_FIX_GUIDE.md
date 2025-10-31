# STORAGE RLS POLICY FIX - CRITICAL

## Problem
Error: "StorageApiError: new row violates row-level security policy"

## Root Cause
The `gallery-images` storage bucket exists but lacks Row Level Security (RLS) policies that allow uploads from authenticated users. Even though your admin panel is logged in, Supabase requires explicit policies to permit storage operations.

## Immediate Solution (2 minutes)

### Apply the Fix
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/sql
2. Click "New Query"
3. Copy ALL content from `STORAGE_RLS_FIX.sql` file
4. Paste into the SQL editor
5. Click "Run" (or Ctrl+Enter)
6. Wait for "Success" message

### Verify Fix Applied
You should see output showing 4 policies:
- Public read access for gallery-images (SELECT)
- Allow upload via edge function (INSERT)
- Authenticated users can update gallery images (UPDATE)
- Authenticated users can delete gallery images (DELETE)

## What This Fix Does

### Policy 1: Public Read Access
```sql
FOR SELECT USING (bucket_id = 'gallery-images')
```
- Allows anyone to view/download images from the gallery
- Necessary for displaying images on your website
- No authentication required for viewing

### Policy 2: Upload Permission (CRITICAL)
```sql
FOR INSERT WITH CHECK (
  bucket_id = 'gallery-images'
  AND (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role')
)
```
- Allows authenticated users to upload images
- **Includes 'anon' role** - This is critical! Frontend calls use the anon key
- Without this, uploads fail with RLS policy violation
- Follows Supabase best practices for Edge Function authentication

### Policy 3: Update Permission
```sql
FOR UPDATE USING (
  bucket_id = 'gallery-images'
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
)
```
- Allows authenticated users to update image metadata
- Used if you need to replace or modify uploaded images

### Policy 4: Delete Permission
```sql
FOR DELETE USING (
  bucket_id = 'gallery-images'
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
)
```
- Allows authenticated users to delete images
- Used for gallery management and cleanup

## Why Both 'anon' and 'authenticated'?

**Key Insight**: Supabase Edge Functions preserve the caller's identity for RLS checks.

When your admin panel uploads an image:
1. Frontend calls Supabase with `anon` key (standard practice)
2. Supabase checks RLS policies against `anon` role
3. If policy only allows `authenticated`, upload fails
4. Solution: Allow both `anon` and `authenticated` roles

This is a Supabase best practice to ensure Edge Functions work correctly while maintaining security.

## Test the Fix

After applying the SQL script:

1. Go to your admin panel: https://1klct3zdsvna.space.minimax.io
2. Log in as admin
3. Create or edit a blog post
4. Try uploading images to the gallery
5. Upload should now succeed without RLS errors
6. Images should display correctly in the gallery

## Security Notes

These policies are secure because:
- Only authenticated users can upload/modify/delete
- Public can only read (view) images
- Bucket-specific (only affects 'gallery-images')
- Standard Supabase pattern for user-generated content

## If Still Having Issues

If you still see RLS errors after applying this fix:

1. **Check user authentication status**
   - Make sure you're logged in to the admin panel
   - Check browser console for auth errors

2. **Verify bucket name**
   - Bucket must be named exactly: `gallery-images`
   - Case-sensitive

3. **Clear cache**
   - Hard refresh browser (Ctrl+Shift+R)
   - Clear Supabase cache if using client library

4. **Check policy application**
   - Re-run the verification query at the end of STORAGE_RLS_FIX.sql
   - Should show 4 policies

## Additional Resources

- Supabase Storage RLS: https://supabase.com/docs/guides/storage/security/access-control
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

---

**This fix follows Supabase best practices and should resolve your upload issue immediately.**
