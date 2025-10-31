import React from 'react';
import DOMPurify from 'dompurify';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export default function RichContentRenderer({ content, className = '' }: RichContentRendererProps) {
  // Sanitize HTML to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img', 'video', 'iframe',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title',
      'width', 'height', 'style', 'class',
      'controls', 'autoplay', 'loop', 'muted',
      'frameborder', 'allowfullscreen'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  return (
    <div 
      className={`rich-content prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}
    />
  );
}
