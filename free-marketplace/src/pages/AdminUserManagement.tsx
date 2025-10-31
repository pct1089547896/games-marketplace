import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Edit2, 
  Trash2, 
  CheckSquare, 
  Square,
  UserCheck,
  UserX,
  ChevronLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  post_count: number;
  account_status: string;
  is_admin: boolean;
  created_at: string;
  last_active: string | null;
}

export default function AdminUserManagement() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterUsers() {
    let filtered = users;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.account_status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.display_name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  }

  function toggleUserSelection(userId: string) {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  }

  function toggleSelectAll() {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  }

  async function handleUpdateUserStatus(userId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ account_status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      await supabase.from('admin_logs').insert({
        admin_id: user!.id,
        action: 'update_user_status',
        target_type: 'user',
        target_id: userId,
        details: { new_status: newStatus }
      });

      alert(t('admin.statusUpdatedSuccess'));
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert(t('common.error'));
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm(t('admin.deleteConfirmation'))) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await supabase.from('admin_logs').insert({
        admin_id: user!.id,
        action: 'delete_user',
        target_type: 'user',
        target_id: userId,
        details: {}
      });

      alert(t('admin.userDeletedSuccess'));
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(t('common.error'));
    }
  }

  async function handleBulkDelete() {
    if (selectedUsers.size === 0) return;
    if (!confirm(t('admin.bulkDeleteConfirmation', { count: selectedUsers.size }))) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .in('id', Array.from(selectedUsers));

      if (error) throw error;

      for (const userId of selectedUsers) {
        await supabase.from('admin_logs').insert({
          admin_id: user!.id,
          action: 'bulk_delete_user',
          target_type: 'user',
          target_id: userId,
          details: {}
        });
      }

      alert(t('admin.userDeletedSuccess'));
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      alert(t('common.error'));
    }
  }

  async function handleUpdateUser(updatedUser: Partial<UserProfile>) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updatedUser)
        .eq('id', editingUser!.id);

      if (error) throw error;

      await supabase.from('admin_logs').insert({
        admin_id: user!.id,
        action: 'update_user',
        target_type: 'user',
        target_id: editingUser!.id,
        details: updatedUser
      });

      alert(t('admin.statusUpdatedSuccess'));
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(t('common.error'));
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('admin.loading')}</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition"
            >
              <ChevronLeft size={20} />
              {t('admin.back')}
            </button>
            <h1 className="text-2xl font-bold">{t('admin.userManagement')}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('admin.searchUsers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">{t('admin.all')}</option>
              <option value="active">{t('admin.active')}</option>
              <option value="inactive">{t('admin.inactive')}</option>
              <option value="suspended">{t('admin.suspended')}</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.size} {t('admin.selected')}
              </span>
            </div>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <Trash2 size={18} />
              {t('admin.deleteSelected')}
            </button>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-600 hover:text-black transition"
                    >
                      {selectedUsers.size === filteredUsers.length ? (
                        <CheckSquare size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.userName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.postCount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.joinedDate')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {t('admin.noUsersFound')}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((usr) => (
                    <tr key={usr.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleUserSelection(usr.id)}
                          className="text-gray-600 hover:text-black transition"
                        >
                          {selectedUsers.has(usr.id) ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {usr.avatar_url ? (
                            <img src={usr.avatar_url} alt={usr.display_name} className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 text-sm font-bold">
                                {usr.display_name?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{usr.display_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{usr.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          usr.account_status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : usr.account_status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {t(`admin.${usr.account_status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{usr.post_count || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(usr.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingUser(usr)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title={t('admin.edit')}
                          >
                            <Edit2 size={18} />
                          </button>
                          {usr.account_status === 'active' ? (
                            <button
                              onClick={() => handleUpdateUserStatus(usr.id, 'suspended')}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded transition"
                              title={t('admin.deactivate')}
                            >
                              <UserX size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateUserStatus(usr.id, 'active')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                              title={t('admin.activate')}
                            >
                              <UserCheck size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title={t('admin.delete')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Count */}
        <div className="mt-4 text-sm text-gray-600">
          {t('admin.showing')} {filteredUsers.length} {t('admin.of')} {users.length} {t('admin.users')}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">{t('admin.editUser')}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser({
                display_name: (e.target as any).display_name.value,
                account_status: (e.target as any).account_status.value
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.displayName')}
                  </label>
                  <input
                    type="text"
                    name="display_name"
                    defaultValue={editingUser.display_name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.accountStatus')}
                  </label>
                  <select
                    name="account_status"
                    defaultValue={editingUser.account_status}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="active">{t('admin.active')}</option>
                    <option value="inactive">{t('admin.inactive')}</option>
                    <option value="suspended">{t('admin.suspended')}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  {t('admin.save')}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  {t('admin.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
