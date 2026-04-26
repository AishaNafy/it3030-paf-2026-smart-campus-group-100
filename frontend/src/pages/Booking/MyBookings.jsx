import React, { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays, Clock, MapPin, Users, RefreshCw,
  AlertCircle, XCircle, ChevronDown, ChevronUp,
  BadgeInfo, CheckCircle, Ban, Trash2, Pencil,
  AlertTriangle, Save, History
} from 'lucide-react';

const API = 'http://localhost:8080/api/bookings';

/* ─────────────────────────────────────────────────────────────────────
   NORMALIZER
   Handles BOTH old timestamp format (from pre-fix MongoDB documents)
   AND new plain-string format so everything displays cleanly.

   Old format examples:
     date:      "2026-04-22T00:00:00.000+00:00"  or  [2026,4,22]
     startTime: "2026-04-21T17:18:00.000+00:00"  or  [17,18]
   New format examples:
     date:      "2026-04-22"
     startTime: "17:18"
───────────────────────────────────────────────────────────────────── */
function extractDate(raw) {
  if (!raw) return '';
  if (Array.isArray(raw)) {
    // Spring serialises LocalDate as [year, month, day]
    const [y, m, d] = raw;
    return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }
  const s = String(raw);
  // Already plain "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // ISO timestamp — take the date part only
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : s;
}

