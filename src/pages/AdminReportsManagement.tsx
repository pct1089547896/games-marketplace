import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ContentReport } from '../types';
import { useTranslation } from 'react-i18next';
import { Flag, CheckCircle, XCircle, Eye } from 'lucide-react';

export const AdminReportsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed'>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('content_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: ContentReport['status'], notes?: string) => {
    try {
      const updateData: any = { 
        status,
        resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null
      };

      if (notes) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from('content_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      setSelectedReport(null);
      setAdminNotes('');
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    }
  };

  const getStatusBadge = (status: ContentReport['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      inappropriate: 'Inappropriate',
      broken_link: 'Broken Link',
      malware: 'Malware',
      copyright: 'Copyright',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Reports Management</h2>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
        {(['all', 'pending', 'reviewing', 'resolved', 'dismissed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-medium transition ${
              filter === status
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Flag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No reports found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusBadge(report.status)}
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-medium">
                      {getReasonLabel(report.reason)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Content Type:</span> {report.content_type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Content ID:</span> {report.content_id}
                    </p>
                    {report.description && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Description:</span> {report.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(report)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  <span>Review</span>
                </button>
              </div>

              {report.admin_notes && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-sm font-medium mb-1">Admin Notes:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.admin_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Review Report</h3>

            <div className="space-y-4 mb-6">
              <div>
                <span className="font-medium">Status:</span> {getStatusBadge(selectedReport.status)}
              </div>
              <div>
                <span className="font-medium">Reason:</span> {getReasonLabel(selectedReport.reason)}
              </div>
              <div>
                <span className="font-medium">Content Type:</span> {selectedReport.content_type}
              </div>
              <div>
                <span className="font-medium">Content ID:</span> {selectedReport.content_id}
              </div>
              <div>
                <span className="font-medium">Reported:</span>{' '}
                {new Date(selectedReport.created_at).toLocaleString()}
              </div>
              {selectedReport.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedReport.description}</p>
                </div>
              )}
              {selectedReport.admin_notes && (
                <div>
                  <span className="font-medium">Previous Admin Notes:</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedReport.admin_notes}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                rows={3}
                placeholder="Add notes about this report..."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedReport.status === 'pending' && (
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'reviewing', adminNotes)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Start Reviewing</span>
                </button>
              )}
              <button
                onClick={() => updateReportStatus(selectedReport.id, 'resolved', adminNotes)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Resolve</span>
              </button>
              <button
                onClick={() => updateReportStatus(selectedReport.id, 'dismissed', adminNotes)}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
              >
                <XCircle className="w-4 h-4" />
                <span>Dismiss</span>
              </button>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setAdminNotes('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
