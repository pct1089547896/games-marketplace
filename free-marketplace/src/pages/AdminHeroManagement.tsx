import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Save, 
  Eye, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Palette, 
  Monitor,
  Smartphone,
  RefreshCw,
  Trash2,
  Check,
  X,
  Type,
  Sparkles,
  Layout,
  Sliders
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeroSettings {
  id?: string;
  is_active: boolean;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  layout_template: 'centered' | 'split' | 'fullwidth' | 'minimal';
  background_type: 'image' | 'video' | 'gradient' | 'color';
  background_media_url: string;
  background_color: string;
  background_gradient: string;
  text_position: 'center' | 'left' | 'right';
  text_color: string;
  featured_content_ids: string[];
  display_featured_content: boolean;
  featured_content_layout: 'single' | 'carousel' | 'grid';
  seo_title: string;
  seo_description: string;
  
  // Animation controls
  animation_type: string;
  animation_duration: number;
  animation_delay: number;
  scroll_animation: boolean;
  
  // Advanced typography
  font_family: string;
  title_font_size: number;
  subtitle_font_size: number;
  font_weight: number;
  line_height: number;
  letter_spacing: number;
  text_shadow: string;
  
  // Custom color system
  accent_color: string;
  gradient_type: string;
  gradient_angle: number;
  gradient_colors: string[];
  
  // Overlay & effects
  overlay_type: string;
  overlay_color: string;
  overlay_opacity: number;
  image_filter: string;
  blur_amount: number;
  brightness: number;
  contrast: number;
  pattern_overlay: string;
  
  // Button styling
  button_style: string;
  button_hover_effect: string;
  button_size: string;
  button_gradient: boolean;
  button_shadow: string;
  
  // Responsive design
  mobile_layout: string;
  tablet_layout: string;
  mobile_font_size: number;
  tablet_font_size: number;
  hide_on_mobile: boolean;
  
  // Advanced options
  custom_css: string;
  preset_theme: string;
  padding_top: number;
  padding_bottom: number;
  content_max_width: number;
}

interface HeroMedia {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'video';
  alt_text: string;
  file_size?: number;
  created_at: string;
}

interface ContentItem {
  id: string;
  title: string;
  screenshots?: string[];
}