function extractTime(raw) {
  if (!raw) return '';
  if (Array.isArray(raw)) {
    // Spring serialises LocalTime as [hour, minute] or [hour, minute, second]
    const [h, m] = raw;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  const s = String(raw);
  // Already "HH:mm" or "HH:mm:ss"
  if (/^\d{2}:\d{2}/.test(s)) return s.substring(0, 5);
  // ISO timestamp — extract time portion, then convert from UTC to local if needed
  const match = s.match(/T(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  return s;
}

function normalizeBooking(b) {
  return {
    ...b,
    date:      extractDate(b.date),
    startTime: extractTime(b.startTime),
    endTime:   extractTime(b.endTime),
  };
}

function normalizeDeleted(d) {
  return {
    ...d,
    date:      extractDate(d.date),
    startTime: extractTime(d.startTime),
    endTime:   extractTime(d.endTime),
  };
}

/* ── helpers ─────────────────────────────────────────────────────── */
const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-200 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#36bdac] ' +
  'text-[#010101] bg-white text-sm transition';
const labelClass =
  'block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide';

/* ── Status badge ─────────────────────────────────────────────────── */
const statusStyle = {
  PENDING:   { bg: '#FFF8E1', text: '#B45309', label: 'Pending'   },
  APPROVED:  { bg: '#E8FFF5', text: '#065F46', label: 'Approved'  },
  REJECTED:  { bg: '#FEF2F2', text: '#991B1B', label: 'Rejected'  },
  CANCELLED: { bg: '#F3F4F6', text: '#374151', label: 'Cancelled' },
};
const StatusBadge = ({ status }) => {
  const s = statusStyle[status] || statusStyle.PENDING;
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
  );
};

/* ── Delete Modal ─────────────────────────────────────────────────── */
const DeleteModal = ({ bookingId, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border-b border-red-100">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-[#010101] text-base">Delete Booking</h3>
            <p className="text-xs text-gray-500">
              Booking ID: <span className="font-mono font-bold text-red-500">{bookingId}</span>
              &nbsp;· This cannot be undone.
            </p>
          </div>
        </div>
        <div className="px-6 py-5">
          <label className="block text-xs font-semibold text-[#010101] mb-2 uppercase tracking-wide">
            Reason for Deletion <span className="text-red-500">*</span>
          </label>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Why is this booking being deleted?…"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm h-24 resize-none"
            autoFocus />
        </div>
        <div className="px-6 pb-5 flex justify-end gap-2">
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={() => { if (reason.trim()) onConfirm(reason.trim()); }}
            disabled={!reason.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-40">
            <Trash2 size={14}/> Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Reject Modal ─────────────────────────────────────────────────── */
const RejectModal = ({ bookingId, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border-b border-red-100">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Ban size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-[#010101] text-base">Reject Booking</h3>
            <p className="text-xs text-gray-500">Booking ID: {bookingId}</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <label className="block text-xs font-semibold text-[#010101] mb-2 uppercase tracking-wide">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Enter the reason for rejection…"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm h-24 resize-none"
            autoFocus />
        </div>
        <div className="px-6 pb-5 flex justify-end gap-2">
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={() => { if (reason.trim()) onConfirm(reason.trim()); }}
            disabled={!reason.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition disabled:opacity-40">
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Edit Modal ───────────────────────────────────────────────────── */
const EditModal = ({ booking, onSave, onCancel }) => {
  /*
    booking is already normalised (plain strings) before being passed here.
    All fields will be pre-filled correctly.
  */
  const [form, setForm] = useState({
    studentId: booking.studentId || '',
    location:  booking.location  || '',
    date:      booking.date      || '',   // "YYYY-MM-DD"
    startTime: booking.startTime || '',   // "HH:mm"
    endTime:   booking.endTime   || '',   // "HH:mm"
    purpose:   booking.purpose   || '',
    attendees: booking.attendees || 1,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.studentId.trim())           return 'Student ID is required.';
    if (!form.location.trim())            return 'Location is required.';
    if (!form.date)                       return 'Date is required.';
    if (!form.startTime)                  return 'Start time is required.';
    if (!form.endTime)                    return 'End time is required.';
    if (form.endTime <= form.startTime)   return 'End time must be after start time.';
    if (!form.purpose.trim())             return 'Purpose is required.';
    if (parseInt(form.attendees, 10) < 1) return 'Attendees must be at least 1.';
    return null;
  };

  const handleSave = async () => {
    const ve = validate();
    if (ve) { setError(ve); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        studentId: form.studentId.trim().toUpperCase(),
        attendees: parseInt(form.attendees, 10),
      };
      const res  = await fetch(`${API}/${booking.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok)             { onSave(normalizeBooking(data)); }
      else if (res.status === 409) { setError(data.error || 'Time slot conflict.'); }
      else                    { setError(data.error || 'Failed to save.'); }
    } catch { setError('Cannot reach the server.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100" style={{ backgroundColor: '#dafff7' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#36bdac' }}>
            <Pencil size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[#010101] text-base">Edit Booking</h3>
            <p className="text-xs text-gray-500">
              ID: <span className="font-mono font-bold text-[#36bdac]">{booking.id}</span>
              &nbsp;· Saving resets status to <strong>PENDING</strong> for re-review.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle size={15} className="shrink-0" /> {error}
          </div>
        )}

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Row 1: Student ID + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ID No</label>
              <input type="text" name="studentId" value={form.studentId}
                onChange={handleChange} placeholder="e.g. IT22XXXXXXX"
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" name="location" value={form.location}
                onChange={handleChange} placeholder="e.g. Lab A, Room 204"
                className={inputClass} />
            </div>
          </div>

          {/* Row 2: Date + Start + End */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" name="date" value={form.date}
                onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Start Time</label>
              <input type="time" name="startTime" value={form.startTime}
                onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Time</label>
              <input type="time" name="endTime" value={form.endTime}
                onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Row 3: Attendees */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Attendees</label>
              <input type="number" name="attendees" value={form.attendees}
                onChange={handleChange} min="1" className={inputClass} />
            </div>
          </div>

          {/* Row 4: Purpose */}
          <div>
            <label className={labelClass}>Purpose</label>
            <textarea name="purpose" value={form.purpose} onChange={handleChange}
              placeholder="Describe the purpose…"
              className={`${inputClass} h-20 resize-none`} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-2">
          <button onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition"
            style={{ backgroundColor: saving ? '#36bdac99' : '#36bdac' }}>
            <Save size={15}/> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Booking Card ─────────────────────────────────────────────────── */
const BookingCard = ({ b, onApprove, onReject, onDelete, onEditSave, actionLoading }) => {
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const busy = actionLoading === b.id;

  return (
    <>
      {showEdit && (
        <EditModal
          booking={b}   // already normalised — date/time are plain strings
          onSave={(updated) => { setShowEdit(false); onEditSave(updated); }}
          onCancel={() => setShowEdit(false)}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* ID + studentId + status */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-mono text-xs font-bold text-[#36bdac] bg-[#dafff7] px-2 py-0.5 rounded">{b.id}</span>
              <span className="text-xs text-gray-400 flex items-center gap-1"><BadgeInfo size={12}/> {b.studentId || '—'}</span>
              <StatusBadge status={b.status} />
            </div>

            {/* Details — clean plain strings */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1 truncate"><MapPin size={13}/> {b.location || 'N/A'}</span>
              <span className="flex items-center gap-1"><CalendarDays size={13}/> {b.date || '—'}</span>
              <span className="flex items-center gap-1"><Clock size={13}/> {b.startTime} – {b.endTime}</span>
              <span className="flex items-center gap-1"><Users size={13}/> {b.attendees} attendee{b.attendees !== 1 ? 's' : ''}</span>
            </div>

            {b.status === 'REJECTED' && b.rejectionReason && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <Ban size={11}/> Reason: {b.rejectionReason}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button onClick={() => setShowEdit(true)} disabled={busy}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-[#36bdac] text-[#36bdac] hover:bg-[#dafff7] transition disabled:opacity-50">
              <Pencil size={14}/> Edit
            </button>
            <button onClick={() => setExpanded(v => !v)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 transition">
              {expanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
            </button>
            {b.status === 'PENDING' && (
              <>
                <button onClick={() => onApprove(b.id)} disabled={busy}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition disabled:opacity-50">
                  <CheckCircle size={15}/> {busy ? '…' : 'Approve'}
                </button>
                <button onClick={() => onReject(b.id)} disabled={busy}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50">
                  <Ban size={15}/> {busy ? '…' : 'Reject'}
                </button>
              </>
            )}
            {b.status === 'APPROVED' && (
              <button onClick={() => { if (window.confirm('Cancel this booking?')) onApprove(b.id, 'CANCELLED'); }} disabled={busy}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 transition disabled:opacity-50">
                <XCircle size={15}/> {busy ? '…' : 'Cancel'}
              </button>
            )}
            <button onClick={() => onDelete(b.id)} disabled={busy}
              className="p-2 rounded-lg border border-gray-200 text-red-400 hover:bg-red-50 transition disabled:opacity-50" title="Delete">
              <Trash2 size={15}/>
            </button>
          </div>
        </div>

        {/* Expanded panel */}
        {expanded && (
          <div className="border-t border-gray-100 px-5 py-4 bg-[#dafff7]/20 rounded-b-2xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-[#010101]">
              <div><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Purpose</p><p>{b.purpose || '—'}</p></div>
              <div><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Attendees</p><p>{b.attendees}</p></div>
              {b.createdAt && (
                <div><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Submitted At</p>
                  <p>{new Date(b.createdAt).toLocaleString()}</p></div>
              )}
              {b.updatedAt && (
                <div><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Last Updated</p>
                  <p>{new Date(b.updatedAt).toLocaleString()}</p></div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/* ── Deleted Bookings Log ─────────────────────────────────────────── */
const DeletedLog = () => {
  const [deleted,  setDeleted]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`${API}/deleted`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setDeleted(Array.isArray(d) ? d.map(normalizeDeleted) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && deleted.length === 0) return null;

  return (
    <div className="mt-10">
      <button onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-2 w-full mb-3 text-left">
        <History size={18} className="text-gray-400" />
        <h3 className="text-base font-bold text-gray-500">Deleted Bookings Log</h3>
        <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
          {deleted.length}
        </span>
        <span className="ml-auto text-xs text-gray-400">{expanded ? 'Hide' : 'Show'}</span>
        {expanded ? <ChevronUp size={15} className="text-gray-400"/> : <ChevronDown size={15} className="text-gray-400"/>}
      </button>

      {expanded && (
        <div className="space-y-2">
          {loading ? (
            <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ) : (
            deleted.map(d => (
              <div key={d.id}
                className="bg-white rounded-xl border border-red-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="shrink-0">
                  <span className="font-mono text-xs font-bold text-red-400 bg-red-50 px-2 py-1 rounded line-through">
                    {d.bookingId}
                  </span>
                </div>
                {/* Clean date/time display — same format as cards */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><BadgeInfo size={11}/> {d.studentId || '—'}</span>
                  <span className="flex items-center gap-1"><MapPin size={11}/> {d.location || '—'}</span>
                  <span className="flex items-center gap-1"><CalendarDays size={11}/> {d.date || '—'}</span>
                  <span className="flex items-center gap-1"><Clock size={11}/> {d.startTime} – {d.endTime}</span>
                </div>
                <div className="shrink-0 sm:max-w-xs">
                  <p className="text-xs text-red-500 font-medium flex items-start gap-1">
                    <Trash2 size={11} className="mt-0.5 shrink-0"/> {d.deleteReason}
                  </p>
                  {d.deletedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(d.deletedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────── */
const MyBookings = () => {
  const [bookings,      setBookings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [logKey,        setLogKey]        = useState(0);

  const fetchBookings = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      const res  = await fetch(`${API}?${params}`, { credentials: 'include' });
      const data = await res.json();
      // Normalise every booking so date/time are always plain strings
      setBookings(Array.isArray(data) ? data.map(normalizeBooking) : []);
    } catch {
      setError('Failed to load bookings. Ensure the server is running on port 8080.');
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleEditSave = (updated) =>
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));

  const performUpdate = async (id, status, reason = '') => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API}/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, reason }),
      });
      if (!res.ok) { const d = await res.json(); alert(d.error || 'Action failed.'); }
      fetchBookings();
    } catch { alert('Server error. Please try again.'); }
    finally { setActionLoading(null); }
  };

  const handleApprove = (id) => {
    if (window.confirm('Approve this booking?')) performUpdate(id, 'APPROVED');
  };
  const handleReject = (id) => setRejectTarget(id);
  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async (reason) => {
    const id = deleteTarget;
    setDeleteTarget(null);
    setActionLoading(id);
    try {
      await fetch(`${API}/${id}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      fetchBookings();
      setLogKey(k => k + 1);
    } catch { alert('Delete failed.'); }
    finally { setActionLoading(null); }
  };

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1; return acc;
  }, {});
  const stats = [
    { label: 'Total',    value: bookings.length,       bg: '#dafff7', border: '#36bdac' },
    { label: 'Pending',  value: counts.PENDING  || 0,  bg: '#FFF8E1', border: '#F59E0B' },
    { label: 'Approved', value: counts.APPROVED || 0,  bg: '#E8FFF5', border: '#10B981' },
    { label: 'Rejected', value: counts.REJECTED || 0,  bg: '#FEF2F2', border: '#EF4444' },
  ];

  return (
    <div className="min-h-full">
      {/* Modals */}
      {rejectTarget && (
        <RejectModal bookingId={rejectTarget}
          onConfirm={(r) => { performUpdate(rejectTarget, 'REJECTED', r); setRejectTarget(null); }}
          onCancel={() => setRejectTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteModal bookingId={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#010101]">Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">All submitted booking requests</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#36bdac] bg-white text-[#010101]">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button onClick={fetchBookings}
            className="p-2 rounded-lg border border-gray-200 hover:bg-[#dafff7] transition">
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#36bdac]' : 'text-gray-500'}/>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-4 border"
            style={{ backgroundColor: s.bg, borderColor: s.border }}>
            <p className="text-xs font-semibold text-gray-500 uppercase">{s.label}</p>
            <p className="text-3xl font-bold text-[#010101] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16}/> {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100"/>)}
        </div>
      )}

      {!loading && !error && (
        bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <CalendarDays size={40} className="mb-3 opacity-30"/>
            <p className="text-sm">No bookings found{filterStatus ? ` with status "${filterStatus}"` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <BookingCard key={b.id} b={b}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onEditSave={handleEditSave}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )
      )}

      <DeletedLog key={logKey} />
    </div>
  );
};

export default MyBookings;
