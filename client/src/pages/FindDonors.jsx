import React, { useState, useEffect } from 'react';
import { MapPin, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { donorAPI } from '../services/api';

const FindDonors = () => {
  const navigate = useNavigate();
  const [selectedBloodType, setSelectedBloodType] = useState('O+');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const fetchDonors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await donorAPI.getNearbyDonors(selectedBloodType);
      const donorData = response.data.data || response.data || [];
      setDonors(donorData);
    } catch (err) {
      setError('Failed to fetch donors');
      console.error('Fetch donors error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedBloodType]);

  const handleContactDonor = (donorId) => {
    alert(`Contacted donor with ID: ${donorId}`);
  };

  const handleMessageDonor = (donorId) => {
    // Redirect to matches page where users can see their active matches and chat
    navigate('/matches');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Blood Donors</h1>
          <p className="text-lg text-gray-600">
            Browse available donors in your area. Select your required blood type to get started.
          </p>
        </div>

        {/* Blood Type Filter */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Blood Type</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {bloodTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedBloodType(type)}
                className={`py-3 rounded-lg font-bold transition ${
                  selectedBloodType === type
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Donors List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600">Loading donors...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : donors.length > 0 ? (
            donors.map(donor => (
              <div key={donor.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Donor Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{donor.username || donor.name || 'Anonymous'}</h3>
                      {donor.verified && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-red-600">{donor.blood_type || donor.bloodType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-red-600" />
                        <span>{donor.city || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart size={18} className="text-red-600" />
                        <span>{donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleMessageDonor(donor.id)}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                    >
                      View Matches
                    </button>
                    <button
                      onClick={() => handleContactDonor(donor.id)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition"
                    >
                      Request Blood
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No donors found for {selectedBloodType}</p>
              <p className="text-gray-500 mt-2">Try searching for a different blood type</p>
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nearby Donors Map</h2>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="text-red-600 mx-auto mb-2" />
              <p className="text-gray-600">Map will load with donor locations</p>
              <p className="text-sm text-gray-500">Integrate Google Maps or Mapbox API</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindDonors;
