# Database Setup Instructions

## Theme Management System

The theme management system includes database tables and 31 pre-loaded theme presets. When you run the migration, all themes will be automatically available.

### What's Included:

- **Automatic Theme Loading**: 31 professionally designed themes across 7 categories
- **Default Theme**: "Minimalist Clean" is pre-selected as the active theme
- **No Manual Import Required**: All themes are ready to use immediately after migration

### Theme Categories:

1. Gaming Themes (4): Gamer Razer, Cyberpunk, Retro Arcade, Neon Gaming
2. Holiday Themes (4): Halloween Spooky, Christmas Cheer, New Year Sparkle, Thanksgiving Harvest
3. Seasonal Themes (4): Spring Floral, Summer Beach, Autumn Nature, Winter Snow
4. Style Themes (5): Minimalist Clean, Glass Morphism, Neon Glow, Gradient Pro, Monochrome
5. Industry Themes (5): Corporate Clean, Creative Agency, Photography Portfolio, E-commerce Modern, Tech Startup
6. Color Themes (5): Pastel Dreams, Neon Vibes, Colorful Pop, Dark Mode Pro, Ocean Blue
7. Special Themes (4): Space Explorer, Steampunk Vintage, Art Gallery, Social Media Style

### Database Migration Steps:

1. Go to your Supabase project at https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Copy the COMPLETE SQL from `supabase/migrations/create_theme_management_tables.sql`
5. Click "Run"

### Important Notes:

- The migration file is approximately 450+ lines and includes all 31 theme configurations
- Running the migration will create tables AND populate them with all preset themes
- The "Minimalist Clean" theme will be automatically set as the active theme
- After migration, navigate to `/admin/dashboard` > Themes tab to see all themes
- **No manual "Import Themes" step is required** - themes are pre-loaded!

## After Running the Migration

1. Go to `/admin/dashboard` in your deployed application
2. Click the "Themes" tab
3. You should immediately see all 31 preset themes available
4. The "Minimalist Clean" theme will be marked as active
5. Start using themes right away!

## Verification

To verify the tables were created successfully and themes were loaded, run this in SQL Editor:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('themes', 'active_theme');

-- Count loaded themes
SELECT category, COUNT(*) as theme_count
FROM themes
GROUP BY category
ORDER BY category;

-- Check active theme
SELECT t.display_name, t.category
FROM active_theme at
JOIN themes t ON at.theme_id = t.id;
```

Expected results:
- Both tables should be listed
- 31 themes should be loaded across 7 categories
- "Minimalist Clean" should be the active theme

## Troubleshooting

### If themes don't appear in the admin panel:

1. Verify RLS policies are correct (run migration again if needed)
2. Check browser console for errors
3. Verify you're logged in as an admin user
4. Clear browser cache and reload

### If you need to re-import themes:

The "Import Themes" button in the admin panel is still available for:
- Re-importing if themes were accidentally deleted
- Loading custom themes you've added to `src/data/themePresets.ts`
- Updating existing theme definitions

## Adding Custom Themes

Even with auto-loading, you can still add custom themes:

1. Edit `src/data/themePresets.ts`
2. Add your theme configuration to the appropriate category array
3. Either:
   - Re-run the migration (if starting fresh), OR
   - Use the "Import Themes" button in the admin panel to load new themes only
