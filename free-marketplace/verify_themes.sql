-- ==============================================================================
-- THEME SYSTEM VERIFICATION SCRIPT
-- ==============================================================================
-- Run this in Supabase SQL Editor to verify your theme system is working
-- Expected: All checks should return positive results
-- ==============================================================================

-- CHECK 1: Tables Exist
-- Expected: Should see 'themes' and 'active_theme' tables
SELECT 
  '✓ CHECK 1: Tables Exist' as status,
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('themes', 'active_theme')
ORDER BY table_name;

-- CHECK 2: Theme Count by Category  
-- Expected: 31 total themes across 7 categories
SELECT 
  '✓ CHECK 2: Themes by Category' as status,
  category,
  COUNT(*) as theme_count,
  STRING_AGG(display_name, ', ' ORDER BY display_name) as theme_names
FROM themes
GROUP BY category
ORDER BY category;

-- CHECK 3: Total Theme Count
-- Expected: 31 themes
SELECT 
  '✓ CHECK 3: Total Count' as status,
  COUNT(*) as total_themes,
  COUNT(CASE WHEN is_preset THEN 1 END) as preset_themes,
  COUNT(CASE WHEN NOT is_preset THEN 1 END) as custom_themes
FROM themes;

-- CHECK 4: Active Theme Status
-- Expected: Should have a theme_id pointing to 'minimalist-clean'
SELECT 
  '✓ CHECK 4: Active Theme' as status,
  at.id,
  at.theme_id,
  t.display_name as active_theme_name,
  t.category,
  t.description,
  at.updated_at
FROM active_theme at
LEFT JOIN themes t ON at.theme_id = t.id
WHERE at.id = 1;

-- CHECK 5: Sample Theme Data
-- Expected: Should see correct CSS variable structure
SELECT 
  '✓ CHECK 5: Sample Theme' as status,
  name,
  display_name,
  category,
  description,
  css_variables->>'primary' as primary_color,
  css_variables->>'background' as background_color,
  is_preset
FROM themes
WHERE name = 'minimalist-clean';

-- CHECK 6: All Theme Names (for reference)
-- Expected: 31 theme names listed
SELECT 
  '✓ CHECK 6: All Themes List' as status,
  ROW_NUMBER() OVER (ORDER BY category, display_name) as number,
  display_name,
  category
FROM themes
ORDER BY category, display_name;

-- ==============================================================================
-- SUMMARY DIAGNOSTIC
-- ==============================================================================
SELECT 
  '=== SUMMARY ===' as diagnostic,
  CASE 
    WHEN (SELECT COUNT(*) FROM themes) = 31 THEN '✅ All 31 themes loaded'
    WHEN (SELECT COUNT(*) FROM themes) > 0 THEN '⚠️  Some themes loaded (' || (SELECT COUNT(*) FROM themes) || '/31)'
    ELSE '❌ No themes found - Run migration!'
  END as theme_status,
  CASE 
    WHEN (SELECT theme_id FROM active_theme WHERE id = 1) IS NOT NULL THEN '✅ Active theme set'
    ELSE '⚠️  No active theme'
  END as active_theme_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'themes') THEN '✅ Tables exist'
    ELSE '❌ Tables missing - Run migration!'
  END as tables_status;

-- ==============================================================================
-- EXPECTED OUTPUT SUMMARY
-- ==============================================================================
-- ✅ All 31 themes loaded
-- ✅ Active theme set  
-- ✅ Tables exist
--
-- If you see ❌ or ⚠️, follow the troubleshooting guide in:
-- /workspace/free-marketplace/THEME_TROUBLESHOOTING.md
-- ==============================================================================
