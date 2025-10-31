import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { 
  Camera, 
  Save, 
  X, 
  Upload,
  User,
  Mail,
  Calendar,
  Edit2
} from 'lucide-react';

const ProfileEditPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/forums/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        display_name: data.display_name || '',
        avatar_url: data.avatar_url || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrl
      }));

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: formData.display_name,
          avatar_url: formData.avatar_url
        })
        .eq('id', user.id);

      if (error) throw error;

      // Navigate back to profile
      navigate(`/profile/${user.id}`);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('profile.accessDenied')}
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            {t('common.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Edit2 className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('nav.editProfile')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('profile.editDescription')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/profile/${user.id}`)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
            <span>{t('common.cancel')}</span>
          </button>
        </div>

        {/* Edit Form */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Avatar Section */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('profile.profilePhoto')}
              </h3>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {formData.avatar_url ? (
                    <img 
                      src={formData.avatar_url} 
                      alt={formData.display_name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                      <User className="w-16 h-16 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-black dark:bg-white text-white dark:text-black rounded-full p-2 cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                
                {uploading && (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Upload className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">{t('profile.uploading')}</span>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {t('profile.avatarInstructions')}
                </p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="md:col-span-2 space-y-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.displayName')}
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  placeholder={t('profile.displayNamePlaceholder')}
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.email')}
                </label>
                <div className="flex items-center space-x-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{user.email}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {t('profile.readOnly')}
                  </span>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('profile.accountInfo')}
                </h4>
                <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{t('profile.memberSince')} {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate(`/profile/${user.id}`)}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex items-center space-x-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? t('profile.saving') : t('common.save')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;