import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Game, Program } from '../types';
import ContentCard from './ContentCard';
import { useTranslation } from 'react-i18next';

interface RelatedContentProps {
  contentId: string;
  contentType: 'game' | 'program';
  category: string;
  tags: string[];
  maxItems?: number;
}

export const RelatedContent: React.FC<RelatedContentProps> = ({
  contentId,
  contentType,
  category,
  tags,
  maxItems = 6
}) => {
  const { t } = useTranslation();
  const [relatedItems, setRelatedItems] = useState<(Game | Program)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedContent();
  }, [contentId, contentType, category, tags]);

  const loadRelatedContent = async () => {
    try {
      const table = contentType === 'game' ? 'games' : 'programs';
      
      // Fetch items from same category
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('category', category)
        .neq('id', contentId)
        .order('download_count', { ascending: false })
        .limit(maxItems * 2); // Fetch more to allow filtering

      if (error) throw error;

      if (data && data.length > 0) {
        // Calculate similarity scores
        const scored = data.map(item => {
          let score = 0;
          
          // Same category: +10 points
          if (item.category === category) score += 10;
          
          // Matching tags: +5 points each
          const matchingTags = item.tags?.filter((tag: string) => 
            tags.includes(tag)
          ).length || 0;
          score += matchingTags * 5;
          
          // High rating: +3 points
          if (item.average_rating >= 4.0) score += 3;
          
          // Popular (downloads): +2 points per 1000 downloads
          score += Math.floor(item.download_count / 1000) * 2;
          
          return { item, score };
        });

        // Sort by score and take top items
        const sorted = scored
          .sort((a, b) => b.score - a.score)
          .slice(0, maxItems)
          .map(s => s.item);

        setRelatedItems(sorted);
      }
    } catch (error) {
      console.error('Error loading related content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">You might also like</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">You might also like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedItems.map((item) => (
          <ContentCard key={item.id} item={item} type={contentType} />
        ))}
      </div>
    </div>
  );
};
