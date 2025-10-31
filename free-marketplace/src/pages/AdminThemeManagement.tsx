import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { allThemePresets, themesByCategory, categoryLabels } from '../data/themePresets';
import { supabase } from '../lib/supabase';
import { 
  Palette, 
  Check, 
  Upload, 
  Download, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw,
  Eye,
  Sparkles,
  AlertCircle,
  Zap
} from 'lucide-react';

type CategoryType = 'all' | 'gaming' | 'holiday' | 'seasonal' | 'style' | 'industry' | 'color' | 'special';

export default function AdminThemeManagement() {
  const navigate = useNavigate();
  const { currentTheme, themes, loading, applyTheme, loadThemes, resetToDefault } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [previewTheme, setPreviewTheme] = useState<any>(null);

  // Check if presets are already imported
  const checkPresetsImported = () => {
    return themes.filter(t => t.isPreset).length > 0;
  };

  // Import all preset themes into database
  const importPresetThemes = async () => {
    setImporting(true);
    setImportStatus('Importing preset themes...');

    try {
      let successCount = 0;
      let skipCount = 0;

      for (const preset of allThemePresets) {
        // Check if theme already exists
        const existingTheme = themes.find(t => t.name === preset.name);
        
        if (existingTheme) {
          skipCount++;
          continue;
        }

        // Insert theme
        const { error } = await supabase
          .from('themes')
          .insert({
            name: preset.name,
            display_name: preset.displayName,
            description: preset.description,
            category: preset.category,
            css_variables: preset.cssVariables,
            is_preset: true,
          });

        if (error) {
          console.error(`Failed to import ${preset.displayName}:`, error);
        } else {
          successCount++;
        }
      }

      setImportStatus(`Imported ${successCount} themes, skipped ${skipCount} existing themes`);
      
      // Reload themes
      await loadThemes();

      setTimeout(() => {
        setImportStatus('');
      }, 3000);
    } catch (error: any) {
      console.error('Error importing presets:', error);
      setImportStatus(`Error: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Get filtered themes based on category
  const filteredThemes = selectedCategory === 'all' 
    ? themes 
    : themes.filter(t => t.category === selectedCategory);

  // Preview theme (temporary visual change without applying)
  const handlePreviewTheme = (theme: any) => {
    setPreviewTheme(theme);
    
    // Apply CSS variables temporarily
    const root = document.documentElement;
    Object.entries(theme.cssVariables).forEach(([key, value]: [string, any]) => {
      const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
    
    // Set category attribute for theme-specific animations
    if (document.body) {
      document.body.setAttribute('data-theme-category', theme.category);
    }
  };

  // Clear preview and restore original theme
  const clearPreview = () => {
    setPreviewTheme(null);
    
    // Restore current theme or remove variables
    if (currentTheme) {
      const root = document.documentElement;
      Object.entries(currentTheme.cssVariables).forEach(([key, value]: [string, any]) => {
        const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
      });
      // Restore category
      if (document.body) {
        document.body.setAttribute('data-theme-category', currentTheme.category);
      }
    } else {
      // Remove all theme variables including modern effects
      const root = document.documentElement;
      const existingVars = [
        'primary', 'primary-hover', 'secondary', 'accent', 'background', 'background-alt',
        'text', 'text-muted', 'border', 'success', 'warning', 'error', 'info',
        'gradient-start', 'gradient-mid', 'gradient-end',
        'shadow-light', 'shadow-medium', 'shadow-heavy',
        'glow-color', 'glass-background', 'glass-blur'
      ];
      existingVars.forEach(varName => {
        root.style.removeProperty(`--theme-${varName}`);
      });
      // Remove category
      if (document.body) {
        document.body.removeAttribute('data-theme-category');
      }
    }
  };

  // Apply theme permanently
  const handleApplyTheme = async (themeId: string) => {
    try {
      await applyTheme(themeId);
      setPreviewTheme(null);
      alert('Theme applied successfully!');
    } catch (error: any) {
      alert(`Failed to apply theme: ${error.message}`);
    }
  };

  // Reset to default theme
  const handleResetToDefault = async () => {
    if (!confirm('Reset to default theme? This will remove all theme styling.')) return;
    
    try {
      await resetToDefault();
      setPreviewTheme(null);
      alert('Reset to default successfully!');
    } catch (error: any) {
      alert(`Failed to reset: ${error.message}`);
    }
  };

  // Delete theme
  const handleDeleteTheme = async (themeId: string, themeName: string) => {
    if (!confirm(`Delete theme "${themeName}"? This cannot be undone.`)) return;
    
    try {
      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', themeId);

      if (error) throw error;

      await loadThemes();
      alert('Theme deleted successfully!');
    } catch (error: any) {
      alert(`Failed to delete theme: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Palette size={32} className="text-black" />
            <div>
              <h2 className="text-2xl font-bold">Theme Management</h2>
              <p className="text-sm text-gray-600">
                Transform your marketplace with 31 modernized themes featuring advanced gradients, glass morphism, neon effects, and dynamic shadows
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/effects-showcase')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-lg transition shadow-lg hover:shadow-xl"
            >
              <Zap size={18} />
              View Effects Showcase
            </button>
            {currentTheme && (
              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <RefreshCw size={18} />
                Reset to Default
              </button>
            )}
          </div>
        </div>

        {/* Current Theme Display */}
        {currentTheme && (
          <div className="bg-gradient-to-r from-black to-gray-800 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Active Theme</p>
                <p className="text-xl font-bold">{currentTheme.displayName}</p>
                <p className="text-sm opacity-70">{currentTheme.description}</p>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Check size={20} />
                <span>Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Import Status */}
        {importStatus && (
          <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Themes Pre-loaded Info Banner */}
        {checkPresetsImported() ? (
          <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 text-green-900 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Check size={24} className="text-green-600" />
              <div>
                <p className="font-bold">31 Modern Themes Pre-loaded</p>
                <p className="text-sm opacity-80">
                  All themes feature contemporary design effects: advanced gradients, glass morphism, neon glows, and dynamic shadows. Ready to use!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles size={24} />
                  Import 31 Preset Themes
                </h3>
                <p className="opacity-90">
                  Professionally designed themes for gaming, holidays, seasons, and more!
                </p>
              </div>
              <button
                onClick={importPresetThemes}
                disabled={importing}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Upload size={20} />
                {importing ? 'Importing...' : 'Import Themes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Banner */}
      {previewTheme && (
        <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye size={24} className="text-yellow-600" />
              <div>
                <p className="font-bold">Previewing: {previewTheme.displayName}</p>
                <p className="text-sm text-gray-600">Click "Apply" to make this permanent</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApplyTheme(previewTheme.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Check size={18} />
                Apply Theme
              </button>
              <button
                onClick={clearPreview}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Themes ({themes.length})
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = themes.filter(t => t.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as CategoryType)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === key
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-600">
            Loading themes...
          </div>
        ) : filteredThemes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-600">
            <p className="text-lg mb-4">No themes found in this category.</p>
            {!checkPresetsImported() && (
              <p className="text-sm">Import preset themes to get started!</p>
            )}
          </div>
        ) : (
          filteredThemes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isActive={currentTheme?.id === theme.id}
              isPreviewing={previewTheme?.id === theme.id}
              onPreview={() => handlePreviewTheme(theme)}
              onApply={() => handleApplyTheme(theme.id)}
              onDelete={() => handleDeleteTheme(theme.id, theme.displayName)}
            />
          ))
        )}
      </div>

      {/* Extensibility Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
          <Sparkles size={24} />
          Easy Theme Extension
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Adding new themes is incredibly simple:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Open <code className="bg-white px-2 py-1 rounded">src/data/themePresets.ts</code></li>
            <li>Add your theme object to the appropriate category array</li>
            <li>Define CSS variables (primary, secondary, background, etc.)</li>
            <li>Re-run database migration to include new theme (or use Import button)</li>
            <li>Your new theme is ready to use!</li>
          </ol>
          <p className="mt-3 text-xs text-gray-600">
            No database migrations or complex code changes needed. Just define colors and import!
          </p>
        </div>
      </div>
    </div>
  );
}

// Theme Card Component with Enhanced Modern Preview
function ThemeCard({ 
  theme, 
  isActive, 
  isPreviewing,
  onPreview, 
  onApply, 
  onDelete 
}: { 
  theme: any; 
  isActive: boolean;
  isPreviewing: boolean;
  onPreview: () => void; 
  onApply: () => void; 
  onDelete: () => void;
}) {
  const vars = theme.cssVariables;
  
  return (
    <div className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:scale-105 transform duration-300 ${
      isActive 
        ? 'border-green-500 shadow-xl shadow-green-100' 
        : isPreviewing
        ? 'border-yellow-500 shadow-xl shadow-yellow-100'
        : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
    }`}>
      {/* Enhanced Color Preview with Modern Effects */}
      <div className="h-32 relative overflow-hidden" style={{ 
        background: `linear-gradient(135deg, ${vars.gradientStart || vars.primary} 0%, ${vars.gradientMid || vars.secondary} 50%, ${vars.gradientEnd || vars.secondary} 100%)`
      }}>
        {/* Gradient overlay pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${vars.primary} 0%, transparent 50%), radial-gradient(circle at 80% 50%, ${vars.secondary} 0%, transparent 50%)`
        }}></div>
        
        {/* Modern effect demonstrations */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 p-4">
          {/* Glass morphism demo card */}
          <div className="w-16 h-16 rounded-lg backdrop-blur-md flex items-center justify-center" style={{
            background: vars.glassBackground || 'rgba(255, 255, 255, 0.2)',
            backdropFilter: `blur(${vars.glassBlur || '10px'})`,
            border: `1px solid ${vars.border}`,
            boxShadow: `0 4px 16px ${vars.shadowMedium || 'rgba(0,0,0,0.1)'}`
          }}>
            <div className="w-8 h-8 rounded-full" style={{
              background: vars.primary,
              boxShadow: vars.glowColor ? `0 0 15px rgba(${vars.glowColor}, 0.6)` : 'none'
            }}></div>
          </div>
          
          {/* Neon glow demo */}
          <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{
            background: vars.backgroundAlt || vars.background,
            border: `2px solid ${vars.primary}`,
            boxShadow: vars.glowColor ? 
              `0 0 20px rgba(${vars.glowColor}, 0.5), 0 0 40px rgba(${vars.glowColor}, 0.3)` : 
              'none'
          }}>
            <div className="text-xs font-bold" style={{ color: vars.primary }}>FX</div>
          </div>
        </div>
        
        {/* Color swatches */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-2">
          {[
            vars.primary, 
            vars.secondary, 
            vars.accent, 
            vars.success,
            vars.info
          ].map((color, idx) => (
            <div
              key={idx}
              className="w-5 h-5 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        
        {isActive && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Check size={14} />
            Active
          </div>
        )}
        
        {isPreviewing && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Eye size={14} />
            Preview
          </div>
        )}
      </div>

      {/* Theme Info */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-bold">{theme.displayName}</h3>
          <p className="text-sm text-gray-600">{theme.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
              {theme.category}
            </span>
            {theme.isPreset && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Preset
              </span>
            )}
            {vars.glowColor && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                <Sparkles size={12} />
                FX
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onPreview}
            disabled={isPreviewing}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 hover:shadow-md"
          >
            <Eye size={16} />
            Preview
          </button>
          
          <button
            onClick={onApply}
            disabled={isActive}
            className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 hover:shadow-lg hover:scale-105 transform"
          >
            <Check size={16} />
            {isActive ? 'Applied' : 'Apply'}
          </button>

          {!theme.isPreset && (
            <button
              onClick={onDelete}
              className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg transition hover:shadow-md"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
