import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle, XCircle, MapPin, Map } from 'lucide-react';
import { matchAPI } from '../services/api';

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await matchAPI.getMatches();
      setMatches(response.data);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMatch = async (matchId) => {
    if (!window.confirm('Mark this donation as completed?')) return;
    
    try {
      await matchAPI.completeMatch(matchId);
      fetchMatches(); // Refresh list
      alert('Donation marked as completed!');
    } catch (err) {
      console.error('Failed to complete match:', err);
      alert('Failed to complete donation');
    }
  };

  const handleCancelMatch = async (matchId) => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (!reason) return;
    
    try {
      await matchAPI.cancelMatch(matchId, reason);
      fetchMatches(); // Refresh list
      alert('Match cancelled');
    } catch (err) {
      console.error('Failed to cancel match:', err);
      alert('Failed to cancel match');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleViewAddressInMap = (match) => {
    const { hospital, city } = match.request;
    if (!hospital || !city) {
      alert('Address information is not available');
      return;
    }
    
    // Create Google Maps URL
    const address = `${hospital}, ${city}`;
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
    
    // Open in new tab
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Matches</h1>
          <p className="text-lg text-gray-600">
            View and manage your blood donation matches
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Matches List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600">Loading matches...</p>
            </div>
          ) : matches.length > 0 ? (
            matches.map(match => (
              <div key={match._id || match.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Match Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {(match.donor?.name || match.donor?.username || 'Donor')} ↔ {(match.request?.requester?.name || match.request?.requester?.username || 'Recipient')}
                      </h3>
                      {getStatusBadge(match.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-bold">Blood Type:</span> {match.request.bloodType || match.request.blood_type}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} className="text-red-600" />
                        <span>{match.request.city}</span>
                      </div>
                      <div>
                        <span className="font-bold">Hospital:</span> {match.request.hospital}
                      </div>
                      <div>
                        <span className="font-bold">Matched:</span> {new Date(match.matched_at).toLocaleDateString()}
                      </div>
                      <div className="md:col-span-4">
                        <span className="font-bold">📍 Full Address:</span> {match.request.hospital}, {match.request.city}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {match.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleViewAddressInMap(match)}
                          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition"
                        >
                          <Map size={18} />
                          View Address
                        </button>
                        <button
                          onClick={() => navigate(`/chat/${match._id || match.id}`)}
                          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                        >
                          <MessageCircle size={18} />
                          Chat
                        </button>
                        <button
                          onClick={() => handleCompleteMatch(match._id || match.id)}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition"
                        >
                          <CheckCircle size={18} />
                          Complete
                        </button>
                        <button
                          onClick={() => handleCancelMatch(match._id || match.id)}
                          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition"
                        >
                          <XCircle size={18} />
                          Cancel
                        </button>
                      </>
                    )}
                    {match.status === 'completed' && (
                      <span className="text-green-600 font-bold">✓ Donation Completed</span>
                    )}
                    {match.status === 'cancelled' && (
                      <span className="text-gray-600 font-bold">✗ Match Cancelled</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No matches yet</p>
              <p className="text-gray-500 mt-2">
                Create a blood request or accept a request to start matching
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matches;
