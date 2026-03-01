import React, { useState } from 'react';
import { Upload, Calendar, Building2, Droplet, FileImage, CheckCircle } from 'lucide-react';
import { certificateAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const UploadCertificate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    donation_date: '',
    hospital_name: '',
    blood_type: 'O+',
    quantity: 450,
    certificate_image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size cannot exceed 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and GIF images are allowed');
        return;
      }

      setFormData(prev => ({
        ...prev,
        certificate_image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.donation_date || !formData.hospital_name || !formData.certificate_image) {
        setError('Please fill in all required fields and upload a certificate image');
        setLoading(false);
        return;
      }

      // Create FormData object
      const data = new FormData();
      data.append('donation_date', formData.donation_date);
      data.append('hospital_name', formData.hospital_name);
      data.append('blood_type', formData.blood_type);
      data.append('quantity', formData.quantity);
      data.append('certificate_image', formData.certificate_image);

      await certificateAPI.uploadCertificate(data);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/rewards');
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to upload certificate');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Certificate Uploaded!</h2>
          <p className="text-gray-700 mb-4 text-lg">
            Your donation certificate has been submitted for verification.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Hospital admin will review and approve it within 30 days. You'll be notified once it's verified.
          </p>
          <button
            onClick={() => navigate('/rewards')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
          >
            View Rewards Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-2xl mb-4">
            <Upload className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">Upload Certificate</h1>
          <p className="text-xl text-white/90 drop-shadow">
            Submit your donation certificate to earn rewards
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donation Date */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Donation Date *
              </label>
              <input
                type="date"
                name="donation_date"
                value={formData.donation_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-lg"
                required
              />
            </div>

            {/* Hospital Name */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Hospital Name *
              </label>
              <input
                type="text"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                placeholder="Enter hospital name"
                required
              />
            </div>

            {/* Blood Type */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-purple-600" />
                Blood Type *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {bloodTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, blood_type: type }))}
                    className={`py-3 px-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                      formData.blood_type === type
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
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
                <Droplet className="w-5 h-5 text-purple-600" />
                Quantity (ml) *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="100"
                max="1000"
                step="50"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-lg"
                required
              />
              <p className="text-sm text-gray-500 mt-2">Standard donation is 450ml</p>
            </div>

            {/* Certificate Image Upload */}
            <div className="group">
              <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileImage className="w-5 h-5 text-purple-600" />
                Certificate Image *
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-all">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Certificate preview" 
                      className="max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, certificate_image: null }));
                      }}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">JPEG, PNG, or GIF (max 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                  id="certificate-upload"
                  required={!imagePreview}
                />
                {!imagePreview && (
                  <label
                    htmlFor="certificate-upload"
                    className="mt-4 inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 cursor-pointer transition-all"
                  >
                    Choose File
                  </label>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p className="text-blue-900 font-semibold mb-2">📋 Important Information:</p>
              <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
                <li>Upload a clear photo of your hospital donation certificate</li>
                <li>Certificate will be reviewed by hospital admin within 30 days</li>
                <li>3 approved certificates = 1 free blood credit</li>
                <li>Rejected certificates can be re-uploaded with corrections</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform shadow-lg flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Certificate
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadCertificate;
