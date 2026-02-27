import React, { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import { userAPI } from '../services/api';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodType: 'O+',
    city: '',
    state: '',
    age: '',
    weight: '',
    lastDonation: '',
    available: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await userAPI.getProfile(userId);
      setFormData(response.data.data);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = localStorage.getItem('userId');
      await userAPI.updateProfile(userId, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
            <p className="text-lg text-gray-600">Manage your account and donation information</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-2 rounded-lg font-bold transition ${
              isEditing
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {loading ? (
            <p className="text-center text-gray-600">Loading profile...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Side - Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <User size={80} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
              <p className="text-gray-600 mt-1">Blood Type: <span className="font-bold text-red-600">{formData.bloodType}</span></p>
              {formData.available && (
                <div className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                  ✓ Available to Donate
                </div>
              )}
            </div>

            {/* Right Side - Form */}
            <div className="md:col-span-2">
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} className="text-red-600" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Blood Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                      <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-red-500"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100 focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {isEditing && (
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <Save size={18} />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
