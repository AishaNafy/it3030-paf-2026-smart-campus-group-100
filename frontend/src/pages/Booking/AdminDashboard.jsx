import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle, XCircle, Trash2, RefreshCw, AlertCircle,
  CalendarDays, Clock, MapPin, Users, ChevronDown, ChevronUp
} from 'lucide-react';

const API = 'http://localhost:8080/api/bookings';

// ── Status badge ─────────────────────────────────────────────────────
const statusStyle = {
  PENDING:   { bg: '#FFF8E1', text: '#B45309' },
  APPROVED:  { bg: '#E8FFF5', text: '#065F46' },
  REJECTED:  { bg: '#FEF2F2', text: '#991B1B' },
  CANCELLED: { bg: '#F3F4F6', text: '#374151' },
};

const StatusBadge = ({ status }) => {
  const s = statusStyle[status] || statusStyle.PENDING;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: s.bg, color: s.text }}>
      {status}
    </span>
  );
};

// ── Expandable row for details ────────────────────────────────────────
const BookingRow = ({ booking, onApprove, onReject, onDelete, actionLoading }) => {
  const [expanded, setExpanded] = useState(false);
  const isLoading = actionLoading === booking.id;

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-[#dafff7]/30 transition">
        {/* ID */}
        <td className="px-4 py-3">
          <span className="font-mono text-xs font-bold text-[#36bdac] bg-[#dafff7] px-2 py-0.5 rounded">
            {booking.id}
          </span>
        </td>
        {/* User */}
        <td className="px-4 py-3 text-sm text-[#010101]">{booking.userEmail}</td>
        {/* Resource */}
        <td className="px-4 py-3 text-sm text-gray-600">#{booking.resourceId}</td>
        {/* Location */}
        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
          <span className="flex items-center gap-1"><MapPin size={12} />{booking.location || '—'}</span>
        </td>
        {/* Date */}
        <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
          <span className="flex items-center gap-1"><CalendarDays size={12} />{booking.date}</span>
        </td>
        {/* Time */}
        <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
          <span className="flex items-center gap-1"><Clock size={12} />{booking.startTime}–{booking.endTime}</span>
        </td>
        {/* Status */}
        <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
              title="Details"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {/* Approve — only for PENDING */}
            {booking.status === 'PENDING' && (
              <button
                onClick={() => onApprove(booking.id)}
                disabled={isLoading}
                title="Approve"
                className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition disabled:opacity-40"
              >
                <CheckCircle size={17} />
              </button>
            )}

            {/* Reject — only for PENDING */}
            {booking.status === 'PENDING' && (
              <button
                onClick={() => onReject(booking.id)}
                disabled={isLoading}
                title="Reject"
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition disabled:opacity-40"
              >
                <XCircle size={17} />
              </button>
            )}

            {/* Delete — always available for admin */}
            <button
              onClick={() => onDelete(booking.id)}
              disabled={isLoading}
              title="Delete record"
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition disabled:opacity-40"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-[#dafff7]/20">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-[#010101]">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Attendees</p>
                <p className="flex items-center gap-1"><Users size={13} />{booking.attendees}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Purpose</p>
                <p>{booking.purpose || '—'}</p>
              </div>
              {booking.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Rejection Reason</p>
                  <p className="text-red-600">{booking.rejectionReason}</p>
                </div>
              )}
              {booking.createdAt && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Created</p>
                  <p>{new Date(booking.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ── Main component ────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [bookings,       setBookings]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterEmail,    setFilterEmail]    = useState('');
  const [actionLoading,  setActionLoading]  = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterEmail)  params.append('email',  filterEmail.trim());

      const res  = await fetch(`${API}?${params}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load bookings. Ensure the server is running on port 8080.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterEmail]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const performStatusUpdate = async (id, status, reason) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API}/${id}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status, reason: reason || '' }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Action failed.');
      }
      fetchBookings();
    } catch {
      alert('Server error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (id) => {
    if (window.confirm('Approve this booking?')) {
      performStatusUpdate(id, 'APPROVED', '');
    }
  };

  const handleReject = (id) => {
    const reason = window.prompt('Enter rejection reason (required):');
    if (reason === null) return;           // user pressed Cancel
    if (!reason.trim()) { alert('Rejection reason cannot be empty.'); return; }
    performStatusUpdate(id, 'REJECTED', reason.trim());
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Permanently delete booking ${id}? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' });
      fetchBookings();
    } catch {
      alert('Delete failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Stats summary ────────────────────────────────────────────────
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: 'Total',     value: bookings.length,        bg: '#dafff7', border: '#36bdac' },
    { label: 'Pending',   value: counts.PENDING   || 0,  bg: '#FFF8E1', border: '#F59E0B' },
    { label: 'Approved',  value: counts.APPROVED  || 0,  bg: '#E8FFF5', border: '#10B981' },
    { label: 'Rejected',  value: counts.REJECTED  || 0,  bg: '#FEF2F2', border: '#EF4444' },
  ];

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#010101]">Manage Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Review, approve, reject, and manage all booking requests.</p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-[#dafff7] transition"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin text-[#36bdac]' : 'text-gray-500'} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div
            key={s.label}
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: s.bg, borderColor: s.border }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase">{s.label}</p>
            <p className="text-3xl font-bold text-[#010101] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="email"
          placeholder="Filter by user email…"
          value={filterEmail}
          onChange={e => setFilterEmail(e.target.value)}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#36bdac] bg-white"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#36bdac] bg-white"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#dafff7] text-[#010101] text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Resource</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Location</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Time</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-4">
                      <div className="h-5 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-400 text-sm">
                    No bookings found matching the current filters.
                  </td>
                </tr>
              ) : (
                bookings.map(b => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDelete={handleDelete}
                    actionLoading={actionLoading}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
