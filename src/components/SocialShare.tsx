import React from 'react';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SocialShareProps {
  title: string;
  url?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ title, url }) => {
  const { t } = useTranslation();
  const shareUrl = url || window.location.href;

  const shareLinks = [
    {
      name: 'Twitter',
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-black hover:text-white'
    },
    {
      name: 'Facebook',
      icon: 'f',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-600 hover:text-white'
    },
    {
      name: 'WhatsApp',
      icon: '📱',
      url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`,
      color: 'hover:bg-green-500 hover:text-white'
    },
    {
      name: 'Reddit',
      icon: 'R',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
      color: 'hover:bg-orange-500 hover:text-white'
    }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-1">
        <Share2 className="w-4 h-4" />
        <span>Share:</span>
      </span>
      
      {shareLinks.map((platform) => (
        <a
          key={platform.name}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 transition ${platform.color}`}
          title={`Share on ${platform.name}`}
        >
          <span className="text-sm font-bold">{platform.icon}</span>
        </a>
      ))}

      <button
        onClick={handleCopyLink}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        title="Copy link"
      >
        <span className="text-sm">🔗</span>
      </button>
    </div>
  );
};
