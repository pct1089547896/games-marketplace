# FIXED: Hero Upload Storage Permission Issue

## ❌ The Problem
You're getting "ERROR: 42501: must be owner of table objects" because:
- Direct table access to `storage.objects` requires owner privileges
- Supabase Storage has its own API for bucket management

## ✅ SOLUTION: Create Bucket via Storage API

### Method 1: Create Bucket via Supabase Dashboard (Recommended)

#### Step 1: Access Storage
1. Go to: https://supabase.com/dashboard
2. Select your project: `dieqhiezcpexkivklxcw`
3. Navigate to **Storage** in the left sidebar

#### Step 2: Create Bucket
1. Click **"Create a new bucket"**
2. Name: `hero-media`
3. **Check "Public bucket"** ✅
4. Click **"Create bucket"**

#### Step 3: Apply RLS Policies (SQL)
Go to **SQL Editor** and run this SAFE version:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload hero media
CREATE POLICY "Allow authenticated users to upload hero media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hero-media');

-- Allow authenticated users to delete hero media  
CREATE POLICY "Allow authenticated users to delete hero media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'hero-media');

-- Allow public users to view hero media
CREATE POLICY "Allow public to view hero media" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'hero-media');

-- Allow authenticated users to view hero media
CREATE POLICY "Allow authenticated users to view hero media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'hero-media');
```

### Method 2: Programmatic Creation (Alternative)

If you prefer to create the bucket programmatically, I'll update the code to handle bucket creation on first upload.

## 🎯 **Quick Fix Instructions**

### Option A: Supabase Dashboard (Fastest)
1. **Storage → Create bucket → hero-media → Public bucket ✅**
2. **SQL Editor → Run the safe policies above**
3. **Test uploads in admin panel**

### Option B: Automated (I'll fix the code)
If you want me to update the code to automatically create the bucket, I can do that too.

## 📋 **Expected Results**

After creating the bucket correctly:
- ✅ Upload images and videos to hero-media bucket
- ✅ Use uploaded media as hero backgrounds  
- ✅ Background videos auto-play on homepage
- ✅ Admin panel shows media library with previews

## 🔧 **Testing After Fix**

1. Go to: https://khgu7ohtdxvh.space.minimax.io/admin/login
2. **Hero Management → Media Library**
3. Upload a test image (JPG/PNG)
4. Upload a test video (MP4)
5. Set as background in Design tab
6. Preview changes live

## 🚨 **Troubleshooting**

### If uploads still fail:
1. **Verify bucket is public**: Check Storage → hero-media bucket settings
2. **Check policies**: Ensure all 4 RLS policies are created
3. **Browser console**: Check for specific error messages

### If videos don't play:
1. **File format**: Use MP4 (most compatible)
2. **File size**: Keep under 10MB
3. **Browser test**: Try in different browsers

## 📱 **Next Steps**

Once the bucket is created and policies are applied:
- The hero management system will be fully functional
- You can upload images and videos for hero backgrounds
- All 4 layout templates support video backgrounds
- Live preview works with desktop/mobile toggle

**Ready to implement? Choose Option A or B above!**