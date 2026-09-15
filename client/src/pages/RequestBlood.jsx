import React, { useState, useEffect } from 'react';
import { AlertCircle, Phone, Mail, LogIn, MapPin, Droplet, Clock, FileText, Building2, Navigation, Gift } from 'lucide-react';
import { requestAPI, rewardsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const RequestBlood = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rewards, setRewards] = useState(null);
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

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Fetch rewards if logged in
    if (token) {
      fetchRewards();
    }
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await rewardsAPI.getMyRewards();
      setRewards(response.data);
    } catch (err) {
      console.error('Error fetching rewards:', err);
    }
  };

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
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to submit a blood request. Please log in or register first.');
        setLoading(false);
        return;
      }

      // Use free credit if available
      if (rewards && rewards.free_credits_available > 0) {
        try {
          await rewardsAPI.useCredit();
        } catch (creditErr) {
          console.error('Error using credit:', creditErr);
          // Continue with request even if credit usage fails
        }
      }

      if (!formData.hospital || !formData.phone || !formData.city) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Send the request fields expected by the backend
      const response = await requestAPI.createRequest({
        bloodType: formData.bloodType,
        quantity: formData.quantity,
        urgency: formData.urgency,
        reason: formData.reason,
        hospital: formData.hospital,
        phone: formData.phone,
        city: formData.city,
        status: 'pending'
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
      console.error('Request error:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || 'Failed to submit request';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const openInGoogleMaps = () => {
    if (formData.hospital) {
      const query = encodeURIComponent(formData.hospital);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-md w-full bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center relative z-10 transform animate-bounce">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <div className="text-5xl text-green-600">✓</div>
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Request Submitted!</h2>
          <p className="text-gray-700 mb-4 text-lg">
            Your blood request has been posted. Nearby donors will be notified and can respond within minutes.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            You will receive notifications as donors respond to your request.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 py-12 px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-2xl mb-4 animate-bounce">
            <Droplet className="w-10 h-10 text-red-500 fill-current" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">Request Blood Now</h1>
          <p className="text-xl text-white/90 drop-shadow">
            Emergency blood request. Nearby donors will be notified immediately.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 transform hover:scale-[1.01] transition-all">
          {/* Login Warning */}
          {!isLoggedIn && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 px-6 py-4 rounded-lg mb-6 flex items-center gap-4 shadow-md">
              <LogIn size={24} className="text-yellow-600" />
              <div>
                <p className="font-bold text-yellow-900 text-lg">Login Required</p>
                <p className="text-sm text-yellow-800">You must be logged in to submit a blood request. 
                  <button 
                    onClick={() => navigate('/login')}
                    className="ml-2 underline font-bold hover:text-yellow-900 transition"
                  >
                    Log in now
                  </button>
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-md">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Free Credit Notification */}
          {rewards && rewards.free_credits_available > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 px-6 py-4 rounded-lg mb-6 shadow-md">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-bold text-purple-900 text-lg">🎉 Free Credit Available!</p>
                  <p className="text-purple-800">
                    You have <span className="font-bold">{rewards.free_credits_available} free credit{rewards.free_credits_available > 1 ? 's' : ''}</span> available. 
                    One credit will be automatically used for this request.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Type */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-500" />
                Blood Type Needed *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {bloodTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, bloodType: type})}
                    className={`py-3 px-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                      formData.bloodType === type
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-red-500" />
                Quantity Needed (units) *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none text-lg"
              />
            </div>

            {/* Urgency */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                Urgency Level *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, urgency: 'urgent'})}
                  className={`py-4 px-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                    formData.urgency === 'urgent'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🚨</div>
                  <div className="text-sm">Urgent</div>
                  <div className="text-xs opacity-80">ASAP</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, urgency: 'high'})}
                  className={`py-4 px-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                    formData.urgency === 'high'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg'
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-2 border-orange-200'
                  }`}
                >
                  <div className="text-2xl mb-1">⚠️</div>
                  <div className="text-sm">High</div>
                  <div className="text-xs opacity-80">Soon</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, urgency: 'normal'})}
                  className={`py-4 px-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                    formData.urgency === 'normal'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200'
                  }`}
                >
                  <div className="text-2xl mb-1">ℹ️</div>
                  <div className="text-sm">Normal</div>
                  <div className="text-xs opacity-80">Planned</div>
                </button>
              </div>
            </div>

            {/* Reason */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                Reason for Request *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none resize-none"
                rows="4"
                placeholder="Describe why you need blood (e.g., surgery, accident, medical condition)..."
              />
            </div>

            {/* Hospital with Google Maps */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-500" />
                Hospital/Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                  placeholder="Hospital name and address"
                />
              </div>
              {formData.hospital && (
                <button
                  type="button"
                  onClick={openInGoogleMaps}
                  className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors group"
                >
                  <Navigation className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  Open in Google Maps
                </button>
              )}
            </div>

            {/* City */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                placeholder="Your city"
              />
            </div>

            {/* Phone */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-500" />
                Contact Phone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isLoggedIn || loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform shadow-lg flex items-center justify-center gap-2 ${
                !isLoggedIn || loading
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Submit Emergency Request
                </>
              )}
            </button>
          </form>

          {/* Emergency Hotline */}
          <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200 shadow-md">
            <p className="text-gray-900 font-bold mb-3 text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              In case of medical emergency:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-800 bg-white px-4 py-3 rounded-lg">
                <Phone size={20} className="text-red-600" />
                <span className="font-bold text-lg">Call 911</span>
              </div>
              <div className="flex items-center gap-3 text-gray-800 bg-white px-4 py-3 rounded-lg">
                <Mail size={20} className="text-red-600" />
                <span className="font-semibold">Contact nearest blood bank immediately</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestBlood;
