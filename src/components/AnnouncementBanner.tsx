import React, { useEffect, useState } from 'react';
import { X, Info, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  show_icon: boolean;
  is_dismissible: boolean;
  link_url?: string;
  link_text?: string;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
    
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      setDismissedIds(JSON.parse(dismissed));
    }
  }, []);

  useEffect(() => {
    // Trigger animation after data is loaded
    if (announcements.length > 0) {
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [announcements]);

  async function fetchAnnouncements() {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_enabled', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }

  function handleDismiss(id: string) {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  }

  function getTypeStyles(type: string) {
    switch (type) {
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-900',
          icon: 'text-blue-600'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
          border: 'border-yellow-300',
          text: 'text-yellow-900',
          icon: 'text-yellow-600'
        };
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-green-100',
          border: 'border-green-300',
          text: 'text-green-900',
          icon: 'text-green-600'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-red-100',
          border: 'border-red-300',
          text: 'text-red-900',
          icon: 'text-red-600'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-900',
          icon: 'text-gray-600'
        };
    }
  }

  function getTypeIcon(type: string, iconColor: string) {
    const iconClass = `${iconColor} flex-shrink-0`;
    switch (type) {
      case 'info': return <Info size={24} className={iconClass} />;
      case 'warning': return <AlertTriangle size={24} className={iconClass} />;
      case 'success': return <CheckCircle size={24} className={iconClass} />;
      case 'error': return <XCircle size={24} className={iconClass} />;
      default: return <Info size={24} className={iconClass} />;
    }
  }

  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedIds.includes(announcement.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-2 py-2 px-4">
      {visibleAnnouncements.map((announcement, index) => {
        const styles = getTypeStyles(announcement.type);
        
        return (
          <div
            key={announcement.id}
            className={`
              ${styles.bg} ${styles.border} ${styles.text}
              border-2 rounded-lg shadow-md
              transform transition-all duration-500 ease-out
              ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}
            `}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-start gap-4">
                {/* Icon */}
                {announcement.show_icon && (
                  <div className="mt-0.5 animate-pulse">
                    {getTypeIcon(announcement.type, styles.icon)}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1">{announcement.title}</h3>
                  <p className="text-sm leading-relaxed mb-2">{announcement.message}</p>
                  
                  {/* Link */}
                  {announcement.link_url && announcement.link_text && (
                    <a
                      href={announcement.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold hover:underline transition-all hover:gap-3"
                    >
                      {announcement.link_text}
                      <ExternalLink size={16} className="animate-bounce" />
                    </a>
                  )}
                </div>

                {/* Dismiss Button */}
                {announcement.is_dismissible && (
                  <button
                    onClick={() => handleDismiss(announcement.id)}
                    className={`
                      ${styles.icon} 
                      p-1 rounded-full 
                      hover:bg-black hover:bg-opacity-10 
                      transition-all duration-200
                      hover:rotate-90
                      flex-shrink-0
                    `}
                    aria-label="Dismiss announcement"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
