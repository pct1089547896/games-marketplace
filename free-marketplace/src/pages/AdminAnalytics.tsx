// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Download, Eye, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type DateRange = '7days' | '30days' | '90days' | 'all';

export const AdminAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDownloads: 0,
    totalViews: 0,
    totalContent: 0
  });
  const [viewsData, setViewsData] = useState<any[]>([]);
  const [downloadsData, setDownloadsData] = useState<any[]>([]);
  const [popularContent, setPopularContent] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const getDateFilter = () => {
    const now = new Date();
    const ranges = {
      '7days': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30days': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90days': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      'all': new Date('2020-01-01')
    };
    return ranges[dateRange].toISOString();
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();

      // Load stats
      const [usersRes, downloadsRes, viewsRes, gamesRes, programsRes] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('downloads_log').select('id', { count: 'exact', head: true }).gte('downloaded_at', dateFilter),
        supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('viewed_at', dateFilter),
        supabase.from('games').select('id', { count: 'exact', head: true }),
        supabase.from('programs').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalDownloads: downloadsRes.count || 0,
        totalViews: viewsRes.count || 0,
        totalContent: (gamesRes.count || 0) + (programsRes.count || 0)
      });

      // Load views over time
      const { data: viewsByDate } = await supabase
        .from('page_views')
        .select('viewed_at')
        .gte('viewed_at', dateFilter)
        .order('viewed_at', { ascending: true });

      if (viewsByDate) {
        const grouped = groupByDate(viewsByDate, 'viewed_at');
        setViewsData(grouped);
      }

      // Load downloads over time
      const { data: downloadsByDate } = await supabase
        .from('downloads_log')
        .select('downloaded_at')
        .gte('downloaded_at', dateFilter)
        .order('downloaded_at', { ascending: true });

      if (downloadsByDate) {
        const grouped = groupByDate(downloadsByDate, 'downloaded_at');
        setDownloadsData(grouped);
      }

      // Load popular content
      const [gamesPopular, programsPopular] = await Promise.all([
        supabase
          .from('games')
          .select('id, title, download_count, view_count')
          .order('download_count', { ascending: false })
          .limit(5),
        supabase
          .from('programs')
          .select('id, title, download_count, view_count')
          .order('download_count', { ascending: false })
          .limit(5)
      ]);

      const allPopular = [
        ...(gamesPopular.data || []).map(g => ({ ...g, type: 'game' })),
        ...(programsPopular.data || []).map(p => ({ ...p, type: 'program' }))
      ].sort((a, b) => b.download_count - a.download_count).slice(0, 10);

      setPopularContent(allPopular);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (data: any[], dateField: string) => {
    const grouped: Record<string, number> = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, count]) => ({
      date,
      count
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as DateRange)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Downloads</p>
              <p className="text-3xl font-bold mt-1">{stats.totalDownloads.toLocaleString()}</p>
            </div>
            <Download className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Page Views</p>
              <p className="text-3xl font-bold mt-1">{stats.totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Content</p>
              <p className="text-3xl font-bold mt-1">{stats.totalContent.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Page Views Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            {/* @ts-ignore - Recharts type issue */}
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <RechartsXAxis dataKey="date" tick={{ fontSize: 12 }} />
              <RechartsYAxis />
              <RechartsTooltip />
              <RechartsLegend />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" name="Views" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Downloads Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Downloads Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            {/* @ts-ignore - Recharts type issue */}
            <LineChart data={downloadsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <RechartsXAxis dataKey="date" tick={{ fontSize: 12 }} />
              <RechartsYAxis />
              <RechartsTooltip />
              <RechartsLegend />
              <Line type="monotone" dataKey="count" stroke="#10b981" name="Downloads" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Most Popular Content</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Downloads</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {popularContent.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm">{item.title}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.type === 'game' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{item.download_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.view_count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
