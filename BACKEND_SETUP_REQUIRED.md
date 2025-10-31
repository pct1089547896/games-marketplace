# BACKEND SETUP REQUIRED - Manual Instructions

## Critical: Complete These Steps to Enable Gallery System

The frontend is fully deployed and functional, but the gallery system requires backend setup. Follow these steps carefully:

---

## Step 1: Create Database Table (5 minutes)

### Instructions:
1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `dieqhiezcpexkivklxcw`
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the following SQL:

```sql
-- Create post_images table for gallery system
CREATE TABLE IF NOT EXISTS public.post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('game', 'program', 'blog')),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON public.post_images(post_id);
CREATE INDEX IF NOT EXISTS idx_post_images_post_type ON public.post_images(post_type);
CREATE INDEX IF NOT EXISTS idx_post_images_display_order ON public.post_images(display_order);

-- Add RLS policies
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- Allow public to read images
DROP POLICY IF EXISTS "Anyone can view post images" ON public.post_images;
CREATE POLICY "Anyone can view post images"
  ON public.post_images
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert images
DROP POLICY IF EXISTS "Authenticated users can insert images" ON public.post_images;
CREATE POLICY "Authenticated users can insert images"
  ON public.post_images
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update images
DROP POLICY IF EXISTS "Authenticated users can update images" ON public.post_images;
CREATE POLICY "Authenticated users can update images"
  ON public.post_images
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete images
DROP POLICY IF EXISTS "Authenticated users can delete images" ON public.post_images;
CREATE POLICY "Authenticated users can delete images"
  ON public.post_images
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Add gallery_theme and gallery_layout columns to existing tables
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS gallery_theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS gallery_layout TEXT DEFAULT 'grid';

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post_images
DROP TRIGGER IF EXISTS update_post_images_updated_at ON public.post_images;
CREATE TRIGGER update_post_images_updated_at
  BEFORE UPDATE ON public.post_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
7. You should see "Success. No rows returned" message

### Verification:
Run this query to verify:
```sql
SELECT * FROM post_images LIMIT 1;
```
You should see column names (no error).

---

## Step 2: Create Storage Bucket (3 minutes)

### Method A: Using Dashboard (Recommended)

1. In your Supabase Dashboard, go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Fill in:
   - **Name**: `gallery-images` (exactly this, no spaces)
   - **Public**: ✓ **Enable** (check the box)
   - **File size limit**: `10485760` (10MB in bytes)
   - **Allowed MIME types**: Click **Add** and enter:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/gif`
     - `image/webp`
4. Click **Create bucket**

### Method B: Using SQL (Alternative)

If you prefer SQL, run this in SQL Editor:

```sql
-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-images',
  'gallery-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
```

### Set RLS Policies for Bucket:

After creating the bucket, run this SQL:

```sql
-- Set up RLS policies for the bucket
CREATE POLICY "Public can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery-images' 
  AND auth.role() = 'authenticated'
);
```

### Verification:
Go to Storage → gallery-images. You should see an empty bucket.

---

## Step 3: Test the Gallery System (5 minutes)

1. **Login to Admin Panel**:
   - Go to: https://1klct3zdsvna.space.minimax.io/admin/login
   - Login with your admin credentials

2. **Edit Existing Content**:
   - Go to **Games**, **Programs**, or **Blog** tab
   - Click **Edit** on any existing item (must be existing, not new)
   - Scroll down to see "Image Gallery" section

3. **Upload Images**:
   - Click or drag images into the upload area
   - Wait for "Uploading..." to complete
   - Images should appear in grid below

4. **Manage Gallery**:
   - **Reorder**: Drag images by the grip handle
   - **Edit**: Click edit icon to add alt text and caption
   - **Delete**: Click X icon to remove image

5. **View on Frontend**:
   - Click "View" or navigate to content detail page
   - Scroll to "Gallery" section
   - Click images to open lightbox
   - Use arrow keys to navigate

---

## New Features Now Available

### 1. Gallery Previews on Content Cards
- **Location**: Homepage, Games page, Programs page, Blog page
- **What you'll see**:
  - Small thumbnail previews at bottom-left of card
  - Badge showing total image count (e.g., "5 photos")
  - First 3 images as thumbnails, "+2" if more

### 2. Admin Gallery Layout Selector
- **Location**: Admin Dashboard → Edit any content
- **Options**:
  - **Grid**: Classic photo grid (default)
  - **Carousel**: Slideshow with navigation buttons
  - **Masonry**: Pinterest-style waterfall layout
  - **Slideshow**: Auto-advancing full-screen presentation
- **How to use**: Select from dropdown, save content

### 3. Dynamic Gallery Layouts
- **What changed**: Galleries now respect admin's layout choice
- **Frontend**: Detail pages automatically use selected layout
- **Fallback**: Defaults to "grid" if not selected

---

## Troubleshooting

### Issue: "post_images table does not exist"
**Solution**: Run Step 1 SQL again, make sure no errors

### Issue: Images not uploading
**Solutions**:
1. Check bucket exists: Storage → should see "gallery-images"
2. Check bucket is public: Storage → gallery-images → Settings
3. Run bucket RLS policies SQL from Step 2

### Issue: "Permission denied" when uploading
**Solution**: Run the RLS policies SQL from Step 2 again

### Issue: Gallery not showing on detail page
**Solutions**:
1. Make sure you uploaded images in admin panel
2. Check browser console for errors
3. Verify images exist: Go to Storage → gallery-images

### Issue: Gallery preview not showing on cards
**Solution**: This is normal if:
- Content has no gallery images uploaded yet
- post_images table doesn't exist yet (complete Step 1)

---

## What Works Without Backend Setup

Even without completing these steps, you can still use:
- ✅ Enhanced templates (12+ professional templates)
- ✅ Template selector in admin panel
- ✅ Rich text editor with all features
- ✅ Content management
- ✅ All existing features

**Gallery features require backend setup to work.**

---

## Complete Setup Checklist

- [ ] Run database SQL (Step 1)
- [ ] Verify post_images table exists
- [ ] Create gallery-images bucket (Step 2)
- [ ] Run bucket RLS policies
- [ ] Test image upload in admin
- [ ] Verify images display on frontend
- [ ] Test gallery preview on content cards
- [ ] Test gallery layout selector
- [ ] Test all 4 layout options

---

## Need Help?

1. **Check Supabase Logs**:
   - Dashboard → Logs → View real-time errors

2. **Browser Console**:
   - Press F12 → Console tab → Look for red errors

3. **Verify Tables**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'post_images';
   ```

4. **Verify Bucket**:
   ```sql
   SELECT * FROM storage.buckets WHERE name = 'gallery-images';
   ```

---

## Summary

**Time Required**: ~15 minutes total
**Difficulty**: Easy (copy-paste SQL)
**Result**: Full gallery system with previews, layouts, and management

Once complete, your CMS will have:
- Multi-image galleries for all content
- 4 beautiful layout options
- Gallery previews on all cards
- Drag-and-drop management
- Professional lightbox viewer
- Full admin control

**Start with Step 1 now!** 🚀
