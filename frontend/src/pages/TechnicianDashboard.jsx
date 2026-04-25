import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, X, Save, RefreshCw, User, LogOut
} from 'lucide-react';
import api from '../api/axiosConfig';

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  'Open':        'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Resolved':    'bg-green-100 text-green-700',
  'Closed':      'bg-gray-100 text-gray-500',
};

const PRIORITY_COLORS = {
  'Critical': 'bg-red-100 text-red-700',
  'High':     'bg-orange-100 text-orange-700',
  'Medium':   'bg-yellow-100 text-yellow-700',
  'Low':      'bg-sky-100 text-sky-700',
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const TechnicianDashboard = () => {
  const navigate = useNavigate();

  // Auth state
  const [user, setUser]         = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Ticket state
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');       // all | mine | open | in_progress
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState({ status: '', resolutionNotes: '' });
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');

  // ── 1. Check authentication ──────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        const u = res.data;
        if (u.role !== 'TECHNICIAN' && u.role !== 'ADMIN') {
          navigate('/login');
          return;
        }
        setUser(u);
      } catch {
        navigate('/login');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // ── 2. Fetch tickets ─────────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ size: 100 });
      if (filter === 'mine' && user)     params.set('assignedTo', user.name);
      if (filter === 'open')             params.set('status', 'Open');
      if (filter === 'in_progress')      params.set('status', 'In Progress');

      const res = await api.get(`/tickets?${params}`);
      setTickets(res.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useEffect(() => {
    if (!authLoading && user) fetchTickets();
  }, [authLoading, user, fetchTickets]);

  // ── 3. Stats ─────────────────────────────────────────────────────────────
  const stats = {
    total:      tickets.length,
    open:       tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved:   tickets.filter(t => t.status === 'Resolved').length,
  };

  // ── 4. Update ticket ──────────────────────────────────────────────────────
  const openModal = (ticket) => {
    setSelected(ticket);
    setForm({ status: ticket.status, resolutionNotes: ticket.resolutionNotes || '' });
    setSaveMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/tickets/${selected.id}`, {
        ...selected,
        status: form.status,
        resolutionNotes: form.resolutionNotes,
        assignedTo: user?.name || 'Technician',
      });
      setSaveMsg('✓ Saved successfully');
      fetchTickets();
      setTimeout(() => { setSelected(null); setSaveMsg(''); }, 800);
    } catch {
      setSaveMsg('✗ Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ── 5. Logout ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    navigate('/login');
  };

  // ── Loading states ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="text-teal-600 font-semibold animate-pulse">Authenticating…</div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* ── Top Nav ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
              <ClipboardList size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-lg">Smart Campus</span>
            <span className="ml-2 text-xs font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
              Technician
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
                <User size={14} className="text-teal-700" />
              </div>
              <span className="font-medium">{user?.name}</span>
            </div>
            <button
              id="tech-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* ── Welcome ── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's an overview of your assigned incident tickets.
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<ClipboardList size={22} className="text-teal-700" />}
            label="Total Tickets"
            value={stats.total}
            color="bg-teal-50"
          />
          <StatCard
            icon={<AlertTriangle size={22} className="text-blue-600" />}
            label="Open"
            value={stats.open}
            color="bg-blue-50"
          />
          <StatCard
            icon={<Clock size={22} className="text-amber-600" />}
            label="In Progress"
            value={stats.inProgress}
            color="bg-amber-50"
          />
          <StatCard
            icon={<CheckCircle2 size={22} className="text-green-600" />}
            label="Resolved"
            value={stats.resolved}
            color="bg-green-50"
          />
        </div>

        {/* ── Filter Tabs + Refresh ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all',         label: 'All Tickets' },
              { key: 'mine',        label: 'Assigned to Me' },
              { key: 'open',        label: 'Open' },
              { key: 'in_progress', label: 'In Progress' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-teal-600 text-white shadow'
                    : 'bg-white border border-slate-200 text-gray-600 hover:border-teal-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={fetchTickets}
            className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* ── Ticket Table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 animate-pulse">Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No tickets found for this filter.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Title', 'Category', 'Priority', 'Status', 'Assigned To', 'Created By', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800 max-w-[200px] truncate">
                      {ticket.title}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{ticket.category || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[ticket.priority] || 'bg-gray-100 text-gray-500'}`}>
                        {ticket.priority || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[ticket.status] || 'bg-gray-100 text-gray-500'}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{ticket.assignedTo || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500">{ticket.createdBy || '—'}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => openModal(ticket)}
                        className="flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium text-xs"
                      >
                        Update <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── Update Modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-1">Update Ticket</h3>
            <p className="text-sm text-gray-500 mb-5 truncate">{selected.title}</p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Assign to me */}
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-lg px-4 py-2.5 text-sm text-teal-700">
                <User size={14} />
                <span>Will be assigned to <strong>{user?.name}</strong></span>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
                <textarea
                  rows={4}
                  value={form.resolutionNotes}
                  onChange={e => setForm(f => ({ ...f, resolutionNotes: e.target.value }))}
                  placeholder="Describe the steps taken to resolve this incident…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
              </div>

              {saveMsg && (
                <p className={`text-sm font-medium ${saveMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                  {saveMsg}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                >
                  <Save size={15} />
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
