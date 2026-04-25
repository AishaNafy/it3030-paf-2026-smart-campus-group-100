import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Mail, Lock, Phone, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/axiosConfig';

const Field = ({ id, label, icon, type = 'text', value, onChange, placeholder, hint }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm bg-white"
      />
    </div>
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phoneNumber: '', nic: '',
    temporaryPassword: '', confirmPassword: '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.temporaryPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name:              form.name.trim(),
        email:             form.email.trim(),
        phoneNumber:       form.phoneNumber.trim(),
        nic:               form.nic.trim(),
        temporaryPassword: form.temporaryPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 py-10 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-teal-100 p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg mb-3">
              <LayoutDashboard size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">Register as a student</p>
          </div>

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">
              <CheckCircle2 size={16} className="shrink-0" />
              Account created! Redirecting to login…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                id="reg-name" label="Full Name"
                icon={<User size={15} />}
                value={form.name} onChange={set('name')}
                placeholder="John Doe"
              />
              <Field
                id="reg-email" label="Email" type="email"
                icon={<Mail size={15} />}
                value={form.email} onChange={set('email')}
                placeholder="john@example.com"
              />
              <Field
                id="reg-phone" label="Phone Number"
                icon={<Phone size={15} />}
                value={form.phoneNumber} onChange={set('phoneNumber')}
                placeholder="0771234567"
                hint="Exactly 10 digits"
              />
              <Field
                id="reg-nic" label="NIC"
                icon={<CreditCard size={15} />}
                value={form.nic} onChange={set('nic')}
                placeholder="200012345678 or 991234567V"
                hint="9 digits + V/X, or 12 digits"
              />
              <Field
                id="reg-password" label="Password" type="password"
                icon={<Lock size={15} />}
                value={form.temporaryPassword} onChange={set('temporaryPassword')}
                placeholder="Min. 6 characters"
              />
              <Field
                id="reg-confirm" label="Confirm Password" type="password"
                icon={<Lock size={15} />}
                value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="Re-enter password"
              />

              <button
                id="reg-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
              >
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
