import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';
import RichContentRenderer from '../components/RichContentRenderer';
import GalleryDisplay from '../components/GalleryDisplay';

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBlogPost(id);
    }
  }, [id]);

  async function fetchBlogPost(postId: string) {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching blog post with ID:', postId);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .eq('is_published', true)
        .single();

      console.log('🔍 Blog post query result:', { data, error });

      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      if (!data) {
        throw new Error('Blog post not found or not published');
      }
      
      console.log('✅ Blog post data loaded:', {
        id: data.id,
        title: data.title,
        author: data.author,
        contentLength: data.content?.length
      });
      setPost(data);
    } catch (error: any) {
      console.error('❌ Error fetching blog post:', error);
      setError(`Failed to load blog post: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  }

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 150) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🔍 Render check:', { 
    loading, 
    error, 
    post: post ? 'exists' : 'null', 
    id: id 
  });

  if (error || !post) {
    console.log('Error state or no post:', { error, post });
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Blog Post Not Found</h2>
              <p className="text-red-600 mb-4">
                {error || 'The blog post you are looking for does not exist or has been removed.'}
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                <ArrowLeft size={18} />
                Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering blog post successfully:', post.title);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition mb-6"
          >
            <ArrowLeft size={18} />
            Back to Blog
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{new Date(post.publish_date).toLocaleDateString()}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <RichContentRenderer 
            content={post.content} 
            className="text-gray-800"
          />
        </div>

        {/* Image Gallery */}
        {post.id && (
          <div className="mt-8">
            <GalleryDisplay
              postId={post.id}
              postType="blog"
              layout={(post.gallery_layout as 'grid' | 'carousel' | 'masonry' | 'slideshow') || 'grid'}
              theme={(post.gallery_theme as 'default' | 'dark' | 'minimal') || 'default'}
            />
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition"
          >
            <ArrowLeft size={18} />
            Back to All Posts
          </Link>
        </div>
      </div>
    </div>
  );
}