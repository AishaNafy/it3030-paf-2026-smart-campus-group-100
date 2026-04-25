import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Building } from 'lucide-react';
import api from '../api/axiosConfig';

const FacilityDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useOutletContext();
  const isNew = id === 'create';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [facility, setFacility] = useState({
    name: '',
    type: 'Lecture Hall',
    location: '',
    capacity: 0,
    status: 'ACTIVE',
    description: '',
    availabilityWindows: '08:00 - 18:00'
  });

  useEffect(() => {
    if (!isNew) {
      const fetchFacility = async () => {
        try {
          const res = await api.get(`/facilities/${id}`);
          setFacility(res.data);
        } catch (err) {
          console.error('Error fetching facility:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchFacility();
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacility(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isNew) {
        await api.post('/facilities', facility);
      } else {
        await api.put(`/facilities/${id}`, facility);
      }
      navigate(`/${role}/facilities`);
    } catch (err) {
      console.error('Error saving facility:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await api.delete(`/facilities/${id}`);
        navigate(`/${role}/facilities`);
      } catch (err) {
        console.error('Error deleting facility:', err);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading facility details...</div>;

  const readOnly = false; // Enabled for all roles so you can demonstrate CRUD

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </button>
        {!isNew && (
          <button onClick={handleDelete} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2 border border-red-100">
            <Trash2 size={16} /> Delete Facility
          </button>
        )}
      </div>

      <div className="glass-card">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-teal-100/50">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
            <Building size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{isNew ? 'Add New Facility' : facility.name}</h2>
            <p className="text-gray-500">{isNew ? 'Create a new resource in the catalogue' : 'Manage facility details and status'}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Facility Name</label>
              <input
                type="text" name="name" value={facility.name} onChange={handleChange} required
                disabled={readOnly}
                className="input-field disabled:bg-gray-50"
                placeholder="e.g. Main Auditorium"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Location</label>
              <input
                type="text" name="location" value={facility.location} onChange={handleChange} required
                disabled={readOnly}
                className="input-field disabled:bg-gray-50"
                placeholder="e.g. Block A, Level 2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Type</label>
              <select
                name="type" value={facility.type} onChange={handleChange} required
                disabled={readOnly}
                className="input-field disabled:bg-gray-50"
              >
                <option value="Lecture Hall">Lecture Hall</option>
                <option value="Lab">Lab</option>
                <option value="Meeting Room">Meeting Room</option>
                <option value="Equipment">Equipment</option>
                <option value="Sports Facility">Sports Facility</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Capacity (Pax)</label>
              <input
                type="number" name="capacity" value={facility.capacity} onChange={handleChange} required
                disabled={readOnly} min="1"
                className="input-field disabled:bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Current Status</label>
              <select
                name="status" value={facility.status} onChange={handleChange} required
                disabled={readOnly}
                className="input-field disabled:bg-gray-50"
              >
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">Availability Windows</label>
              <input
                type="text" name="availabilityWindows" value={facility.availabilityWindows} onChange={handleChange} required
                disabled={readOnly}
                className="input-field disabled:bg-gray-50"
                placeholder="e.g. 08:00 - 18:00 (Mon-Fri)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Description & Facilities</label>
            <textarea
              name="description" value={facility.description} onChange={handleChange}
              disabled={readOnly} rows={4}
              className="input-field disabled:bg-gray-50 resize-none"
              placeholder="List available equipment, special features, or maintenance notes..."
            />
          </div>

          {!readOnly && (
            <div className="pt-4 border-t border-teal-100/50 flex justify-end">
              <button
                type="submit" disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={18} /> {saving ? 'Saving...' : 'Save Facility Details'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FacilityDetailsPage;
