# URGENT FIX - Gallery Upload Error

## Problem
Error message: "Could not find the 'gallery_layout' column of 'blog_posts' in the schema cache"

## Immediate Solution (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/sql
2. Log in to your Supabase account

### Step 2: Run the Fix Script
1. Click "New Query"
2. Copy the entire content from `URGENT_DATABASE_FIX.sql` file
3. Paste it into the SQL editor
4. Click "Run" or press Ctrl+Enter

### Step 3: Create Storage Bucket
1. Go to: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/storage/buckets
2. Click "Create bucket"
3. Enter bucket name: `gallery-images`
4. Make it PUBLIC (toggle the public option)
5. Set file size limit: 10MB
6. Click "Create bucket"

### Step 4: Set Storage Policies
After creating the bucket, go to the bucket settings and ensure these policies exist:

```sql
-- Allow public to read files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery-images');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery-images');
```

### Step 5: Test
1. Go to your admin panel: https://1klct3zdsvna.space.minimax.io
2. Try uploading images to a blog post
3. The upload should now work without errors

## What This Fix Does

1. **Adds missing columns** to blog_posts, games, and programs tables:
   - `gallery_theme` (default: 'default')
   - `gallery_layout` (default: 'grid')

2. **Creates post_images table** to store gallery images with:
   - Multiple images per post
   - Display order
   - Captions and alt text
   - Thumbnail URLs

3. **Sets up RLS policies** for security:
   - Public can view images
   - Authenticated users can manage images

4. **Creates storage bucket** for actual image files

## Verification

After running the script, you should see success messages at the bottom of the SQL editor confirming:
- `blog_posts columns added: true`
- `post_images table created: true`

If you see any errors, please share them and I'll help resolve them immediately.
