import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/admin/pending-verifications');
        setPending(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPending();
  }, []);

  const updateVerification = async (id, verified) => {
    try {
      await api.put(`/users/${id}/verify`, { verified });
      setPending(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin — Pending Verifications</h1>
        <Link to="/admin/audit" className="text-sm text-red-600">View Audit Logs</Link>
      </div>
      {pending.length === 0 ? (
        <p>No pending verifications.</p>
      ) : (
        <ul className="space-y-4">
          {pending.map(u => (
            <li key={u._id} className="border p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{u.name} — {u.email}</p>
                  <p className="text-sm text-gray-600">Docs: {u.verificationDocs?.length || 0}</p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => updateVerification(u._id, true)} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                  <button onClick={() => updateVerification(u._id, false)} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
