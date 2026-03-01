import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Calendar, Droplet, AlertCircle } from 'lucide-react';
import { requestAPI, matchAPI } from '../services/api';

const BloodRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, matched, completed

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await requestAPI.getAllRequests();
      let data = response.data;
      
      // Filter by status
      if (filter !== 'all') {
        data = data.filter(req => req.status === filter);
      }
      
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load blood requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm('Do you want to accept this blood donation request?')) return;
    
    try {
      await matchAPI.createMatch(requestId);
      alert('Request accepted! You can now message the recipient from the Matches page.');
      navigate('/matches');
    } catch (err) {
      console.error('Failed to accept request:', err);
      alert(err.response?.data?.error || 'Failed to accept request. You may have already accepted it.');
    }
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[urgency.toLowerCase()] || styles.medium}`}>
        {urgency}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-blue-100 text-blue-700',
      matched: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blood Donation Requests</h1>
          <p className="text-lg text-gray-600">
            Help save lives by donating blood to those in need
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-bold transition ${
                filter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-lg font-bold transition ${
                filter === 'pending'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('matched')}
              className={`px-6 py-2 rounded-lg font-bold transition ${
                filter === 'matched'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Matched
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-6 py-2 rounded-lg font-bold transition ${
                filter === 'completed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600">Loading requests...</p>
            </div>
          ) : requests.length > 0 ? (
            requests.map(request => (
              <div key={request.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Request Info */}
                  <div className="flex-grow">
                    {/* Header with Blood Type and Status */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Droplet size={32} className="text-red-600" />
                        <span className="text-3xl font-bold text-red-600">{request.blood_type}</span>
                      </div>
                      {getStatusBadge(request.status)}
                      {getUrgencyBadge(request.urgency)}
                    </div>

                    {/* Requester Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Requested by: {request.requester?.username || 'Anonymous'}
                      </h3>
                      <p className="text-gray-600">{request.reason || 'No reason provided'}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={18} className="text-red-600" />
                        <div>
                          <p className="font-bold">Hospital</p>
                          <p>{request.hospital}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={18} className="text-red-600" />
                        <div>
                          <p className="font-bold">City</p>
                          <p>{request.city}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-700">
                        <Droplet size={18} className="text-red-600" />
                        <div>
                          <p className="font-bold">Quantity</p>
                          <p>{request.quantity} unit(s)</p>
                        </div>
                      </div>

                      {request.phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone size={18} className="text-red-600" />
                          <div>
                            <p className="font-bold">Contact</p>
                            <p>{request.phone}</p>
                          </div>
                        </div>
                      )}

                      {request.requester?.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail size={18} className="text-red-600" />
                          <div>
                            <p className="font-bold">Email</p>
                            <p className="truncate">{request.requester.email}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={18} className="text-red-600" />
                        <div>
                          <p className="font-bold">Requested</p>
                          <p>{new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Urgency Message */}
                    {request.urgency.toLowerCase() === 'critical' && (
                      <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                        <AlertCircle size={20} />
                        <span className="font-bold">URGENT: This request needs immediate attention!</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 lg:min-w-[200px]">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <Droplet size={20} />
                        Donate Blood
                      </button>
                    )}
                    
                    {request.status === 'matched' && (
                      <div className="text-center">
                        <span className="text-green-600 font-bold">✓ Donor Found</span>
                        <p className="text-sm text-gray-600 mt-1">This request has been matched</p>
                      </div>
                    )}
                    
                    {request.status === 'completed' && (
                      <div className="text-center">
                        <span className="text-gray-600 font-bold">✓ Completed</span>
                        <p className="text-sm text-gray-600 mt-1">Donation completed</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <Droplet size={64} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No blood requests found</p>
              <p className="text-gray-500 mt-2">
                {filter === 'all' 
                  ? 'There are currently no blood donation requests'
                  : `No ${filter} requests at the moment`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodRequests;
