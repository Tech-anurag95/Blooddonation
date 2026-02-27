import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/adminApi';
import { Link } from 'react-router-dom';

const AdminAudit = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterEmail, setFilterEmail] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [userIdForPwd, setUserIdForPwd] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterEmail) params.user_email = filterEmail;
      if (filterAction) params.action = filterAction;
      const res = await adminAPI.getLoginActivities(params);
      setActivities(res.data);
    } catch (err) {
      console.error(err);
      setActivities([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchActivities(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!userIdForPwd || !newPassword) return;
    try {
      await adminAPI.changeUserPassword(userIdForPwd, newPassword);
      alert('Password changed');
      setUserIdForPwd(''); setNewPassword('');
    } catch (err) {
      console.error(err);
      alert('Failed to change password');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin Audit</h1>
        <Link to="/admin" className="text-sm text-red-600">Back to Admin Dashboard</Link>
      </div>

      <form onSubmit={handleSearch} className="mb-4 space-y-2">
        <div className="flex space-x-2">
          <input className="border p-2 flex-1" placeholder="Filter by user email" value={filterEmail} onChange={e=>setFilterEmail(e.target.value)} />
          <select className="border p-2" value={filterAction} onChange={e=>setFilterAction(e.target.value)}>
            <option value="">All actions</option>
            <option value="login">login</option>
            <option value="logout">logout</option>
            <option value="password_change">password_change</option>
            <option value="password_change_by_admin">password_change_by_admin</option>
            <option value="failed_login">failed_login</option>
          </select>
          <button className="bg-red-600 text-white px-4 py-2 rounded">Search</button>
        </div>
      </form>

      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {(activities.results || activities).length === 0 ? (
            <p>No activity found.</p>
          ) : (
            (activities.results || activities).map(a => (
              <div key={a.id} className="border p-3 rounded">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{a.user_email || a.user}</p>
                    <p className="text-sm text-gray-600">{a.action} — {new Date(a.timestamp).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">IP: {a.ip} • UA: {a.user_agent}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-8 border-t pt-4">
        <h2 className="font-semibold mb-2">Admin: Change user password</h2>
        <form onSubmit={handleChangePassword} className="flex space-x-2">
          <input placeholder="User ID" className="border p-2" value={userIdForPwd} onChange={e=>setUserIdForPwd(e.target.value)} />
          <input placeholder="New password" type="password" className="border p-2" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
          <button className="bg-red-600 text-white px-4 py-2 rounded">Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default AdminAudit;
