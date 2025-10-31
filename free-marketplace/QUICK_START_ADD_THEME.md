# Quick Start: Adding New Themes

This guide shows you how to add a new theme to the Free Marketplace in just **2 simple steps**.

## Step 1: Define Your Theme

Open `src/data/themePresets.ts` and find the appropriate category array:

- `gamingThemes` - Gaming-related themes
- `holidayThemes` - Holiday-specific themes
- `seasonalThemes` - Seasonal themes (spring, summer, fall, winter)
- `styleThemes` - Design style themes (minimalist, glassmorphism, etc.)
- `industryThemes` - Industry-specific themes (corporate, creative, etc.)
- `colorThemes` - Color-focused themes
- `specialThemes` - Unique special themes

Add your theme object to the array:

```typescript
{
  name: 'my-awesome-theme',          // Unique identifier (lowercase-hyphenated)
  displayName: 'My Awesome Theme',   // Display name in UI
  description: 'A description',       // Brief description
  category: 'gaming',                 // Category from above
  cssVariables: {
    primary: '#ff0000',              // Main color
    primaryHover: '#cc0000',         // Hover state
    secondary: '#0000ff',            // Secondary color
    background: '#ffffff',           // Page background
    backgroundAlt: '#f5f5f5',        // Card/section background
    text: '#000000',                 // Text color
    textMuted: '#666666',            // Secondary text
    border: '#e0e0e0',               // Borders
    success: '#00ff00',              // Success messages
    warning: '#ffaa00',              // Warnings
    error: '#ff0000',                // Errors
    info: '#0066cc',                 // Info messages
  },
}
```

## Step 2: Import to Database

1. Go to `/admin/dashboard`
2. Click the "Themes" tab
3. Click "Import Themes" button
4. Done! Your theme is now available

## Example: Adding a "Fortnite" Theme

```typescript
// In src/data/themePresets.ts
export const gamingThemes: ThemePreset[] = [
  // ... existing themes ...
  
  // NEW THEME
  {
    name: 'fortnite-battle',
    displayName: 'Fortnite Battle',
    description: 'Victory Royale themed design',
    category: 'gaming',
    cssVariables: {
      primary: '#7b2cbf',
      primaryHover: '#6420a0',
      secondary: '#00d9ff',
      background: '#0f0f1a',
      backgroundAlt: '#1a1a2e',
      text: '#ffffff',
      textMuted: '#a0a0b0',
      border: '#7b2cbf',
      success: '#00ff88',
      warning: '#ffbb00',
      error: '#ff0066',
      info: '#00d9ff',
    },
  },
];
```

Then import via Admin Panel. **That's it!**

## Color Picking Tips

### Tools
- Use [Coolors.co](https://coolors.co/) for palette generation
- Use [Adobe Color](https://color.adobe.com/) for advanced schemes
- Use browser DevTools color picker for precision

### Best Practices
- **Contrast**: Ensure text is readable on backgrounds
- **Accessibility**: Check WCAG contrast ratios
- **Harmony**: Use color theory (complementary, analogous, triadic)
- **Testing**: Preview on different screens/lighting

### Common Color Schemes

**Dark Theme Pattern:**
```typescript
background: '#0a0a0a',      // Very dark
backgroundAlt: '#1a1a1a',   // Slightly lighter
text: '#ffffff',            // White text
textMuted: '#a0a0a0',      // Gray text
```

**Light Theme Pattern:**
```typescript
background: '#ffffff',      // White
backgroundAlt: '#f5f5f5',   // Light gray
text: '#000000',            // Black text
textMuted: '#666666',       // Gray text
```

**Vibrant Theme Pattern:**
```typescript
primary: '#ff00aa',         // Bold primary
secondary: '#00ffaa',       // Contrasting secondary
background: '#1a1a2e',      // Dark background
text: '#ffffff',            // White text
```

## Testing Your Theme

1. Import the theme
2. Click "Preview" to see it temporarily
3. Check all pages (home, games, programs, blog, admin)
4. Test on mobile and desktop
5. If happy, click "Apply" to make permanent

## Need Help?

- See `THEME_MANAGEMENT_GUIDE.md` for full documentation
- Check existing themes for examples
- Use browser DevTools to test colors live
