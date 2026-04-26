import React, { useState } from 'react';
import {
  CalendarDays, Clock, Users, MapPin,
  Briefcase, Send, AlertCircle, BadgeInfo, AlertTriangle
} from 'lucide-react';

import api from '../../api/axiosConfig';

const API = '/bookings';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-200 ' +
  'focus:outline-none focus:ring-2 focus:ring-[#36bdac] focus:border-transparent ' +
  'text-[#010101] bg-white text-sm transition';

const labelClass = 'block text-xs font-semibold text-[#010101] mb-1 uppercase tracking-wide';

const EMPTY_FORM = {
  studentId: '',
  location:  '',
  date:      '',
  startTime: '',
  endTime:   '',
  purpose:   '',
  attendees: 1,
};

/* ── Conflict popup modal ─────────────────────────────────────────── */
const ConflictModal = ({ message, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-amber-50 border-b border-amber-100">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-[#010101] text-base">Time Slot Unavailable</h3>
          <p className="text-xs text-gray-500">This location is already booked</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        <p className="text-sm text-gray-500 mt-3">
          Please go back and choose a <strong>different time slot</strong> or a <strong>different location</strong>.
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 pb-5 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: '#36bdac' }}
        >
          OK, Got it
        </button>
      </div>
    </div>
  </div>
);

/* ── Main page ───────────────────────────────────────────────────── */
const BookingRequestPage = () => {
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState('');
  const [error,        setError]        = useState('');
  const [conflictMsg,  setConflictMsg]  = useState(''); // drives the popup

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(''); setSuccess('');
  };

  const validate = () => {
    if (!form.studentId.trim())
      return 'Student ID is required (e.g. IT22XXXXXXX).';
    if (!form.location.trim())
      return 'Location is required.';
    if (!form.date)
      return 'Please select a date.';
    if (!form.startTime)
      return 'Please select a start time.';
    if (!form.endTime)
      return 'Please select an end time.';
    if (form.endTime <= form.startTime)
      return 'End time must be after start time.';
    if (!form.purpose.trim())
      return 'Purpose is required.';
    if (parseInt(form.attendees, 10) < 1)
      return 'Attendees must be at least 1.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setConflictMsg('');

    const ve = validate();
    if (ve) { setError(ve); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        studentId: form.studentId.trim().toUpperCase(),
        attendees: parseInt(form.attendees, 10),
      };

      const res  = await api.post(API, payload);
      const data = res.data;

      setSuccess(`Booking ${data.id} submitted successfully! Status: PENDING review.`);
      setForm(EMPTY_FORM);
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictMsg(err.response.data?.error || 'This location is already booked at the selected time.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Submission failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full">
      {/* Conflict popup */}
      {conflictMsg && (
        <ConflictModal message={conflictMsg} onClose={() => setConflictMsg('')} />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#010101]">New Booking Request</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below. Your request will be reviewed by an administrator.
        </p>
      </div>

      {/* Validation error */}
      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-[#dafff7] border border-[#36bdac] text-[#010101] text-sm font-medium">
          ✅ {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl"
      >
        {/* Row 1 — Student ID + Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><BadgeInfo size={12}/> ID No</span>
            </label>
            <input
              type="text" name="studentId" value={form.studentId}
              onChange={handleChange} placeholder="e.g. IT22XXXXXXX"
              className={inputClass} required
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><MapPin size={12}/> Location</span>
            </label>
            <input
              type="text" name="location" value={form.location}
              onChange={handleChange} placeholder="e.g. Lab A, Room 204"
              className={inputClass} required
            />
          </div>
        </div>

        {/* Row 2 — Attendees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><Users size={12}/> Attendees</span>
            </label>
            <input
              type="number" name="attendees" value={form.attendees}
              onChange={handleChange} className={inputClass} min="1" required
            />
          </div>
        </div>

        {/* Row 3 — Date + Start Time + End Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><CalendarDays size={12}/> Date</span>
            </label>
            <input
              type="date" name="date" value={form.date}
              onChange={handleChange} className={inputClass} required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><Clock size={12}/> Start Time</span>
            </label>
            <input
              type="time" name="startTime" value={form.startTime}
              onChange={handleChange} className={inputClass} required
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><Clock size={12}/> End Time</span>
            </label>
            <input
              type="time" name="endTime" value={form.endTime}
              onChange={handleChange} className={inputClass} required
            />
          </div>
        </div>

        {/* Row 4 — Purpose */}
        <div className="mb-6">
          <label className={labelClass}>
            <span className="flex items-center gap-1"><Briefcase size={12}/> Purpose</span>
          </label>
          <textarea
            name="purpose" value={form.purpose} onChange={handleChange}
            placeholder="Briefly describe the purpose of this booking…"
            className={`${inputClass} h-24 resize-none`} required
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all"
          style={{ backgroundColor: loading ? '#36bdac99' : '#36bdac' }}
        >
          <Send size={16} />
          {loading ? 'Submitting…' : 'Submit Booking Request'}
        </button>
      </form>
    </div>
  );
};

export default BookingRequestPage;
