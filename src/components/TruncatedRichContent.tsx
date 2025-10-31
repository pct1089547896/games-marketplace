import React from 'react';
import DOMPurify from 'dompurify';

interface TruncatedRichContentProps {
  content: string;
  maxLength?: number;
  className?: string;
}

/**
 * Renders rich HTML content with truncation for card/preview contexts
 * Strips HTML tags and truncates to specified length for preview,
 * or renders sanitized HTML for short content
 */
export default function TruncatedRichContent({ 
  content, 
  maxLength = 150, 
  className = '' 
}: TruncatedRichContentProps) {
  if (!content) {
    return null;
  }

  // Strip HTML tags for plain text version
  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const plainText = stripHtml(content);

  // If content is short enough, render the actual HTML with limited formatting
  if (plainText.length <= maxLength) {
    // Sanitize HTML with more restrictive settings for cards
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'span'
      ],
      ALLOWED_ATTR: ['style', 'class']
    });

    return (
      <div 
        className={`rich-content-card ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
      />
    );
  }

  // For longer content, show truncated plain text
  const truncated = plainText.substring(0, maxLength) + '...';
  
  return (
    <p className={className}>
      {truncated}
    </p>
  );
}
