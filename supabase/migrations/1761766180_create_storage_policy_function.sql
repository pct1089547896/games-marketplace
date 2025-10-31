-- Create a PostgreSQL function to set up storage RLS policies
-- This function can be called with service role privileges

CREATE OR REPLACE FUNCTION setup_hero_storage_policies()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  policy_record record;
  policy_sql text;
BEGIN
  -- Enable RLS on storage.objects if not already enabled
  BEGIN
    EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN others THEN
    -- Table might not exist or already enabled
    NULL;
  END;

  -- Drop existing policies
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "hero_media_upload_policy" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "hero_media_select_public" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "hero_media_select_auth" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "hero_media_update_policy" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "hero_media_delete_policy" ON storage.objects';
  EXCEPTION WHEN others THEN
    -- Policies might not exist
    NULL;
  END;

  -- Create RLS policies
  BEGIN
    EXECUTE 'CREATE POLICY "hero_media_upload_policy" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''hero-media'')';
  EXCEPTION WHEN others THEN
    -- Policy creation failed, might not have permission
    RAISE EXCEPTION 'Failed to create upload policy: %', SQLERRM;
  END;

  BEGIN
    EXECUTE 'CREATE POLICY "hero_media_select_public" ON storage.objects FOR SELECT TO public USING (bucket_id = ''hero-media'')';
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Failed to create public select policy: %', SQLERRM;
  END;

  BEGIN
    EXECUTE 'CREATE POLICY "hero_media_select_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = ''hero-media'')';
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Failed to create auth select policy: %', SQLERRM;
  END;

  BEGIN
    EXECUTE 'CREATE POLICY "hero_media_update_policy" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''hero-media'') WITH CHECK (bucket_id = ''hero-media'')';
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Failed to create update policy: %', SQLERRM;
  END;

  BEGIN
    EXECUTE 'CREATE POLICY "hero_media_delete_policy" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''hero-media'')';
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Failed to create delete policy: %', SQLERRM;
  END;

  -- Grant permissions
  BEGIN
    EXECUTE 'GRANT USAGE ON SCHEMA storage TO authenticated';
    EXECUTE 'GRANT ALL ON storage.objects TO authenticated';
    EXECUTE 'GRANT ALL ON storage.buckets TO authenticated';
  EXCEPTION WHEN others THEN
    -- Grants might fail if already granted
    NULL;
  END;

  -- Return success result
  result := json_build_object(
    'success', true,
    'message', 'Hero storage RLS policies configured successfully',
    'policies_created', array[
      'hero_media_upload_policy',
      'hero_media_select_public', 
      'hero_media_select_auth',
      'hero_media_update_policy',
      'hero_media_delete_policy'
    ]
  );

  RETURN result;
END;
$$;