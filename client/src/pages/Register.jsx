import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodType: 'O+',
    city: '',
    role: 'recipient'
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const navigate = useNavigate();

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  // ── Per-field validators ──────────────────────────────────────────────────
  const validators = {
    email: (v) => {
      if (!v) return 'Email is required';
      // Standard email regex
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address (e.g. name@example.com)';
      return '';
    },
    phone: (v) => {
      if (!v) return 'Phone number is required';
      if (!/^\d{10}$/.test(v))   return 'Phone must be exactly 10 digits';
      if (/^0/.test(v))          return 'Phone number cannot start with 0';
      return '';
    },
    name: (v) => (!v.trim() ? 'Full name is required' : ''),
    city: (v) => (!v.trim() ? 'City is required' : ''),
    password: (v) => (v.length < 6 ? 'Password must be at least 6 characters' : ''),
    confirmPassword: (v) => (v !== formData.password ? 'Passwords do not match' : ''),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Only allow digits for phone, max 10
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: digits }));
      setFieldErrors(prev => ({ ...prev, phone: validators.phone(digits) }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Live validation for email, password, confirmPassword
    if (validators[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validators[name](value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Run all validators
    const errors = {};
    Object.keys(validators).forEach(field => {
      const msg = validators[field](formData[field] || '');
      if (msg) errors[field] = msg;
    });
    setFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setError('Please fix the errors above before submitting.');
      setLoading(false);
      return;
    }

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.city) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        bloodType: formData.bloodType,
        city: formData.city,
        role: formData.role
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userId', response.data.user.id);
        onLogin(response.data.token, response.data.user.role);
        navigate(response.data.user.role === 'donor' ? '/dashboard' : '/find-donors');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-2 text-center">Join BloodConnect</h1>
        <p className="text-gray-600 text-center mb-8">Create your account today</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${fieldErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="John Doe"
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${fieldErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="your@email.com"
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              inputMode="numeric"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${fieldErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="9876543210"
            />
            <p className="text-gray-400 text-xs mt-1">10 digits, must not start with 0 &nbsp;·&nbsp; {formData.phone.length}/10</p>
            {fieldErrors.phone && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.phone}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${fieldErrors.city ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="Mumbai"
            />
            {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
          </div>

          {/* Blood Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            >
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Register as</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            >
              <option value="recipient">Blood Recipient</option>
              <option value="donor">Blood Donor</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${fieldErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="••••••••"
            />
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${fieldErrors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              placeholder="••••••••"
            />
            {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 mt-6"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-red-600 font-bold hover:text-red-700">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
