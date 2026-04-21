import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin, Users, RefreshCw, AlertCircle, XCircle } from 'lucide-react';

const API = 'http://localhost:8080/api/bookings';

// ── Status badge colours ─────────────────────────────────────────────
const statusStyle = {
  PENDING:   { bg: '#FFF8E1', text: '#B45309', label: 'Pending' },
  APPROVED:  { bg: '#E8FFF5', text: '#065F46', label: 'Approved' },
  REJECTED:  { bg: '#FEF2F2', text: '#991B1B', label: 'Rejected' },
  CANCELLED: { bg: '#F3F4F6', text: '#374151', label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const s = statusStyle[status] || statusStyle.PENDING;
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
};

// ── Hardcoded email — replace with auth context in production ────────
const CURRENT_USER_EMAIL = 'user@sliit.lk';

const MyBookings = () => {
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [cancelling, setCancelling] = useState(null); // id being cancelled

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ email: CURRENT_USER_EMAIL });
      if (filterStatus) params.append('status', filterStatus);

      const res  = await fetch(`${API}?${params}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load bookings. Ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filterStatus]); // eslint-disable-line

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      const res = await fetch(`${API}/${id}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: 'CANCELLED' }),
      });
      if (res.ok) {
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || 'Could not cancel the booking.');
      }
    } catch {
      alert('Server error. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#010101]">My Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Showing bookings for <strong>{CURRENT_USER_EMAIL}</strong></p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#36bdac] bg-white text-[#010101]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchBookings}
            className="p-2 rounded-lg border border-gray-200 hover:bg-[#dafff7] transition"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#36bdac]' : 'text-gray-500'} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
          ))}
        </div>
      )}

      {/* Booking cards */}
      {!loading && !error && (
        bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <CalendarDays size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No bookings found{filterStatus ? ` with status "${filterStatus}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-md transition"
              >
                {/* Left: main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-[#36bdac] bg-[#dafff7] px-2 py-0.5 rounded">
                      {b.id}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm text-[#010101]">
                    <span className="flex items-center gap-1 text-gray-500">
                      <MapPin size={13} />
                      <span className="truncate">{b.location || 'N/A'}</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <CalendarDays size={13} />
                      {b.date || '—'}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock size={13} />
                      {b.startTime} – {b.endTime}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Users size={13} />
                      {b.attendees} attendee{b.attendees !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {b.purpose && (
                    <p className="mt-2 text-xs text-gray-400 truncate">
                      Purpose: {b.purpose}
                    </p>
                  )}

                  {b.status === 'REJECTED' && b.rejectionReason && (
                    <p className="mt-1 text-xs text-red-500">
                      Reason: {b.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Right: Cancel button (only for APPROVED bookings) */}
                {b.status === 'APPROVED' && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelling === b.id}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    <XCircle size={15} />
                    {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MyBookings;
