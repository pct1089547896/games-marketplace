import { useMemo, useState, useRef } from 'react';
// @ts-ignore - ReactQuill type issues with React 18
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Eye, FileText, Image as ImageIcon } from 'lucide-react';
import ImageUploadModal from './ImageUploadModal';
import ContentTemplates from './ContentTemplates';
import ContentPreviewModal from './ContentPreviewModal';

interface EnhancedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  contentType: 'games' | 'programs' | 'blog';
  bucketName: string;
}

export default function EnhancedRichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  minHeight = '300px',
  contentType,
  bucketName
}: EnhancedRichTextEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const quillRef = useRef<any>(null);

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        // Text formatting
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        
        // Text styles
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        
        // Paragraph formatting
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        
        // Insert options
        ['blockquote', 'code-block'],
        ['link'],
        
        // Clear formatting
        ['clean']
      ],
      handlers: {
        // Custom image handler will be set up after component mounts
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), []);

  // Quill formats
  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const handleImageInsert = (url: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      const position = range ? range.index : quill.getLength();
      quill.insertEmbed(position, 'image', url);
      quill.setSelection(position + 1);
    }
  };

  const handleTemplateSelect = (templateContent: string) => {
    // Replace entire content with template
    onChange(templateContent);
  };

  const QuillEditor = ReactQuill as any;

  return (
    <div className="space-y-2">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setShowTemplates(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
        >
          <FileText size={16} />
          Templates
        </button>
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
        >
          <ImageIcon size={16} />
          Upload Image
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition"
        >
          <Eye size={16} />
          Preview
        </button>
      </div>

      {/* Rich Text Editor */}
      <div className="rich-text-editor">
        <QuillEditor
          ref={quillRef}
          theme="snow"
          value={value || ''}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
        <style>{`
          .rich-text-editor .ql-container {
            min-height: ${minHeight};
            font-size: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          .rich-text-editor .ql-editor {
            min-height: ${minHeight};
            padding: 16px;
          }
          
          .rich-text-editor .ql-editor.ql-blank::before {
            font-style: normal;
            color: #9ca3af;
          }
          
          .rich-text-editor .ql-toolbar {
            border: 1px solid #e5e7eb;
            border-radius: 8px 8px 0 0;
            background: #f9fafb;
          }
          
          .rich-text-editor .ql-container {
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
            background: white;
          }
          
          .rich-text-editor .ql-editor h1 {
            font-size: 2em;
            font-weight: bold;
            margin: 0.67em 0;
          }
          
          .rich-text-editor .ql-editor h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.83em 0;
          }
          
          .rich-text-editor .ql-editor h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin: 1em 0;
          }
          
          .rich-text-editor .ql-editor h4 {
            font-size: 1em;
            font-weight: bold;
            margin: 1.33em 0;
          }
          
          .rich-text-editor .ql-editor h5 {
            font-size: 0.83em;
            font-weight: bold;
            margin: 1.67em 0;
          }
          
          .rich-text-editor .ql-editor h6 {
            font-size: 0.67em;
            font-weight: bold;
            margin: 2.33em 0;
          }
          
          .rich-text-editor .ql-editor blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 16px;
            margin: 16px 0;
            font-style: italic;
          }
          
          .rich-text-editor .ql-editor pre {
            background: #1f2937;
            color: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
          }
          
          .rich-text-editor .ql-editor code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
          }
          
          .rich-text-editor .ql-editor a {
            color: #2563eb;
            text-decoration: underline;
          }
          
          .rich-text-editor .ql-editor img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 16px 0;
          }
          
          .rich-text-editor .ql-editor ul,
          .rich-text-editor .ql-editor ol {
            padding-left: 1.5em;
            margin: 12px 0;
          }
          
          .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-label {
            border-color: #000;
          }
          
          .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-options {
            border-color: #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .rich-text-editor .ql-snow.ql-toolbar button:hover,
          .rich-text-editor .ql-snow .ql-toolbar button:hover,
          .rich-text-editor .ql-snow.ql-toolbar button:focus,
          .rich-text-editor .ql-snow .ql-toolbar button:focus {
            color: #000;
          }
          
          .rich-text-editor .ql-snow.ql-toolbar button.ql-active,
          .rich-text-editor .ql-snow .ql-toolbar button.ql-active {
            color: #000;
          }
        `}</style>
      </div>

      {/* Modals */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onImageInsert={handleImageInsert}
        bucketName={bucketName}
      />

      <ContentTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onTemplateSelect={handleTemplateSelect}
        contentType={contentType}
      />

      <ContentPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        content={value}
        title={`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Preview`}
      />
    </div>
  );
}
