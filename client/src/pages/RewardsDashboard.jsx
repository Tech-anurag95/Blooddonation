import React, { useState, useEffect, useCallback } from 'react';
import { Award, Upload, CheckCircle, XCircle, Clock, Gift, TrendingUp, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';

const DJANGO_URL = 'http://localhost:8000';

const RewardsDashboard = () => {
  const navigate  = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Get current user's mongo_id
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      const meRes  = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const meData = await meRes.json();
      const userId = meData?.data?._id || meData?._id || localStorage.getItem('userId');

      if (!userId) { setError('Could not identify user. Please log in again.'); return; }

      // Fetch certificates from Django
      const certRes  = await fetch(`${DJANGO_URL}/sync/donor-certificates/${userId}/`);
      const certData = await certRes.json();

      if (certRes.ok) {
        setCertificates(certData.certificates || []);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load rewards data. Make sure Django server is running.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 10s if any cert is pending
  useEffect(() => {
    const hasPending = certificates.some(c => c.cert_status === 'pending');
    if (!hasPending) return;
    const t = setInterval(fetchData, 10000);
    return () => clearInterval(t);
  }, [certificates, fetchData]);

  const approvedCount = certificates.filter(c => c.cert_status === 'approved').length;
  const freeCredits   = Math.floor(approvedCount / 3);
  const progressPct   = Math.min(((approvedCount % 3) / 3) * 100, 100);
  const remaining     = 3 - (approvedCount % 3);

  const StatusBadge = ({ status }) => {
    const map = {
      pending:  { icon: Clock,         cls: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending Review' },
      approved: { icon: CheckCircle,   cls: 'bg-green-100  text-green-800  border-green-300',  label: 'Approved' },
      rejected: { icon: XCircle,       cls: 'bg-red-100    text-red-800    border-red-300',    label: 'Rejected' },
    };
    const { icon: Icon, cls, label } = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border-2 ${cls}`}>
        <Icon className="w-4 h-4" /> {label}
      </span>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading rewards...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Rewards Dashboard</h1>
          <p className="text-xl text-gray-600">Track your certificates and earn free blood credits</p>
          <button onClick={fetchData} className="mt-3 flex items-center gap-2 mx-auto text-sm text-purple-600 hover:text-purple-800 font-semibold">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: TrendingUp, color: 'blue',   label: 'Total Uploaded',    value: certificates.length },
            { icon: CheckCircle, color: 'green',  label: 'Approved',          value: approvedCount },
            { icon: Gift,        color: 'purple', label: 'Free Credits',      value: freeCredits },
            { icon: Clock,       color: 'yellow', label: 'Pending Review',    value: certificates.filter(c => c.cert_status === 'pending').length },
          ].map(({ icon: Icon, color, label, value }) => (
            <div key={label} className={`bg-white rounded-2xl shadow-lg p-6 border-2 border-${color}-200`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-8 h-8 text-${color}-600`} />
                <span className={`text-3xl font-bold text-${color}-600`}>{value}</span>
              </div>
              <p className="text-gray-600 font-semibold">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-600" /> Progress to Next Free Credit
          </h2>
          <div className="mb-3">
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span>{approvedCount % 3} / 3 Approved Certificates</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <p className="text-gray-600">
            {approvedCount === 0
              ? 'Upload 3 certified donation certificates to earn 1 free blood credit!'
              : remaining === 0
                ? 'You have earned a free blood credit! Keep donating to earn more.'
                : `${remaining} more approved certificate${remaining > 1 ? 's' : ''} to earn your next free credit!`}
          </p>
        </div>

        {/* Upload button */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 mb-8 text-center">
          <Upload className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-3">Upload Donation Certificate</h2>
          <p className="text-white/90 mb-6 text-lg">After donating blood, upload your hospital certificate to earn rewards</p>
          <button
            onClick={() => navigate('/upload-certificate')}
            className="bg-white text-purple-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Upload Certificate
          </button>
        </div>

        {/* Certificates list */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" /> My Certificates ({certificates.length})
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
                <div key={cert.mongo_id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{cert.hospital_name}</h3>
                        <StatusBadge status={cert.cert_status} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <span><b>Date:</b> {cert.donation_date ? new Date(cert.donation_date).toLocaleDateString('en-IN') : '—'}</span>
                        <span><b>Blood:</b> {cert.blood_type || '—'}</span>
                        <span><b>Quantity:</b> {cert.quantity} ml</span>
                        <span><b>Uploaded:</b> {new Date(cert.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    {/* File preview */}
                    {cert.file_url && (
                      cert.file_type === 'pdf' ? (
                        <a href={cert.file_url} target="_blank" rel="noreferrer"
                          className="text-sm bg-red-100 text-red-700 px-3 py-2 rounded-lg font-semibold hover:bg-red-200 transition">
                          View PDF
                        </a>
                      ) : (
                        <a href={cert.file_url} target="_blank" rel="noreferrer">
                          <img src={cert.file_url} alt="Certificate" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200" />
                        </a>
                      )
                    )}
                  </div>

                  {cert.cert_status === 'rejected' && cert.rejection_reason && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mt-3">
                      <p className="text-red-800 font-semibold mb-1">Rejection Reason:</p>
                      <p className="text-red-700">{cert.rejection_reason}</p>
                    </div>
                  )}

                  {cert.cert_status === 'approved' && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mt-3">
                      <p className="text-green-800 font-semibold">
                        Certificate approved on {cert.reviewed_at ? new Date(cert.reviewed_at).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                  )}

                  {cert.cert_status === 'pending' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mt-3">
                      <p className="text-yellow-800 text-sm">Awaiting admin review. This page refreshes automatically.</p>
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
