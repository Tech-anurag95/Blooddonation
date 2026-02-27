import React, { useState } from 'react';
import { AlertCircle, Phone, Mail } from 'lucide-react';
import { requestAPI } from '../services/api';

const RequestBlood = () => {
  const [formData, setFormData] = useState({
    bloodType: 'O+',
    quantity: 1,
    urgency: 'urgent',
    reason: '',
    hospital: '',
    phone: '',
    city: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.hospital || !formData.phone || !formData.city) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const userId = localStorage.getItem('userId');
      const response = await requestAPI.createRequest({
        requester: userId,
        bloodType: formData.bloodType,
        quantity: formData.quantity,
        urgency: formData.urgency,
        reason: formData.reason,
        hospital: formData.hospital,
        phone: formData.phone,
        city: formData.city
      });

      if (response.data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            bloodType: 'O+',
            quantity: 1,
            urgency: 'urgent',
            reason: '',
            hospital: '',
            phone: '',
            city: ''
          });
        }, 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your blood request has been posted. Nearby donors will be notified and can respond within minutes.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You will receive notifications as donors respond to your request.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-red-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Request Blood Now</h1>
          </div>
          <p className="text-lg text-gray-600">
            Emergency blood request. Nearby donors will be notified immediately.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Type */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Blood Type Needed *
              </label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
              >
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Quantity Needed (units) *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Urgency Level *
              </label>
              <div className="space-y-2">
                {['urgent', 'high', 'normal'].map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      checked={formData.urgency === level}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <span className="capitalize font-medium text-gray-700">{level} (Needed ASAP)</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Reason for Request *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="4"
                placeholder="Describe why you need blood..."
              />
            </div>

            {/* Hospital */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Hospital/Location *
              </label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Hospital name and address"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Your city"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-3">
                Contact Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition"
            >
              Submit Emergency Request
            </button>
          </form>

          {/* Emergency Hotline */}
          <div className="mt-8 p-6 bg-red-50 rounded-lg border-2 border-red-300">
            <p className="text-gray-800 font-bold mb-3">In case of medical emergency:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone size={20} className="text-red-600" />
                <span className="font-bold">Call 911</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail size={20} className="text-red-600" />
                <span>Contact nearest blood bank immediately</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestBlood;
