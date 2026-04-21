import React, { useState } from 'react';
import { CalendarDays, Clock, Users, MapPin, Briefcase, Hash, Send, AlertCircle } from 'lucide-react';

const API = 'http://localhost:8080/api/bookings';

// Colour tokens matching the project palette
const C = {
  teal:    '#36bdac',
  tealLight: '#dafff7',
  black:   '#010101',
  white:   '#ffffff',
};

const inputClass = `
  w-full px-4 py-2.5 rounded-lg border border-gray-200
  focus:outline-none focus:ring-2 focus:ring-[#36bdac] focus:border-transparent
  text-[#010101] bg-white text-sm transition
`;

const labelClass = 'block text-xs font-semibold text-[#010101] mb-1 uppercase tracking-wide';

const EMPTY_FORM = {
  resourceId: '',
  location:   '',
  userEmail:  '',
  date:       '',
  startTime:  '',
  endTime:    '',
  purpose:    '',
  attendees:  1,
};

const BookingRequestPage = () => {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.resourceId || isNaN(parseInt(form.resourceId, 10)))
      return 'Please enter a valid numeric Resource ID.';
    if (!form.location.trim())
      return 'Location is required.';
    if (!form.userEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.userEmail))
      return 'Please enter a valid email address.';
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
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        resourceId: parseInt(form.resourceId, 10),
        attendees:  parseInt(form.attendees,  10),
      };

      const res = await fetch(API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Booking ${data.id} submitted successfully! Status: PENDING review.`);
        setForm(EMPTY_FORM);
      } else {
        setError(data.error || data.message || 'Submission failed. Please try again.');
      }
    } catch {
      setError('Cannot reach the server. Ensure Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#010101]">New Booking Request</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below. Your request will be reviewed by an administrator.
        </p>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-[#dafff7] border border-[#36bdac] text-[#010101] text-sm font-medium">
          ✅ {success}
        </div>
      )}

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl"
      >
        {/* Row 1: Resource ID + Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><Hash size={12} /> Resource ID</span>
            </label>
            <input
              type="number"
              name="resourceId"
              value={form.resourceId}
              onChange={handleChange}
              placeholder="e.g. 101"
              className={inputClass}
              required
              min="1"
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><MapPin size={12} /> Location</span>
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Lab A, Room 204"
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Row 2: Email + Attendees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className={labelClass}>Your Email</label>
            <input
              type="email"
              name="userEmail"
              value={form.userEmail}
              onChange={handleChange}
              placeholder="you@sliit.lk"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><Users size={12} /> Attendees</span>
            </label>
            <input
              type="number"
              name="attendees"
              value={form.attendees}
              onChange={handleChange}
              className={inputClass}
              min="1"
              required
            />
          </div>
        </div>

        {/* Row 3: Date + Start Time + End Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><CalendarDays size={12} /> Date</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={inputClass}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><Clock size={12} /> Start Time</span>
            </label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1"><Clock size={12} /> End Time</span>
            </label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
        </div>

        {/* Row 4: Purpose */}
        <div className="mb-6">
          <label className={labelClass}>
            <span className="flex items-center gap-1"><Briefcase size={12} /> Purpose</span>
          </label>
          <textarea
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            placeholder="Briefly describe the purpose of this booking…"
            className={`${inputClass} h-24 resize-none`}
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all"
          style={{ backgroundColor: loading ? '#36bdac99' : C.teal }}
        >
          <Send size={16} />
          {loading ? 'Submitting…' : 'Submit Booking Request'}
        </button>
      </form>
    </div>
  );
};

export default BookingRequestPage;
