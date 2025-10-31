# CRITICAL FIX REQUIRED - RLS Policy Configuration Issue

## Diagnostic Test Results

I just ran a comprehensive diagnostic and found the issue:

**Status**: RLS policies exist but are incorrectly configured
**Problem**: The INSERT policy doesn't properly allow uploads from the admin panel (anon role)
**Error**: "new row violates row-level security policy"

---

## The Fix (60 Seconds)

The policies you created earlier don't have the correct configuration. You need to REPLACE the INSERT policy with the correct one.

### Run This SQL Now

1. **Open**: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/sql
2. **Click**: "New Query"
3. **Copy and paste THIS EXACT SQL**:

```sql
-- Fix the INSERT policy to allow anon role uploads
DROP POLICY IF EXISTS "Allow upload via edge function" ON storage.objects;

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
```

4. **Click**: "Run"
5. **Verify**: Should see "Success" (might say "no rows" - that's OK)

---

## Why This Specific Fix?

Your admin panel uses the `anon` (anonymous) key to upload files. The current policy doesn't include `auth.role() = 'anon'` in the correct way, so it blocks all uploads.

This SQL:
1. Drops the incorrectly configured policy
2. Creates it again with the EXACT correct configuration
3. Explicitly allows anon, authenticated, and service_role

---

## After Running This SQL

**Immediately test**:
1. Go to your admin panel
2. Try uploading an image
3. It should work!

**Then tell me**: "Fixed" or "Done"

And I will:
- Run final verification (should pass all tests)
- Confirm system is 100% operational
- Provide deployment report

---

## Why the Previous SQL Didn't Work

When you ran the SQL earlier and got "policy already exists", it meant:
- A policy with that name was already there (possibly from earlier attempts)
- But it had the wrong configuration
- SQL didn't replace it because we need to DROP it first

This new SQL explicitly DROPS the policy first, then creates it with the correct configuration.

---

**Run this SQL right now - it's the final piece needed to make uploads work!**
