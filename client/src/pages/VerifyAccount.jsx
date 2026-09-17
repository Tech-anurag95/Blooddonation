import React, { useState, useEffect } from 'react';
import api from '../services/api';

const VerifyAccount = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resp = await api.get('/auth/me');
        setUser(resp.data.user);
      } catch (err) {}
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return setMessage('Select a file and ensure you are logged in');

    const form = new FormData();
    form.append('document', file);

    try {
      const res = await api.post(`/users/${user._id}/upload-docs`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage(res.data.message || 'Uploaded');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Verify Your Account</h1>
      <p className="mb-4">Upload a government ID or relevant document for admin verification.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button className="bg-red-600 text-white px-4 py-2 rounded">Upload</button>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};

export default VerifyAccount;
