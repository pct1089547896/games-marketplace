-- CRITICAL FIX: Storage RLS Policies for gallery-images bucket
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/sql

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for gallery-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload via edge function" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Policy 1: Public read access (anyone can view images)
CREATE POLICY "Public read access for gallery-images" 
ON storage.objects
FOR SELECT 
USING (bucket_id = 'gallery-images');

-- Policy 2: Allow uploads via both anon and authenticated roles
-- CRITICAL: Must include 'anon' role because frontend calls use anon key
CREATE POLICY "Allow upload via edge function" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'gallery-images'
  AND (
    auth.role() = 'anon' 
    OR auth.role() = 'authenticated'
    OR auth.role() = 'service_role'
  )
);

-- Policy 3: Allow updates for authenticated users
CREATE POLICY "Authenticated users can update gallery images" 
ON storage.objects
FOR UPDATE 
USING (
  bucket_id = 'gallery-images'
  AND (
    auth.role() = 'authenticated'
    OR auth.role() = 'service_role'
  )
);

-- Policy 4: Allow deletes for authenticated users
CREATE POLICY "Authenticated users can delete gallery images" 
ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'gallery-images'
  AND (
    auth.role() = 'authenticated'
    OR auth.role() = 'service_role'
  )
);

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%gallery-images%'
ORDER BY policyname;

-- Expected output: Should show 4 policies for gallery-images bucket
-- 1. Public read access for gallery-images (SELECT)
-- 2. Allow upload via edge function (INSERT)
-- 3. Authenticated users can update gallery images (UPDATE)
-- 4. Authenticated users can delete gallery images (DELETE)
