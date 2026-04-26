import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, CheckCircle2, Clock, 
  X, Save, RefreshCw, User, LogOut
} from 'lucide-react';
import api from '../api/axiosConfig';
import NotificationDropdown from '../components/NotificationDropdown';

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  'Open': 'bg-blue-100 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
  'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Closed': 'bg-slate-100 text-slate-700 border-slate-200',
};

const PRIORITY_COLORS = {
  'Critical': 'text-red-600 font-bold',
  'High': 'text-orange-600 font-semibold',
  'Medium': 'text-amber-600',
  'Low': 'text-slate-500',
};

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // ── Auth Check ─────────────────────────────────────────────────────────────
  const checkAuth = useCallback(async () => {
    try {
      console.log('Checking technician auth...');
      const res = await api.get('/auth/me');
      console.log('Auth response:', res.data);
      const role = res.data.role.toUpperCase();
      if (role !== 'TECHNICIAN' && role !== 'ADMIN') {
        console.warn('Access denied: Role is', role);
        navigate('/login');
      } else {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Auth check failed:', err.response?.status);
      navigate('/login');
    }
  }, [navigate]);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch tickets assigned to this technician
      const response = await api.get(`/tickets?assignedTo=${user.name}`);
      setTickets(response.data.content);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { checkAuth(); }, [checkAuth]);
  useEffect(() => { if (user) fetchTickets(); }, [user, fetchTickets]);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    navigate('/login');
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    progress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  }), [tickets]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    if (filter === 'All') return tickets;
    return tickets.filter(t => t.status === filter);
  }, [tickets, filter]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const openModal = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateStatus(ticket.status);
    setResolutionNotes(ticket.resolutionNotes || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put(`/tickets/${selectedTicket.id}`, {
        status: updateStatus,
        assignedTo: user.name,
        resolutionNotes
      });
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user && loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <RefreshCw className="animate-spin text-teal-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-200">
              <ClipboardList className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
              TechPortal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Technician Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage and resolve incidents assigned to you.</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit">
            {['All', 'Open', 'In Progress', 'Resolved'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === tab ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<ClipboardList className="text-blue-600" />} label="Total Assigned" value={stats.total} color="blue" />
          <StatCard icon={<Clock className="text-amber-600" />} label="Open Tickets" value={stats.open} color="amber" />
          <StatCard icon={<RefreshCw className="text-indigo-600" />} label="In Progress" value={stats.progress} color="indigo" />
          <StatCard icon={<CheckCircle2 className="text-emerald-600" />} label="Resolved" value={stats.resolved} color="emerald" />
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="py-20 text-center"><RefreshCw className="animate-spin inline-block text-teal-600" size={32} /></div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <ClipboardList size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No tickets found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">There are no tickets matching your current filter in your assigned queue.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => openModal(ticket)}
                className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${STATUS_COLORS[ticket.status]}`}>
                    {ticket.status}
                  </span>
                  <span className={`text-xs ${PRIORITY_COLORS[ticket.priority]}`}>
                    {ticket.priority} Priority
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors line-clamp-1">{ticket.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">{ticket.description}</p>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium text-slate-500">
                    <User size={12} /> {ticket.createdBy}
                  </div>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in fade-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                Update Incident Ticket
                <span className="text-xs font-mono bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-400">#{selectedTicket.id.slice(-6)}</span>
              </h3>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Status Update</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
                    <button
                      key={s} type="button"
                      onClick={() => setUpdateStatus(s)}
                      className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                        updateStatus === s ? 'bg-teal-600 text-white border-teal-600 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Resolution Notes</label>
                <textarea 
                  rows={5}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full rounded-2xl border-slate-200 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50 placeholder:text-slate-300 transition-all text-sm p-4"
                  placeholder="Describe the steps taken to resolve this incident..."
                  required={updateStatus === 'Resolved'}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setSelectedTicket(null)} className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-teal-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                  Update Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
    <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center`}>{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{label}</p>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default TechnicianDashboard;
