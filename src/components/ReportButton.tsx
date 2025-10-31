import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flag, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface ReportButtonProps {
  contentId: string;
  contentType: 'game' | 'program' | 'blog' | 'forum_thread' | 'forum_reply';
}

export const ReportButton: React.FC<ReportButtonProps> = ({ contentId, contentType }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { value: 'spam', label: 'Spam or misleading' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'broken_link', label: 'Broken download link' },
    { value: 'malware', label: 'Potential malware' },
    { value: 'copyright', label: 'Copyright violation' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to report content');
      return;
    }

    if (!reason) {
      alert('Please select a reason');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_reports')
        .insert({
          content_id: contentId,
          content_type: contentType,
          reporter_id: user.id,
          reason,
          description: description || null
        });

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setReason('');
        setDescription('');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-500 hover:text-red-600 flex items-center space-x-1 text-sm transition"
      >
        <Flag className="w-4 h-4" />
        <span>Report</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Flag className="w-5 h-5" />
                <span>Report Content</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <p className="text-lg font-semibold">Report submitted successfully</p>
                <p className="text-sm text-gray-500 mt-2">
                  Thank you for helping us maintain a safe community
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reason for reporting
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a reason</option>
                    {reasons.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Provide more information about this report..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
