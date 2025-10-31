# QUICK START: Complete Gallery Setup in 3 Minutes

## Current Status
✅ Database: Ready (all tables and columns exist)
❌ Storage: Missing (bucket not created)

## 3-Minute Setup

### STEP 1: Create Storage Bucket (90 seconds)

**Open this link**: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/storage/buckets

**Click**: "New bucket" or "Create bucket"

**Enter**:
- Name: `gallery-images` (exactly this, no spaces)
- Public: **Turn ON** ✓
- File size: `10485760`

**Click**: "Create bucket"

---

### STEP 2: Apply Policies (90 seconds)

**Open this link**: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/sql

**Click**: "New Query"

**Copy-paste this** (all 4 policies):

```sql
DROP POLICY IF EXISTS "Public read access for gallery-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload via edge function" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;

CREATE POLICY "Public read access for gallery-images" 
ON storage.objects FOR SELECT USING (bucket_id = 'gallery-images');

CREATE POLICY "Allow upload via edge function" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'gallery-images' AND (auth.role() = 'anon' OR auth.role() = 'authenticated' OR auth.role() = 'service_role'));

CREATE POLICY "Authenticated users can update gallery images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'gallery-images' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));

CREATE POLICY "Authenticated users can delete gallery images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'gallery-images' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
```

**Click**: "Run"

**Verify**: See "Success" message

---

### STEP 3: Test (30 seconds)

1. Go to: https://1klct3zdsvna.space.minimax.io
2. Log in to admin
3. Create/edit a blog post
4. Upload an image in the gallery section
5. Should work without errors!

---

## That's It!

After these 3 steps, your gallery system is fully operational.

**Tell me when you've completed these steps and I'll verify everything is working.**

---

## Why These Steps?

- **Step 1**: Creates the actual storage container for images
- **Step 2**: Gives your admin panel permission to upload images
- **Step 3**: Confirms everything works

No coding required - just copy, paste, click!
