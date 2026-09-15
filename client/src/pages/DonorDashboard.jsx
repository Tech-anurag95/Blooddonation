import React, { useState, useEffect, useCallback } from 'react';
import { Heart, AlertCircle, CheckCircle, Clock, Download, RefreshCw } from 'lucide-react';
import { requestAPI, donorAPI } from '../services/api';
import { API_BASE_URL } from '../config/api.config';

const DonorDashboard = () => {
  const [donations, setDonations]   = useState([]);
  const [requests, setRequests]     = useState([]);
  const [stats, setStats]           = useState({
    totalDonations: 0,
    livesHelped: 0,
    nextEligible: '30 days',
    availableToDonate: true
  });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [certLoading, setCertLoading] = useState({});

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const donorId = localStorage.getItem('userId');
      const [requestsRes, donationsRes] = await Promise.all([
        requestAPI.getPendingRequests(),
        donorAPI.getDonationHistory(donorId)
      ]);

      setRequests(requestsRes.data.data || []);
      const donationList = donationsRes.data.data || [];
      setDonations(donationList);
      setStats(prev => ({
        ...prev,
        totalDonations: donationList.filter(d => d.status === 'completed').length
      }));
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  const handleDownloadCertificate = async (donationId) => {
    setCertLoading(prev => ({ ...prev, [donationId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/donations/${donationId}/certificate`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        const err = await response.json();
        alert(err.message || 'Failed to download certificate');
        return;
      }

      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `bloodde-certificate-${donationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download certificate');
      console.error(err);
    } finally {
      setCertLoading(prev => ({ ...prev, [donationId]: false }));
    }
  };

  // Render download button for completed donations — no approval needed
  const renderCertBadge = (donation) => {
    if (donation.status !== 'completed') return null;

    return (
      <button
        onClick={() => handleDownloadCertificate(donation._id)}
        disabled={certLoading[donation._id]}
        className="mt-2 flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60"
      >
        {certLoading[donation._id]
          ? <RefreshCw size={12} className="animate-spin" />
          : <Download size={12} />}
        {certLoading[donation._id] ? 'Downloading…' : 'Download Certificate'}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Donor Dashboard</h1>
            <p className="text-lg text-gray-600">Track your donations and respond to requests.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600 py-20">Loading dashboard…</p>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { icon: Heart,        label: 'Total Donations', value: stats.totalDonations },
                { icon: Heart,        label: 'Lives Helped',    value: stats.totalDonations * 3 },
                { icon: Clock,        label: 'Next Eligible',   value: stats.nextEligible },
                { icon: CheckCircle,  label: 'Available',       value: stats.availableToDonate ? 'Yes' : 'No' }
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
              {/* Blood Requests */}
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
                      donations.slice(0, 8).map(donation => (
                        <div key={donation._id} className="pb-3 border-b border-gray-200 last:border-b-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-gray-900 text-sm">
                              {donation.recipientName || 'Unknown Recipient'}
                            </p>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              donation.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {donation.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {donation.location || 'Location not specified'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {donation.completedDate
                              ? new Date(donation.completedDate).toLocaleDateString('en-IN')
                              : donation.createdAt
                                ? new Date(donation.createdAt).toLocaleDateString('en-IN')
                                : '—'}
                          </p>
                          {renderCertBadge(donation)}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">No donations yet</p>
                    )}
                  </div>
                </div>

                <button className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition">
                  View Full History
                </button>
              </div>
            </div>

            {/* Good to Know */}
            <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-300 flex gap-4">
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
