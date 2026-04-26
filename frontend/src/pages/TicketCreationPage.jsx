import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { UploadCloud, X } from 'lucide-react';

const TicketCreationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Maintenance',
    priority: 'Low',
    phoneNumber: '',
    email: '',
    incidentDate: '',
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  // Email: force lowercase, before @ allow [a-z0-9.], after @ allow [a-z.] only
  const handleEmailChange = (e) => {
    let value = e.target.value.toLowerCase();
    const atIndex = value.indexOf('@');

    if (atIndex === -1) {
      // No @ yet: allow lowercase letters, numbers, and dots only
      value = value.replace(/[^a-z0-9.@]/g, '');
    } else {
      let local = value.substring(0, atIndex);
      let domain = value.substring(atIndex + 1);

      // Local part: lowercase letters, numbers, dots
      local = local.replace(/[^a-z0-9.]/g, '');

      // Domain part: lowercase letters and dots ONLY (no numbers, no signs)
      domain = domain.replace(/[^a-z.]/g, '');

      // Prevent multiple @ signs
      domain = domain.replace(/@/g, '');

      value = local + '@' + domain;
    }

    setFormData({ ...formData, email: value });
    if (validationErrors.email) {
      setValidationErrors({ ...validationErrors, email: '' });
    }
  };

  // Phone: only digits, max 10 characters
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // strip everything except digits
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    setFormData({ ...formData, phoneNumber: value });
    if (validationErrors.phoneNumber) {
      setValidationErrors({ ...validationErrors, phoneNumber: '' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check max files
    if (files.length + selectedFiles.length > 3) {
      setError("Maximum 3 files allowed.");
      return;
    }
    
    setError(null);
    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);
    
    // Generate previews
    const filePreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(filePreviews);
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate email format: local@domain.tld
    const errors = {};
    const emailRegex = /^[a-z0-9.]+@[a-z]+\.[a-z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Enter a valid email (e.g. student@university.edu). No capitals, numbers or special characters after @.';
    }

    // Validate phone: exactly 10 digits
    if (formData.phoneNumber.length !== 10) {
      errors.phoneNumber = 'Phone number must be exactly 10 digits.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setLoading(true);

    const payload = new FormData();
    
    // Spring Boot expects ticket as application/json in a multipart request if we use @RequestPart
    // Alternatively we can stringify and append.
    payload.append('ticket', new Blob([JSON.stringify({
      ...formData
    })], { type: "application/json" }));

    files.forEach(file => {
      payload.append('files', file);
    });

    try {
      await api.post('/tickets', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/student');
    } catch (err) {
      console.error(err);
      setError("Failed to create ticket. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto glass-card animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Report an Incident</h2>
        <p className="text-gray-500 text-sm mt-1">Please provide details about the issue you are facing.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm flex items-center">
          <span className="font-semibold mr-2">Error:</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            placeholder="E.g. Leaking pipe in Dorm A"
            className="input-field"
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="email"
              required
              value={formData.email}
              onChange={handleEmailChange}
              className={`input-field ${validationErrors.email ? '!border-red-400 !ring-red-200' : ''}`}
              placeholder="student@university.edu"
              autoComplete="email"
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1 animate-in fade-in">{validationErrors.email}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">Lowercase letters, numbers & dot before @. Only letters & dot after @.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              className={`input-field ${validationErrors.phoneNumber ? '!border-red-400 !ring-red-200' : ''}`}
              placeholder="0771234567"
              maxLength={10}
            />
            {validationErrors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1 animate-in fade-in">{validationErrors.phoneNumber}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">Exactly 10 digits, numbers only.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Incident Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="incidentDate"
              required
              value={formData.incidentDate}
              onChange={handleInputChange}
              className="input-field"
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="Maintenance">Maintenance</option>
              <option value="IT">IT Support</option>
              <option value="Cleaning">Cleaning & Janitorial</option>
              <option value="Security">Security</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="Low">Low - Not urgent</option>
              <option value="Medium">Medium - Needs attention soon</option>
              <option value="High">High - Urgent</option>
              <option value="Critical">Critical - Safety/Security risk</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
          <textarea
            name="description"
            required
            rows={5}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Please detail the issue..."
            className="input-field resize-none"
          />
        </div>

        {/* File Upload section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Images, Max 3)</label>
          
          <div className="relative border-2 border-dashed border-teal-200 rounded-xl p-6 bg-teal-50/50 flex flex-col items-center justify-center text-center transition hover:bg-teal-50">
            <UploadCloud size={36} className="text-teal-400 mb-2" />
            <p className="text-sm text-gray-600">Drag & drop or click to upload</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 5MB each</p>
            
            <input 
              type="file" 
              multiple 
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={files.length >= 3}
            />
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="flex gap-4 mt-4">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                  <img src={preview} alt="upload preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/student')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary min-w-[120px]">
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketCreationPage;
