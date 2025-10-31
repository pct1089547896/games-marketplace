import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { ThemePreset } from '../data/themePresets';

interface Theme {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  cssVariables: Record<string, string>;
  isPreset: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ThemeContextType {
  currentTheme: Theme | null;
  themes: Theme[];
  loading: boolean;
  error: string | null;
  applyTheme: (themeId: string) => Promise<void>;
  loadThemes: () => Promise<void>;
  createTheme: (theme: Partial<ThemePreset>) => Promise<void>;
  updateTheme: (themeId: string, updates: Partial<ThemePreset>) => Promise<void>;
  deleteTheme: (themeId: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider Component
 * 
 * Manages theme state and applies CSS variables to the document root.
 * Automatically loads the active theme on mount and subscribes to theme changes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply CSS variables to document root
  const applyCSSVariables = (cssVars: Record<string, string>, category?: string) => {
    const root = document.documentElement;
    
    Object.entries(cssVars).forEach(([key, value]) => {
      // Convert camelCase to kebab-case for CSS variables
      const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
    
    // Set data attributes to enable theme-specific CSS
    if (document.body) {
      document.body.setAttribute('data-theme-active', 'true');
      if (category) {
        document.body.setAttribute('data-theme-category', category);
      }
      console.log('Theme applied:', cssVars, 'Category:', category);
    }
  };

  // Remove CSS variables from document root
  const removeCSSVariables = () => {
    const root = document.documentElement;
    const existingVars = [
      // Basic colors
      'primary', 'primary-hover', 'secondary', 'accent', 'background', 'background-alt',
      'text', 'text-muted', 'border', 'success', 'warning', 'error', 'info',
      // Modern effects
      'gradient-start', 'gradient-mid', 'gradient-end',
      'shadow-light', 'shadow-medium', 'shadow-heavy',
      'glow-color', 'glass-background', 'glass-blur'
    ];
    
    existingVars.forEach(varName => {
      root.style.removeProperty(`--theme-${varName}`);
    });
    
    // Remove data attributes to disable theme-specific CSS
    if (document.body) {
      document.body.removeAttribute('data-theme-active');
      document.body.removeAttribute('data-theme-category');
      console.log('Theme removed');
    }
  };

  // Load all themes from database
  const loadThemes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: themesData, error: themesError } = await supabase
        .from('themes')
        .select('*')
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (themesError) throw themesError;

      // Transform database format to Theme type
      const transformedThemes: Theme[] = (themesData || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        displayName: t.display_name,
        description: t.description || '',
        category: t.category,
        cssVariables: t.css_variables,
        isPreset: t.is_preset,
        isActive: t.is_active,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));

      setThemes(transformedThemes);

      // Load active theme
      const { data: activeThemeData, error: activeThemeError } = await supabase
        .from('active_theme')
        .select('theme_id')
        .eq('id', 1)
        .maybeSingle();

      if (activeThemeError) throw activeThemeError;

      if (activeThemeData && activeThemeData.theme_id) {
        const activeTheme = transformedThemes.find(t => t.id === activeThemeData.theme_id);
        if (activeTheme) {
          console.log('Loading active theme:', activeTheme.displayName);
          setCurrentTheme(activeTheme);
          applyCSSVariables(activeTheme.cssVariables, activeTheme.category);
        } else {
          // Theme ID exists but theme not found, reset to default
          console.log('Theme ID found but theme not found, resetting');
          removeCSSVariables();
          setCurrentTheme(null);
        }
      } else {
        // No active theme set, use default styling
        console.log('No active theme set');
        removeCSSVariables();
        setCurrentTheme(null);
      }
    } catch (err: any) {
      console.error('Error loading themes:', err);
      setError(err.message || 'Failed to load themes');
      removeCSSVariables();
    } finally {
      setLoading(false);
    }
  };

  // Apply a theme by ID
  const applyTheme = async (themeId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Update active_theme table
      const { error: updateError } = await supabase
        .from('active_theme')
        .update({ theme_id: themeId })
        .eq('id', 1);

      if (updateError) throw updateError;

      // Find and apply the theme
      const theme = themes.find(t => t.id === themeId);
      if (theme) {
        setCurrentTheme(theme);
        applyCSSVariables(theme.cssVariables, theme.category);
      }
    } catch (err: any) {
      console.error('Error applying theme:', err);
      setError(err.message || 'Failed to apply theme');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new theme
  const createTheme = async (theme: Partial<ThemePreset>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from('themes')
        .insert({
          name: theme.name,
          display_name: theme.displayName,
          description: theme.description,
          category: theme.category,
          css_variables: theme.cssVariables,
          is_preset: false,
        })
        .select()
        .maybeSingle();

      if (insertError) throw insertError;

      // Reload themes to include the new one
      await loadThemes();
    } catch (err: any) {
      console.error('Error creating theme:', err);
      setError(err.message || 'Failed to create theme');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing theme
  const updateTheme = async (themeId: string, updates: Partial<ThemePreset>) => {
    try {
      setLoading(true);
      setError(null);

      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.displayName) updateData.display_name = updates.displayName;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category) updateData.category = updates.category;
      if (updates.cssVariables) updateData.css_variables = updates.cssVariables;

      const { error: updateError } = await supabase
        .from('themes')
        .update(updateData)
        .eq('id', themeId);

      if (updateError) throw updateError;

      // Reload themes and re-apply if this is the current theme
      await loadThemes();
      
      if (currentTheme && currentTheme.id === themeId) {
        const updatedTheme = themes.find(t => t.id === themeId);
        if (updatedTheme) {
          setCurrentTheme(updatedTheme);
          applyCSSVariables(updatedTheme.cssVariables);
        }
      }
    } catch (err: any) {
      console.error('Error updating theme:', err);
      setError(err.message || 'Failed to update theme');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a theme
  const deleteTheme = async (themeId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if this is the active theme
      if (currentTheme && currentTheme.id === themeId) {
        // Reset to default before deleting
        await resetToDefault();
      }

      const { error: deleteError } = await supabase
        .from('themes')
        .delete()
        .eq('id', themeId);

      if (deleteError) throw deleteError;

      // Reload themes
      await loadThemes();
    } catch (err: any) {
      console.error('Error deleting theme:', err);
      setError(err.message || 'Failed to delete theme');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset to default (no theme)
  const resetToDefault = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('active_theme')
        .update({ theme_id: null })
        .eq('id', 1);

      if (updateError) throw updateError;

      removeCSSVariables();
      setCurrentTheme(null);
    } catch (err: any) {
      console.error('Error resetting to default:', err);
      setError(err.message || 'Failed to reset to default');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load themes on mount
  useEffect(() => {
    loadThemes();
  }, []);

  const value: ThemeContextType = {
    currentTheme,
    themes,
    loading,
    error,
    applyTheme,
    loadThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    resetToDefault,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme Hook
 * 
 * Access theme context from any component.
 * Must be used within a ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
