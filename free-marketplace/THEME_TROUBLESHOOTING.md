# Theme System Troubleshooting Guide

## Issue: "After importing I don't see any styles"

If you're not seeing themes after running the migration, follow these steps:

### Step 1: Verify Database Migration Was Run

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your project → SQL Editor
3. **Run this verification query**:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('themes', 'active_theme');

-- Check if themes were imported
SELECT category, COUNT(*) as count 
FROM themes 
GROUP BY category 
ORDER BY category;

-- Check active theme
SELECT * FROM active_theme;
```

**Expected Results:**
- Should see both `themes` and `active_theme` tables
- Should see 31 themes across 7 categories
- `active_theme` should have a theme_id pointing to "minimalist-clean"

### Step 2: If Tables Don't Exist - Run Migration

If the verification shows no tables, you need to run the migration:

1. **Open**: `/workspace/free-marketplace/supabase/migrations/create_theme_management_tables.sql`
2. **Copy**: The ENTIRE file content (all 465 lines)
3. **Paste**: Into Supabase SQL Editor
4. **Run**: Click "Run" button
5. **Wait**: For success message

### Step 3: If Themes Don't Show in Admin Panel

1. **Open Browser Console**: 
   - Chrome/Edge: Press F12
   - Check Console tab for errors

2. **Check for common errors**:
   - ❌ "Failed to load themes" → Database connection issue
   - ❌ "relation themes does not exist" → Migration not run
   - ❌ "permission denied" → RLS policy issue

3. **Try these fixes**:

   **Fix A: Reload themes manually**
   ```javascript
   // In browser console, run:
   window.location.reload(true);
   ```

   **Fix B: Check Supabase connection**
   ```javascript
   // In browser console, test connection:
   const { data, error } = await supabase.from('themes').select('count');
   console.log('Themes count:', data, error);
   ```

   **Fix C: Verify RLS policies**
   ```sql
   -- Run in Supabase SQL Editor:
   SELECT * FROM themes LIMIT 1;
   ```
   If this works, RLS is fine.

### Step 4: Import Themes Manually (Fallback)

If themes still don't appear:

1. **Go to**: https://qglphm31wonz.space.minimax.io/admin/dashboard
2. **Click**: "Themes" tab
3. **Click**: "Import Themes" button (purple banner)
4. **Wait**: For "Imported 31 themes" message

### Step 5: Common Issues & Solutions

#### Issue: "No themes found in this category"
- **Cause**: Migration not run or failed
- **Fix**: Run Step 2 above

#### Issue: "Loading themes..." never completes
- **Cause**: Supabase credentials incorrect
- **Fix**: Check `/workspace/free-marketplace/src/lib/supabase.ts` has correct URL and key

#### Issue: Themes load but styles don't apply
- **Cause**: CSS variables not being applied
- **Fix**: Check browser console for errors, verify theme was clicked "Apply" not just "Preview"

#### Issue: "Permission denied for table themes"
- **Cause**: RLS policies not created
- **Fix**: Re-run migration file completely

### Step 6: Verify Theme Application

After themes load successfully:

1. **Click** any theme's "Preview" button
2. **Check** if colors change on the page
3. **Click** "Apply" to make it permanent
4. **Refresh** page to verify theme persists

### Step 7: Check Active Theme

Run this query in Supabase:

```sql
-- See which theme is currently active
SELECT 
  t.display_name, 
  t.category, 
  t.description,
  at.updated_at as activated_at
FROM active_theme at
LEFT JOIN themes t ON at.theme_id = t.id;
```

### Quick Diagnostic Command

Run ALL of these in Supabase SQL Editor:

```sql
-- Complete diagnostic
SELECT 
  'Tables exist' as check_type,
  COUNT(*) as result
FROM information_schema.tables 
WHERE table_name IN ('themes', 'active_theme')

UNION ALL

SELECT 
  'Themes count' as check_type,
  COUNT(*) as result
FROM themes

UNION ALL

SELECT 
  'Active theme set' as check_type,
  CASE WHEN theme_id IS NOT NULL THEN 1 ELSE 0 END as result
FROM active_theme WHERE id = 1;
```

**Expected Output:**
```
check_type       | result
-----------------+-------
Tables exist     | 2
Themes count     | 31
Active theme set | 1
```

## Still Having Issues?

If none of the above works:

1. **Check Browser**: Try a different browser or incognito mode
2. **Clear Cache**: Hard refresh with Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Verify Login**: Make sure you're logged in as admin
4. **Check Network**: Open DevTools → Network tab, look for failed requests

## Success Indicators

You'll know themes are working when:

✅ Admin panel shows "31 Preset Themes Pre-loaded" green banner
✅ Theme cards display with color previews
✅ Clicking "Preview" changes page colors instantly
✅ Clicking "Apply" persists theme after refresh
✅ Category filters show correct counts (Gaming: 4, Holiday: 4, etc.)

## Need More Help?

The theme system has these files for reference:
- `/workspace/free-marketplace/THEME_MANAGEMENT_GUIDE.md` - Complete usage guide
- `/workspace/free-marketplace/MANUAL_DB_SETUP.md` - Database setup instructions
- `/workspace/free-marketplace/QUICK_START_ADD_THEME.md` - How to add custom themes
