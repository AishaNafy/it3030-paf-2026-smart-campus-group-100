import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users, UserPlus, Shield, Trash2, RefreshCw,
  AlertCircle, CheckCircle2, X, ChevronDown
} from 'lucide-react';
import api from '../api/axiosConfig';

const ROLES = ['STUDENT', 'TECHNICIAN', 'ADMIN'];

const ROLE_BADGES = {
  ADMIN:      'bg-purple-100 text-purple-700',
  TECHNICIAN: 'bg-amber-100 text-amber-700',
  STUDENT:    'bg-teal-100 text-teal-700',
};

const UserManagementPage = () => {
  const { role } = useOutletContext();

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Create user modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '', email: '', phoneNumber: '', nic: '',
    temporaryPassword: '', role: 'STUDENT',
  });
  const [createErr, setCreateErr]   = useState('');
  const [createOk, setCreateOk]     = useState(false);
  const [creating, setCreating]     = useState(false);

  // Role update
  const [updatingId, setUpdatingId] = useState(null);

  // Delete confirm
  const [deleteId, setDeleteId]     = useState(null);

  // ── Fetch users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.nic?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  // ── Create user ────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr(''); setCreateOk(false); setCreating(true);
    try {
      await api.post('/admin/users', createForm);
      setCreateOk(true);
      setCreateForm({ name: '', email: '', phoneNumber: '', nic: '', temporaryPassword: '', role: 'STUDENT' });
      fetchUsers();
      setTimeout(() => { setShowCreate(false); setCreateOk(false); }, 1500);
    } catch (err) {
      setCreateErr(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  // ── Update role ────────────────────────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete user ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteId}`);
      setUsers(prev => prev.filter(u => u.id !== deleteId));
    } catch (err) {
      alert('Failed to delete user.');
    } finally {
      setDeleteId(null);
    }
  };

  if (role?.toUpperCase() !== 'ADMIN') {
    return <div className="p-8 text-center text-red-500">Access Denied.</div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={24} className="text-teal-600" /> User Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Create accounts, update roles, and manage users.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-gray-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            id="open-create-user"
            onClick={() => { setShowCreate(true); setCreateErr(''); setCreateOk(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <UserPlus size={15} /> Add User
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {ROLES.map(r => (
          <div key={r} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
            <Shield size={18} className="text-teal-600" />
            <div>
              <p className="text-xs text-gray-500">{r}</p>
              <p className="text-xl font-bold text-gray-800">
                {users.filter(u => u.role === r).length}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name, email or NIC…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <div className="flex gap-1">
          {['ALL', ...ROLES].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                roleFilter === r ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-gray-600 hover:border-teal-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Email', 'NIC', 'Phone', 'Role', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{u.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.nic || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.phoneNumber || '—'}</td>

                  {/* Role Dropdown */}
                  <td className="px-5 py-3.5">
                    <div className="relative inline-flex items-center">
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className={`appearance-none pl-2 pr-7 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 transition-opacity ${
                          ROLE_BADGES[u.role] || 'bg-gray-100 text-gray-600'
                        } ${updatingId === u.id ? 'opacity-50' : ''}`}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown size={11} className="absolute right-1.5 pointer-events-none text-current opacity-60" />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setDeleteId(u.id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create User Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowCreate(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Add New User</h3>
            <p className="text-sm text-gray-500 mb-5">Create an account with any role.</p>

            {createOk && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
                <CheckCircle2 size={15} /> User created successfully!
              </div>
            )}
            {createErr && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
                <AlertCircle size={15} /> {createErr}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              {[
                { id: 'cu-name',  field: 'name',              label: 'Full Name',     placeholder: 'John Doe' },
                { id: 'cu-email', field: 'email',             label: 'Email',         placeholder: 'john@example.com', type: 'email' },
                { id: 'cu-phone', field: 'phoneNumber',       label: 'Phone (10 digits)', placeholder: '0771234567' },
                { id: 'cu-nic',   field: 'nic',               label: 'NIC',           placeholder: '200012345678' },
                { id: 'cu-pass',  field: 'temporaryPassword', label: 'Password (min 6)', placeholder: '••••••••', type: 'password' },
              ].map(({ id, field, label, placeholder, type = 'text' }) => (
                <div key={id}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    id={id}
                    type={type}
                    required
                    value={createForm[field]}
                    onChange={e => setCreateForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <select
                  id="cu-role"
                  value={createForm.role}
                  onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="cu-submit"
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                >
                  {creating ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete User?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