export default function AdminHeroManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'animations' | 'typography' | 'colors' | 'effects' | 'buttons' | 'responsive' | 'advanced' | 'featured' | 'seo' | 'media'>('content');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [mediaRefreshKey, setMediaRefreshKey] = useState(0);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    is_active: true,
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    secondary_cta_text: '',
    secondary_cta_link: '',
    layout_template: 'centered',
    background_type: 'gradient',
    background_media_url: '',
    background_color: '#000000',
    background_gradient: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
    text_position: 'center',
    text_color: '#ffffff',
    featured_content_ids: [],
    display_featured_content: true,
    featured_content_layout: 'carousel',
    seo_title: '',
    seo_description: '',
    
    // Animation defaults
    animation_type: 'fade',
    animation_duration: 1000,
    animation_delay: 0,
    scroll_animation: false,
    
    // Typography defaults
    font_family: 'Inter',
    title_font_size: 48,
    subtitle_font_size: 20,
    font_weight: 700,
    line_height: 1.2,
    letter_spacing: 0,
    text_shadow: 'none',
    
    // Color defaults
    accent_color: '#3b82f6',
    gradient_type: 'linear',
    gradient_angle: 135,
    gradient_colors: ['#000000', '#1a1a1a'],
    
    // Effects defaults
    overlay_type: 'none',
    overlay_color: 'rgba(0,0,0,0.4)',
    overlay_opacity: 0.4,
    image_filter: 'none',
    blur_amount: 0,
    brightness: 100,
    contrast: 100,
    pattern_overlay: 'none',
    
    // Button defaults
    button_style: 'solid',
    button_hover_effect: 'scale',
    button_size: 'medium',
    button_gradient: false,
    button_shadow: '0 4px 6px rgba(0,0,0,0.1)',
    
    // Responsive defaults
    mobile_layout: 'stack',
    tablet_layout: 'adapt',
    mobile_font_size: 32,
    tablet_font_size: 40,
    hide_on_mobile: false,
    
    // Advanced defaults
    custom_css: '',
    preset_theme: 'custom',
    padding_top: 120,
    padding_bottom: 120,
    content_max_width: 1200,
  });
  const [mediaLibrary, setMediaLibrary] = useState<HeroMedia[]>([]);
  const [availableContent, setAvailableContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadHeroSettings();
    loadMediaLibrary();
    loadAvailableContent();
    checkBucketStatus();
  }, []);

  async function checkBucketStatus() {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      const bucketExists = data?.some(bucket => bucket.name === 'hero-media');
      
      if (!bucketExists) {
        console.warn('hero-media bucket does not exist yet');
      }
    } catch (error) {
      console.error('Error checking bucket status:', error);
    }
  }

  async function loadHeroSettings() {
    try {
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setHeroSettings({
          ...heroSettings,
          ...data,
          featured_content_ids: data.featured_content_ids || [],
          gradient_colors: Array.isArray(data.gradient_colors) ? data.gradient_colors : ['#000000', '#1a1a1a'],
        });
      }
    } catch (error) {
      console.error('Error loading hero settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMediaLibrary() {
    try {
      const { data, error } = await supabase
        .from('hero_media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaLibrary(data || []);
      console.log('Media library loaded:', data?.length, 'items');
    } catch (error) {
      console.error('Error loading media library:', error);
    }
  }

  async function loadAvailableContent() {
    try {
      const [gamesRes, programsRes] = await Promise.all([
        supabase.from('games').select('id, title, screenshots').eq('featured', true).limit(10),
        supabase.from('programs').select('id, title, screenshots').eq('featured', true).limit(10),
      ]);

      const games = (gamesRes.data || []).map(g => ({ ...g, type: 'game' }));
      const programs = (programsRes.data || []).map(p => ({ ...p, type: 'program' }));
      setAvailableContent([...games, ...programs]);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please select an image or video file (JPG, PNG, MP4, WebM, MOV)');
      return;
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size must be less than ${isVideo ? '50MB' : '10MB'}`);
      return;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hero-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('hero-media')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      const { error: dbError } = await supabase.from('hero_media').insert([{
        filename: file.name,
        url: publicUrl,
        type: isImage ? 'image' : 'video',
        alt_text: '',
        file_size: file.size,
      }]);

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('Database record created successfully');
      
      // Force refresh of media library with new key
      await loadMediaLibrary();
      setMediaRefreshKey(prev => prev + 1);
      
      alert('Media uploaded successfully!');
    } catch (error) {
      console.error('Complete upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to upload media: ${errorMessage}`);
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  }

  async function handleDeleteMedia(id: string, url: string) {
    if (!confirm('Delete this media file?')) return;

    try {
      const fileName = url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('hero-media').remove([fileName]);
      }
      await supabase.from('hero_media').delete().eq('id', id);
      
      // Force refresh
      await loadMediaLibrary();
      setMediaRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete media');
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const saveData = {
        ...heroSettings,
        updated_at: new Date().toISOString(),
      };

      if (heroSettings.id) {
        const { error } = await supabase
          .from('hero_settings')
          .update(saveData)
          .eq('id', heroSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_settings').insert([saveData]);
        if (error) throw error;
      }

      alert('Hero settings saved successfully!');
      loadHeroSettings();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save hero settings');
    } finally {
      setSaving(false);
    }
  }

  const toggleFeaturedContent = (id: string) => {
    const ids = heroSettings.featured_content_ids;
    if (ids.includes(id)) {
      setHeroSettings({
        ...heroSettings,
        featured_content_ids: ids.filter(i => i !== id),
      });
    } else {
      setHeroSettings({
        ...heroSettings,
        featured_content_ids: [...ids, id],
      });
    }
  };

  const applyPreset = (preset: string) => {
    const presets: Record<string, Partial<HeroSettings>> = {
      modern: {
        font_family: 'Inter',
        title_font_size: 64,
        subtitle_font_size: 24,
        font_weight: 800,
        letter_spacing: -0.5,
        button_style: 'solid',
        button_gradient: true,
        animation_type: 'slide-up',
        gradient_colors: ['#6366f1', '#8b5cf6'],
      },
      minimal: {
        font_family: 'Inter',
        title_font_size: 48,
        subtitle_font_size: 18,
        font_weight: 400,
        letter_spacing: 0,
        button_style: 'outline',
        button_gradient: false,
        animation_type: 'fade',
        background_type: 'color',
        background_color: '#ffffff',
        text_color: '#000000',
      },
      bold: {
        font_family: 'Inter',
        title_font_size: 72,
        subtitle_font_size: 28,
        font_weight: 900,
        letter_spacing: -1,
        button_style: 'solid',
        button_size: 'large',
        animation_type: 'zoom',
        text_shadow: '0 4px 12px rgba(0,0,0,0.3)',
      },
      elegant: {
        font_family: 'Georgia',
        title_font_size: 56,
        subtitle_font_size: 22,
        font_weight: 300,
        letter_spacing: 0.5,
        line_height: 1.4,
        button_style: 'outline',
        animation_type: 'fade',
        overlay_opacity: 0.6,
      },
    };

    if (presets[preset]) {
      setHeroSettings({
        ...heroSettings,
        ...presets[preset],
        preset_theme: preset,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl">{t('admin.loading')}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Hero Editor - Enhanced</h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-2">
            {[
              { key: 'content', label: 'Content' },
              { key: 'design', label: 'Design' },
              { key: 'animations', label: 'Animations' },
              { key: 'typography', label: 'Typography' },
              { key: 'colors', label: 'Colors' },
              { key: 'effects', label: 'Effects' },
              { key: 'buttons', label: 'Buttons' },
              { key: 'responsive', label: 'Responsive' },
              { key: 'advanced', label: 'Advanced' },
              { key: 'featured', label: 'Featured' },
              { key: 'seo', label: 'SEO' },
              { key: 'media', label: 'Media' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-2 font-medium border-b-2 transition whitespace-nowrap text-sm ${
                  activeTab === tab.key
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-2">
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={heroSettings.title}
                    onChange={(e) => setHeroSettings({ ...heroSettings, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    value={heroSettings.subtitle}
                    onChange={(e) => setHeroSettings({ ...heroSettings, subtitle: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CTA Text</label>
                    <input
                      type="text"
                      value={heroSettings.cta_text}
                      onChange={(e) => setHeroSettings({ ...heroSettings, cta_text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                    <input
                      type="text"
                      value={heroSettings.cta_link}
                      onChange={(e) => setHeroSettings({ ...heroSettings, cta_link: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary CTA Text</label>
                    <input
                      type="text"
                      value={heroSettings.secondary_cta_text}
                      onChange={(e) => setHeroSettings({ ...heroSettings, secondary_cta_text: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary CTA Link</label>
                    <input
                      type="text"
                      value={heroSettings.secondary_cta_link}
                      onChange={(e) => setHeroSettings({ ...heroSettings, secondary_cta_link: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Design Tab */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Layout Template</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['centered', 'split', 'fullwidth', 'minimal'].map((layout) => (
                      <button
                        key={layout}
                        onClick={() => setHeroSettings({ ...heroSettings, layout_template: layout as any })}
                        className={`p-4 border-2 rounded-lg text-left transition ${
                          heroSettings.layout_template === layout
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium capitalize">{layout}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Background Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['image', 'video', 'gradient', 'color'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setHeroSettings({ ...heroSettings, background_type: type as any })}
                        className={`p-4 border-2 rounded-lg text-left transition ${
                          heroSettings.background_type === type
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium capitalize">{type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Position</label>
                  <select
                    value={heroSettings.text_position}
                    onChange={(e) => setHeroSettings({ ...heroSettings, text_position: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Padding Top (px)</label>
                    <input
                      type="number"
                      value={heroSettings.padding_top}
                      onChange={(e) => setHeroSettings({ ...heroSettings, padding_top: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Padding Bottom (px)</label>
                    <input
                      type="number"
                      value={heroSettings.padding_bottom}
                      onChange={(e) => setHeroSettings({ ...heroSettings, padding_bottom: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Content Width (px)</label>
                  <input
                    type="number"
                    value={heroSettings.content_max_width}
                    onChange={(e) => setHeroSettings({ ...heroSettings, content_max_width: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            )}

            {/* Animations Tab */}
            {activeTab === 'animations' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Animation Type</label>
                  <select
                    value={heroSettings.animation_type}
                    onChange={(e) => setHeroSettings({ ...heroSettings, animation_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="none">None</option>
                    <option value="fade">Fade In</option>
                    <option value="slide-up">Slide Up</option>
                    <option value="slide-down">Slide Down</option>
                    <option value="slide-left">Slide Left</option>
                    <option value="slide-right">Slide Right</option>
                    <option value="zoom">Zoom In</option>
                    <option value="zoom-out">Zoom Out</option>
                    <option value="parallax">Parallax</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Duration (ms): {heroSettings.animation_duration}
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="3000"
                    step="100"
                    value={heroSettings.animation_duration}
                    onChange={(e) => setHeroSettings({ ...heroSettings, animation_duration: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animation Delay (ms): {heroSettings.animation_delay}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="100"
                    value={heroSettings.animation_delay}
                    onChange={(e) => setHeroSettings({ ...heroSettings, animation_delay: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={heroSettings.scroll_animation}
                    onChange={(e) => setHeroSettings({ ...heroSettings, scroll_animation: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label className="text-sm font-medium text-gray-700">Enable Scroll-Triggered Animation</label>
                </div>
              </div>
            )}

            {/* Typography Tab */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                  <select
                    value={heroSettings.font_family}
                    onChange={(e) => setHeroSettings({ ...heroSettings, font_family: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Arial">Arial</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title Size: {heroSettings.title_font_size}px
                    </label>
                    <input
                      type="range"
                      min="24"
                      max="120"
                      value={heroSettings.title_font_size}
                      onChange={(e) => setHeroSettings({ ...heroSettings, title_font_size: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle Size: {heroSettings.subtitle_font_size}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={heroSettings.subtitle_font_size}
                      onChange={(e) => setHeroSettings({ ...heroSettings, subtitle_font_size: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                  <select
                    value={heroSettings.font_weight}
                    onChange={(e) => setHeroSettings({ ...heroSettings, font_weight: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi-Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra-Bold (800)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Line Height: {heroSettings.line_height}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="2"
                      step="0.1"
                      value={heroSettings.line_height}
                      onChange={(e) => setHeroSettings({ ...heroSettings, line_height: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Letter Spacing: {heroSettings.letter_spacing}px
                    </label>
                    <input
                      type="range"
                      min="-2"
                      max="4"
                      step="0.1"
                      value={heroSettings.letter_spacing}
                      onChange={(e) => setHeroSettings({ ...heroSettings, letter_spacing: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Shadow</label>
                  <select
                    value={heroSettings.text_shadow}
                    onChange={(e) => setHeroSettings({ ...heroSettings, text_shadow: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="none">None</option>
                    <option value="0 2px 4px rgba(0,0,0,0.1)">Subtle</option>
                    <option value="0 4px 8px rgba(0,0,0,0.2)">Medium</option>
                    <option value="0 4px 12px rgba(0,0,0,0.3)">Strong</option>
                    <option value="0 6px 16px rgba(0,0,0,0.4)">Heavy</option>
                  </select>
                </div>
              </div>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                    <input
                      type="color"
                      value={heroSettings.text_color}
                      onChange={(e) => setHeroSettings({ ...heroSettings, text_color: e.target.value })}
                      className="w-full h-12 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                    <input
                      type="color"
                      value={heroSettings.accent_color}
                      onChange={(e) => setHeroSettings({ ...heroSettings, accent_color: e.target.value })}
                      className="w-full h-12 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {heroSettings.background_type === 'color' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                    <input
                      type="color"
                      value={heroSettings.background_color}
                      onChange={(e) => setHeroSettings({ ...heroSettings, background_color: e.target.value })}
                      className="w-full h-12 rounded-lg cursor-pointer"
                    />
                  </div>
                )}

                {heroSettings.background_type === 'gradient' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Type</label>
                      <select
                        value={heroSettings.gradient_type}
                        onChange={(e) => setHeroSettings({ ...heroSettings, gradient_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="linear">Linear</option>
                        <option value="radial">Radial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gradient Angle: {heroSettings.gradient_angle}°
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={heroSettings.gradient_angle}
                        onChange={(e) => setHeroSettings({ ...heroSettings, gradient_angle: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Colors</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="color"
                          value={heroSettings.gradient_colors[0] || '#000000'}
                          onChange={(e) => {
                            const colors = [...heroSettings.gradient_colors];
                            colors[0] = e.target.value;
                            setHeroSettings({ ...heroSettings, gradient_colors: colors });
                          }}
                          className="w-full h-12 rounded-lg cursor-pointer"
                        />
                        <input
                          type="color"
                          value={heroSettings.gradient_colors[1] || '#1a1a1a'}
                          onChange={(e) => {
                            const colors = [...heroSettings.gradient_colors];
                            colors[1] = e.target.value;
                            setHeroSettings({ ...heroSettings, gradient_colors: colors });
                          }}
                          className="w-full h-12 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Gradient CSS</label>
                      <input
                        type="text"
                        value={heroSettings.background_gradient}
                        onChange={(e) => setHeroSettings({ ...heroSettings, background_gradient: e.target.value })}
                        placeholder="linear-gradient(135deg, #000 0%, #fff 100%)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Effects Tab */}
            {activeTab === 'effects' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overlay Type</label>
                  <select
                    value={heroSettings.overlay_type}
                    onChange={(e) => setHeroSettings({ ...heroSettings, overlay_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="none">None</option>
                    <option value="solid">Solid Color</option>
                    <option value="gradient-linear">Linear Gradient</option>
                    <option value="gradient-radial">Radial Gradient</option>
                  </select>
                </div>

                {heroSettings.overlay_type !== 'none' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overlay Color</label>
                      <input
                        type="color"
                        value={heroSettings.overlay_color.replace(/rgba?\([^)]+\)/, '#000000')}
                        onChange={(e) => setHeroSettings({ ...heroSettings, overlay_color: e.target.value })}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overlay Opacity: {Math.round(heroSettings.overlay_opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={heroSettings.overlay_opacity}
                        onChange={(e) => setHeroSettings({ ...heroSettings, overlay_opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Filter</label>
                  <select
                    value={heroSettings.image_filter}
                    onChange={(e) => setHeroSettings({ ...heroSettings, image_filter: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="none">None</option>
                    <option value="grayscale">Grayscale</option>
                    <option value="sepia">Sepia</option>
                    <option value="blur">Blur</option>
                    <option value="brightness">Brightness</option>
                    <option value="contrast">Contrast</option>
                  </select>
                </div>

                {heroSettings.image_filter === 'blur' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blur Amount: {heroSettings.blur_amount}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={heroSettings.blur_amount}
                      onChange={(e) => setHeroSettings({ ...heroSettings, blur_amount: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                {heroSettings.image_filter === 'brightness' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brightness: {heroSettings.brightness}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={heroSettings.brightness}
                      onChange={(e) => setHeroSettings({ ...heroSettings, brightness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                {heroSettings.image_filter === 'contrast' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contrast: {heroSettings.contrast}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={heroSettings.contrast}
                      onChange={(e) => setHeroSettings({ ...heroSettings, contrast: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pattern Overlay</label>
                  <select
                    value={heroSettings.pattern_overlay}
                    onChange={(e) => setHeroSettings({ ...heroSettings, pattern_overlay: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="none">None</option>
                    <option value="dots">Dots</option>
                    <option value="grid">Grid</option>
                    <option value="diagonal">Diagonal Lines</option>
                  </select>
                </div>
              </div>
            )}

            {/* Buttons Tab */}
            {activeTab === 'buttons' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
                  <select
                    value={heroSettings.button_style}
                    onChange={(e) => setHeroSettings({ ...heroSettings, button_style: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                    <option value="gradient">Gradient</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Size</label>
                  <select
                    value={heroSettings.button_size}
                    onChange={(e) => setHeroSettings({ ...heroSettings, button_size: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hover Effect</label>
                  <select
                    value={heroSettings.button_hover_effect}
                    onChange={(e) => setHeroSettings({ ...heroSettings, button_hover_effect: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="none">None</option>
                    <option value="scale">Scale</option>
                    <option value="lift">Lift</option>
                    <option value="glow">Glow</option>
                    <option value="slide">Slide</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={heroSettings.button_gradient}
                    onChange={(e) => setHeroSettings({ ...heroSettings, button_gradient: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label className="text-sm font-medium text-gray-700">Use Gradient Background</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Shadow</label>
                  <select
                    value={heroSettings.button_shadow}
                    onChange={(e) => setHeroSettings({ ...heroSettings, button_shadow: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="none">None</option>
                    <option value="0 2px 4px rgba(0,0,0,0.1)">Small</option>
                    <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
                    <option value="0 8px 12px rgba(0,0,0,0.15)">Large</option>
                  </select>
                </div>
              </div>
            )}

            {/* Responsive Tab */}
            {activeTab === 'responsive' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Layout</label>
                  <select
                    value={heroSettings.mobile_layout}
                    onChange={(e) => setHeroSettings({ ...heroSettings, mobile_layout: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="stack">Stack</option>
                    <option value="compact">Compact</option>
                    <option value="centered">Centered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tablet Layout</label>
                  <select
                    value={heroSettings.tablet_layout}
                    onChange={(e) => setHeroSettings({ ...heroSettings, tablet_layout: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="adapt">Adapt to Desktop</option>
                    <option value="mobile-like">Mobile-Like</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Title Size: {heroSettings.mobile_font_size}px
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="64"
                      value={heroSettings.mobile_font_size}
                      onChange={(e) => setHeroSettings({ ...heroSettings, mobile_font_size: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tablet Title Size: {heroSettings.tablet_font_size}px
                    </label>
                    <input
                      type="range"
                      min="24"
                      max="72"
                      value={heroSettings.tablet_font_size}
                      onChange={(e) => setHeroSettings({ ...heroSettings, tablet_font_size: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={heroSettings.hide_on_mobile}
                    onChange={(e) => setHeroSettings({ ...heroSettings, hide_on_mobile: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label className="text-sm font-medium text-gray-700">Hide Hero on Mobile Devices</label>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preset Themes</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['modern', 'minimal', 'bold', 'elegant'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => applyPreset(preset)}
                        className="p-3 border-2 border-gray-200 rounded-lg hover:border-black transition capitalize"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
                  <textarea
                    value={heroSettings.custom_css}
                    onChange={(e) => setHeroSettings({ ...heroSettings, custom_css: e.target.value })}
                    rows={8}
                    placeholder=".hero-custom { /* your styles here */ }"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Add custom CSS for advanced styling</p>
                </div>
              </div>
            )}

            {/* Featured Content Tab */}
            {activeTab === 'featured' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={heroSettings.display_featured_content}
                    onChange={(e) => setHeroSettings({ ...heroSettings, display_featured_content: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label className="text-sm font-medium text-gray-700">Display Featured Content</label>
                </div>

                {heroSettings.display_featured_content && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content Layout</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['single', 'carousel', 'grid'].map((layout) => (
                          <button
                            key={layout}
                            onClick={() => setHeroSettings({ ...heroSettings, featured_content_layout: layout as any })}
                            className={`p-3 border-2 rounded-lg text-sm transition ${
                              heroSettings.featured_content_layout === layout
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {layout.charAt(0).toUpperCase() + layout.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Select Content</label>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {availableContent.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleFeaturedContent(item.id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                              heroSettings.featured_content_ids.includes(item.id)
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {item.screenshots && item.screenshots[0] && (
                                  <img
                                    src={item.screenshots[0]}
                                    alt={item.title}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                                <span className="font-medium">{item.title}</span>
                              </div>
                              {heroSettings.featured_content_ids.includes(item.id) && (
                                <Check size={20} className="text-green-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={heroSettings.seo_title}
                    onChange={(e) => setHeroSettings({ ...heroSettings, seo_title: e.target.value })}
                    placeholder="Optional - Leave empty to use default"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                  <textarea
                    value={heroSettings.seo_description}
                    onChange={(e) => setHeroSettings({ ...heroSettings, seo_description: e.target.value })}
                    placeholder="Optional - Leave empty to use default"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            )}

            {/* Media Library Tab */}
            {activeTab === 'media' && (
              <div className="space-y-4" key={mediaRefreshKey}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Upload size={18} />
                    <span>Upload Media Files</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Supported: JPG, PNG, GIF, WebP images • MP4, WebM videos • Max 10MB for images, 50MB for videos
                  </p>
                  <label className="cursor-pointer bg-black text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-gray-800 transition">
                    <Upload size={18} />
                    {uploading ? 'Uploading...' : 'Upload Media'}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    If upload fails, ensure "hero-media" bucket exists in Supabase Storage and is set to public
                  </p>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  {mediaLibrary.length} media files in library
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {mediaLibrary.map((media) => (
                    <div key={media.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={media.alt_text || media.filename}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center relative">
                          <video 
                            src={media.url} 
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <Video size={24} className="text-white" />
                          </div>
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate">{media.filename}</p>
                        <p className="text-xs text-gray-400">{media.type.toUpperCase()} • {media.file_size ? `${Math.round(media.file_size / 1024)}KB` : ''}</p>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                          onClick={() => setHeroSettings({ ...heroSettings, background_media_url: media.url, background_type: media.type })}
                          className="bg-white text-black p-2 rounded-lg hover:bg-gray-200"
                          title="Use as background"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(media.id, media.url)}
                          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                          title="Delete media"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="space-y-4 sticky top-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Live Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded ${
                  previewMode === 'desktop' ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                <Monitor size={18} />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded ${
                  previewMode === 'mobile' ? 'bg-black text-white' : 'bg-gray-100'
                }`}
              >
                <Smartphone size={18} />
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className={`${previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'}`}>
            <div
              className="relative rounded-lg overflow-hidden"
              style={{
                background: 
                  heroSettings.background_type === 'color'
                    ? heroSettings.background_color
                    : heroSettings.background_type === 'gradient'
                    ? `${heroSettings.gradient_type}-gradient(${heroSettings.gradient_angle}deg, ${heroSettings.gradient_colors.join(', ')})`
                    : heroSettings.background_media_url
                    ? `url(${heroSettings.background_media_url})`
                    : heroSettings.background_gradient,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: previewMode === 'mobile' ? '400px' : '500px',
                paddingTop: `${heroSettings.padding_top}px`,
                paddingBottom: `${heroSettings.padding_bottom}px`,
                filter: heroSettings.image_filter !== 'none' 
                  ? `${heroSettings.image_filter}(${
                      heroSettings.image_filter === 'blur' ? `${heroSettings.blur_amount}px` :
                      heroSettings.image_filter === 'brightness' ? `${heroSettings.brightness}%` :
                      heroSettings.image_filter === 'contrast' ? `${heroSettings.contrast}%` : '100%'
                    })`
                  : 'none',
              }}
            >
              {heroSettings.overlay_type !== 'none' && (
                <div 
                  className="absolute inset-0" 
                  style={{
                    background: heroSettings.overlay_color,
                    opacity: heroSettings.overlay_opacity,
                  }}
                ></div>
              )}
              <div
                className={`relative z-10 h-full px-8 flex flex-col justify-center ${
                  heroSettings.text_position === 'center'
                    ? 'items-center text-center'
                    : heroSettings.text_position === 'left'
                    ? 'items-start text-left'
                    : 'items-end text-right'
                }`}
                style={{
                  maxWidth: `${heroSettings.content_max_width}px`,
                  margin: heroSettings.text_position === 'center' ? '0 auto' : '0',
                }}
              >
                <h1
                  style={{ 
                    color: heroSettings.text_color,
                    fontFamily: heroSettings.font_family,
                    fontSize: previewMode === 'mobile' ? `${heroSettings.mobile_font_size}px` : `${heroSettings.title_font_size}px`,
                    fontWeight: heroSettings.font_weight,
                    lineHeight: heroSettings.line_height,
                    letterSpacing: `${heroSettings.letter_spacing}px`,
                    textShadow: heroSettings.text_shadow,
                  }}
                  className="mb-4"
                >
                  {heroSettings.title || 'Hero Title'}
                </h1>
                <p
                  style={{ 
                    color: heroSettings.text_color,
                    fontFamily: heroSettings.font_family,
                    fontSize: previewMode === 'mobile' ? '16px' : `${heroSettings.subtitle_font_size}px`,
                  }}
                  className="mb-6 max-w-2xl"
                >
                  {heroSettings.subtitle || 'Hero subtitle goes here'}
                </p>
                <div className="flex gap-4">
                  {heroSettings.cta_text && (
                    <div 
                      className={`px-6 py-3 rounded-lg font-bold transition ${
                        heroSettings.button_size === 'small' ? 'text-sm px-4 py-2' :
                        heroSettings.button_size === 'large' ? 'text-lg px-8 py-4' : ''
                      }`}
                      style={{
                        background: heroSettings.button_gradient 
                          ? `linear-gradient(135deg, ${heroSettings.accent_color}, ${heroSettings.text_color})`
                          : heroSettings.button_style === 'solid' ? '#ffffff' : 'transparent',
                        color: heroSettings.button_style === 'solid' ? '#000000' : heroSettings.text_color,
                        border: heroSettings.button_style === 'outline' ? `2px solid ${heroSettings.text_color}` : 'none',
                        boxShadow: heroSettings.button_shadow,
                      }}
                    >
                      {heroSettings.cta_text}
                    </div>
                  )}
                  {heroSettings.secondary_cta_text && (
                    <div 
                      className="px-6 py-3 rounded-lg font-bold border-2"
                      style={{
                        color: heroSettings.text_color,
                        borderColor: heroSettings.text_color,
                        background: 'transparent',
                      }}
                    >
                      {heroSettings.secondary_cta_text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <strong>Active Settings:</strong>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>Layout: {heroSettings.layout_template}</div>
              <div>Animation: {heroSettings.animation_type}</div>
              <div>Font: {heroSettings.font_family}</div>
              <div>Theme: {heroSettings.preset_theme}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
