import React, { useState, useEffect } from 'react';
import { Heart, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { requestAPI, donorAPI } from '../services/api';

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    livesHelped: 0,
    nextEligible: '30 days',
    availableToDonate: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const donorId = localStorage.getItem('userId');
      
      // Fetch pending requests and donation history
      const [requestsRes, donationsRes] = await Promise.all([
        requestAPI.getPendingRequests(),
        donorAPI.getDonationHistory(donorId)
      ]);

      setRequests(requestsRes.data.data || []);
      setDonations(donationsRes.data.data || []);
      setStats(prev => ({
        ...prev,
        totalDonations: donationsRes.data.data?.filter(d => d.status === 'completed').length || 0
      }));
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const donorId = localStorage.getItem('userId');
      await donorAPI.acceptRequest(requestId, donorId);
      alert('Request accepted!');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Donor Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome back! Track your donations and respond to requests.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Loading dashboard...</p>
        ) : (
          <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Heart, label: 'Total Donations', value: stats.totalDonations },
            { icon: Heart, label: 'Lives Helped', value: stats.totalDonations * 3 },
            { icon: Clock, label: 'Next Eligible', value: stats.nextEligible },
            { icon: CheckCircle, label: 'Available', value: stats.availableToDonate ? 'Yes' : 'No' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stat.value}</p>
                </div>
                <stat.icon size={32} className="text-red-600 opacity-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Blood Requests Near You</h2>
              
              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map(req => (
                    <div key={req._id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{req.reason || 'Blood Request'}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              req.urgency === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {req.urgency?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{req.city}</p>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{req.bloodType}</div>
                      </div>
                      <button
                        onClick={() => handleAcceptRequest(req._id)}
                        className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition"
                      >
                        Respond to Request
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No requests near you at this time</p>
              )}
            </div>
          </div>

          {/* Donation History */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Donation History</h2>
              
              <div className="space-y-3">
                {donations.length > 0 ? (
                  donations.slice(0, 5).map(donation => (
                    <div key={donation._id} className="pb-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-gray-900 text-sm">{donation.recipientName}</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          donation.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {donation.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{new Date(donation.date).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No donations yet</p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
              View Full History
            </button>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-300 flex gap-4">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-blue-900 mb-1">Good to Know</h3>
            <p className="text-blue-800 text-sm">
              You can donate blood every 56 days. Ensure you're well-hydrated and have had adequate rest before donating.
            </p>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
