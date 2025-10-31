import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface FavoriteButtonProps {
  contentId: string;
  contentType: 'game' | 'program';
  size?: number;
  showLabel?: boolean;
}

export default function FavoriteButton({ 
  contentId, 
  contentType, 
  size = 20, 
  showLabel = false 
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, contentId]);

  async function checkFavoriteStatus() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_id', contentId)
        .eq('content_type', contentType)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      // Not a favorite
      setIsFavorite(false);
    }
  }

  async function toggleFavorite() {
    if (!user) {
      alert(t('favorites.loginRequired'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('toggle-favorite', {
        body: {
          contentId,
          contentType,
          action: isFavorite ? 'remove' : 'add'
        }
      });

      if (error) throw error;

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Toggle favorite error:', error);
      alert(t('favorites.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isFavorite
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart 
        size={size} 
        className={`${isFavorite ? 'fill-current' : ''} transition-all`}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {isFavorite ? t('favorites.remove') : t('favorites.add')}
        </span>
      )}
    </button>
  );
}
