import React, { useState, useEffect } from 'react';
import { Award, Upload, CheckCircle, XCircle, Clock, Gift, TrendingUp } from 'lucide-react';
import { certificateAPI, rewardsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const RewardsDashboard = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rewardsRes, certsRes] = await Promise.all([
        rewardsAPI.getMyRewards(),
        certificateAPI.getMyCertificates()
      ]);
      
      setRewards(rewardsRes.data);
      setCertificates(certsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Pending' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-300', text: 'Approved' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-300', text: 'Rejected' }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border-2 ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  const progress = rewards?.progress_to_next_credit || { current: 0, required: 3, percentage: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Rewards Dashboard</h1>
          <p className="text-xl text-gray-600">Track your donations and earn free blood credits</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-blue-600">{rewards?.total_donations || 0}</span>
            </div>
            <p className="text-gray-600 font-semibold">Total Donations</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-green-600">{rewards?.certified_donations || 0}</span>
            </div>
            <p className="text-gray-600 font-semibold">Certified Donations</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Gift className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-purple-600">{rewards?.free_credits_available || 0}</span>
            </div>
            <p className="text-gray-600 font-semibold">Free Credits</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-pink-600" />
              <span className="text-3xl font-bold text-pink-600">{rewards?.free_credits_used || 0}</span>
            </div>
            <p className="text-gray-600 font-semibold">Credits Used</p>
          </div>
        </div>

        {/* Progress to Next Credit */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" />
            Progress to Next Free Credit
          </h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>{progress.current} / {progress.required} Certified Donations</span>
              <span>{Math.round(progress.percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${progress.percentage}%` }}
              >
                {progress.percentage > 10 && (
                  <span className="text-white text-xs font-bold">{Math.round(progress.percentage)}%</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            {progress.current === 0 ? (
              'Upload 3 certified donation certificates to earn 1 free blood credit!'
            ) : progress.current < 3 ? (
              `Just ${3 - progress.current} more certified donation${3 - progress.current > 1 ? 's' : ''} to earn your next free credit!`
            ) : (
              'Congratulations! You\'ve earned a free blood credit. Keep donating to earn more!'
            )}
          </p>
        </div>

        {/* Upload Certificate Button */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 mb-8 text-center">
          <Upload className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">Upload Donation Certificate</h2>
          <p className="text-white/90 mb-6 text-lg">
            After donating blood, upload your hospital certificate to earn rewards
          </p>
          <button
            onClick={() => navigate('/upload-certificate')}
            className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Upload Certificate
          </button>
        </div>

        {/* Certificates List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            My Certificates ({certificates.length})
          </h2>

          {certificates.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No certificates uploaded yet</p>
              <p className="text-gray-400 mt-2">Upload your first donation certificate to start earning rewards!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{cert.certificate_id}</h3>
                        {getStatusBadge(cert.status)}
                      </div>
                      <p className="text-gray-600 mb-1">
                        <span className="font-semibold">Hospital:</span> {cert.hospital_name}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <span className="font-semibold">Date:</span> {new Date(cert.donation_date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <span className="font-semibold">Blood Type:</span> {cert.blood_type} | 
                        <span className="font-semibold"> Quantity:</span> {cert.quantity}ml
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        Uploaded: {new Date(cert.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    {cert.certificate_image && (
                      <img 
                        src={cert.certificate_image} 
                        alt="Certificate" 
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                    )}
                  </div>
                  
                  {cert.status === 'rejected' && cert.rejection_reason && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <p className="text-red-800 font-semibold mb-1">Rejection Reason:</p>
                      <p className="text-red-700">{cert.rejection_reason}</p>
                    </div>
                  )}
                  
                  {cert.status === 'approved' && cert.verified_by_name && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <p className="text-green-800">
                        <span className="font-semibold">Verified by:</span> {cert.verified_by_name} on {new Date(cert.verified_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardsDashboard;
