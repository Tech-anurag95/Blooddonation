import React, { useState, useEffect } from 'react';
import { Users, FileText, Heart, Search, Edit, Trash2, Check, X, Filter } from 'lucide-react';
import api from '../services/api';

const AdminDataManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters]);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await api.get('/admin/users', { params: filters });
        setUsers(res.data.data || []);
      } else if (activeTab === 'requests') {
        const res = await api.get('/admin/requests', { params: filters });
        setRequests(res.data.data || []);
      } else if (activeTab === 'donations') {
        const res = await api.get('/admin/donations', { params: filters });
        setDonations(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const endpoint = activeTab === 'users' ? `/admin/users/${id}` :
                      activeTab === 'requests' ? `/admin/requests/${id}` :
                      `/admin/donations/${id}`;
      
      await api.put(endpoint, updates);
      alert('Updated successfully!');
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const endpoint = activeTab === 'users' ? `/admin/users/${id}` :
                      activeTab === 'requests' ? `/admin/requests/${id}` :
                      `/admin/donations/${id}`;
      
      await api.delete(endpoint);
      alert('Deleted successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleVerify = async (userId, verified) => {
    try {
      await api.put(`/admin/users/${userId}/verify`, { verified });
      alert(`User ${verified ? 'verified' : 'rejected'} successfully!`);
      fetchData();
    } catch (err) {
      alert('Failed to verify: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Data Management</h1>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.users.total}</p>
                </div>
                <Users className="text-blue-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Requests</p>
                  <p className="text-3xl font-bold text-red-600">{stats.requests.total}</p>
                </div>
                <FileText className="text-red-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Donations</p>
                  <p className="text-3xl font-bold text-green-600">{stats.donations.total}</p>
                </div>
                <Heart className="text-green-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Verifications</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.users.pendingVerification}</p>
                </div>
                <Filter className="text-yellow-600" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-bold ${activeTab === 'users' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-4 font-bold ${activeTab === 'requests' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
            >
              Blood Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-6 py-4 font-bold ${activeTab === 'donations' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
            >
              Donations ({donations.length})
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <button
                onClick={fetchData}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="p-6">
            {loading ? (
              <p className="text-center text-gray-600 py-8">Loading...</p>
            ) : (
              <>
                {/* Users Table */}
                {activeTab === 'users' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Email</th>
                          <th className="text-left py-3 px-4">Role</th>
                          <th className="text-left py-3 px-4">Blood Type</th>
                          <th className="text-left py-3 px-4">City</th>
                          <th className="text-left py-3 px-4">Verified</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.filter(u => 
                          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(user => (
                          <tr key={user._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'donor' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">{user.bloodType}</td>
                            <td className="py-3 px-4">{user.city}</td>
                            <td className="py-3 px-4">
                              {user.verified ? (
                                <Check className="text-green-600" size={20} />
                              ) : (
                                <X className="text-red-600" size={20} />
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                {!user.verified && (
                                  <button
                                    onClick={() => handleVerify(user._id, true)}
                                    className="text-green-600 hover:text-green-700"
                                    title="Verify"
                                  >
                                    <Check size={18} />
                                  </button>
                                )}
                                <button
                                  onClick={() => setEditingItem(user)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Requests Table */}
                {activeTab === 'requests' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Requester</th>
                          <th className="text-left py-3 px-4">Blood Type</th>
                          <th className="text-left py-3 px-4">Quantity</th>
                          <th className="text-left py-3 px-4">Urgency</th>
                          <th className="text-left py-3 px-4">Hospital</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(req => (
                          <tr key={req._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{req.requester?.name}</td>
                            <td className="py-3 px-4 font-bold text-red-600">{req.bloodType}</td>
                            <td className="py-3 px-4">{req.quantity} units</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                req.urgency === 'urgent' ? 'bg-red-100 text-red-700' :
                                req.urgency === 'high' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {req.urgency}
                              </span>
                            </td>
                            <td className="py-3 px-4">{req.hospital}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                req.status === 'completed' ? 'bg-green-100 text-green-700' :
                                req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingItem(req)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(req._id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Donations Table */}
                {activeTab === 'donations' && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Donor</th>
                          <th className="text-left py-3 px-4">Recipient</th>
                          <th className="text-left py-3 px-4">Blood Type</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donations.map(donation => (
                          <tr key={donation._id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{donation.donor?.name}</td>
                            <td className="py-3 px-4">{donation.recipient?.name}</td>
                            <td className="py-3 px-4 font-bold text-red-600">{donation.bloodRequest?.bloodType}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                donation.status === 'completed' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {donation.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{new Date(donation.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingItem(donation)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(donation._id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Edit {activeTab.slice(0, -1)}</h2>
              <div className="space-y-4">
                {activeTab === 'users' && (
                  <>
                    <input
                      type="text"
                      placeholder="Name"
                      defaultValue={editingItem.name}
                      onChange={(e) => editingItem.name = e.target.value}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      defaultValue={editingItem.email}
                      onChange={(e) => editingItem.email = e.target.value}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <select
                      defaultValue={editingItem.role}
                      onChange={(e) => editingItem.role = e.target.value}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="donor">Donor</option>
                      <option value="recipient">Recipient</option>
                      <option value="admin">Admin</option>
                    </select>
                  </>
                )}
                {activeTab === 'requests' && (
                  <>
                    <select
                      defaultValue={editingItem.status}
                      onChange={(e) => editingItem.status = e.target.value}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                      defaultValue={editingItem.urgency}
                      onChange={(e) => editingItem.urgency = e.target.value}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </>
                )}
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleUpdate(editingItem._id, editingItem)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDataManagement;
