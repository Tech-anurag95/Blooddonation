import React, { useState, useEffect } from 'react';
import { Users, Search, Edit2, Trash2, Eye, Lock, Shield, Plus, ChevronDown, ChevronUp, X, Save } from 'lucide-react';
import api from '../services/api';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterVerified, setFilterVerified] = useState('all');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalUserId, setPasswordModalUserId] = useState(null);
  const [passwordModalEmail, setPasswordModalEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editFormData, setEditFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const ROLES = ['donor', 'recipient', 'admin'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filterRole, filterVerified]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users/');
      setUsers(res.data || res.data.results || []);
      showMessage('Users loaded successfully', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm);
      
      const matchesRole = filterRole === 'all' || 
        (filterRole === 'admin' && user.is_staff) ||
        (filterRole === 'donor' && !user.is_staff && user.blood_type) ||
        (filterRole === 'recipient' && !user.is_staff && !user.blood_type);
      
      const matchesVerified = filterVerified === 'all' ||
        (filterVerified === 'verified' && user.verified) ||
        (filterVerified === 'unverified' && !user.verified);
      
      return matchesSearch && matchesRole && matchesVerified;
    });
    setFilteredUsers(filtered);
  };

  const showMessage = (msg, type) => {
    if (type === 'success') {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setEditFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      blood_type: user.blood_type || '',
      city: user.city || '',
      age: user.age || '',
      weight: user.weight || '',
      verified: user.verified || false,
    });
  };

  const handleSaveEdit = async (userId) => {
    setLoading(true);
    try {
      const res = await api.patch(`/admin/users/${userId}/`, editFormData);
      setUsers(users.map(u => u.id === userId ? res.data : u));
      setEditingUserId(null);
      showMessage('User updated successfully', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Failed to update user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newIsStaff) => {
    setLoading(true);
    try {
      const res = await api.patch(`/admin/users/${userId}/`, { is_staff: newIsStaff });
      setUsers(users.map(u => u.id === userId ? res.data : u));
      showMessage(`User role changed to ${newIsStaff ? 'Admin' : 'Regular User'}`, 'success');
    } catch (err) {
      console.error(err);
      showMessage('Failed to change role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      showMessage('Please enter a new password', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await api.post(`/admin/users/${passwordModalUserId}/change_password/`, {
        new_password: newPassword
      });
      showMessage('Password changed successfully', 'success');
      setShowPasswordModal(false);
      setPasswordModalUserId(null);
      setNewPassword('');
    } catch (err) {
      console.error(err);
      showMessage('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (userId, currentStatus) => {
    setLoading(true);
    try {
      const res = await api.patch(`/admin/users/${userId}/`, { verified: !currentStatus });
      setUsers(users.map(u => u.id === userId ? res.data : u));
      showMessage(`User ${!currentStatus ? 'verified' : 'unverified'}`, 'success');
    } catch (err) {
      console.error(err);
      showMessage('Failed to update verification status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete ${userEmail}? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    try {
      await api.delete(`/admin/users/${userId}/`);
      setUsers(users.filter(u => u.id !== userId));
      showMessage('User deleted successfully', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openPasswordModal = (user) => {
    setPasswordModalUserId(user.id);
    setPasswordModalEmail(user.email);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const UserRow = ({ user }) => {
    const isExpanded = expandedUserId === user.id;
    const isEditing = editingUserId === user.id;

    return (
      <div key={user.id} className="border-b">
        <div className="flex items-center justify-between p-4 hover:bg-gray-50">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {user.verified ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  ✓ Verified
                </span>
              ) : (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Unverified
                </span>
              )}
              
              {user.is_staff ? (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Shield size={12} /> Admin
                </span>
              ) : (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {user.blood_type ? 'Donor' : 'Recipient'}
                </span>
              )}

              {user.blood_type && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  {user.blood_type}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <button
              onClick={() => handleEdit(user)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => openPasswordModal(user)}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded"
              title="Change Password"
            >
              <Lock size={18} />
            </button>
            <button
              onClick={() => handleDeleteUser(user.id, user.email)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="bg-gray-50 p-4 border-t">
            {isEditing ? (
              <EditUserForm
                data={editFormData}
                onChange={setEditFormData}
                onSave={() => handleSaveEdit(user.id)}
                onCancel={() => setEditingUserId(null)}
              />
            ) : (
              <UserDetails user={user} onChangeRole={() => handleChangeRole(user.id, !user.is_staff)} onToggleVerification={() => handleToggleVerification(user.id, user.verified)} />
            )}
          </div>
        )}
      </div>
    );
  };

  const UserDetails = ({ user, onChangeRole, onToggleVerification }) => (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-600">Email:</p>
        <p className="font-semibold">{user.email}</p>
      </div>
      <div>
        <p className="text-gray-600">Phone:</p>
        <p className="font-semibold">{user.phone || 'N/A'}</p>
      </div>
      <div>
        <p className="text-gray-600">City:</p>
        <p className="font-semibold">{user.city || 'N/A'}</p>
      </div>
      <div>
        <p className="text-gray-600">Age:</p>
        <p className="font-semibold">{user.age || 'N/A'}</p>
      </div>
      <div>
        <p className="text-gray-600">Blood Type:</p>
        <p className="font-semibold">{user.blood_type || 'N/A'}</p>
      </div>
      <div>
        <p className="text-gray-600">Weight:</p>
        <p className="font-semibold">{user.weight ? `${user.weight} kg` : 'N/A'}</p>
      </div>
      <div>
        <p className="text-gray-600">Created:</p>
        <p className="font-semibold">{new Date(user.date_joined).toLocaleDateString()}</p>
      </div>
      <div>
        <p className="text-gray-600">Last Login:</p>
        <p className="font-semibold">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</p>
      </div>

      <div className="col-span-2 flex gap-2 mt-4">
        <button
          onClick={onToggleVerification}
          className={`flex-1 py-2 rounded text-white font-semibold ${user.verified ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {user.verified ? 'Unverify' : 'Verify'}
        </button>
        <button
          onClick={onChangeRole}
          className={`flex-1 py-2 rounded text-white font-semibold ${user.is_staff ? 'bg-gray-600 hover:bg-gray-700' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {user.is_staff ? 'Revoke Admin' : 'Make Admin'}
        </button>
      </div>
    </div>
  );

  const EditUserForm = ({ data, onChange, onSave, onCancel }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="First Name"
          value={data.first_name}
          onChange={(e) => onChange({ ...data, first_name: e.target.value })}
          className="border px-3 py-2 rounded text-sm"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={data.last_name}
          onChange={(e) => onChange({ ...data, last_name: e.target.value })}
          className="border px-3 py-2 rounded text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          className="border px-3 py-2 rounded text-sm col-span-2"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={data.phone}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          className="border px-3 py-2 rounded text-sm"
        />
        <input
          type="text"
          placeholder="City"
          value={data.city}
          onChange={(e) => onChange({ ...data, city: e.target.value })}
          className="border px-3 py-2 rounded text-sm"
        />
        <select
          value={data.blood_type}
          onChange={(e) => onChange({ ...data, blood_type: e.target.value })}
          className="border px-3 py-2 rounded text-sm"
        >
          <option value="">Select Blood Type</option>
          {BLOOD_TYPES.map(bt => (
            <option key={bt} value={bt}>{bt}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Age"
          value={data.age}
          onChange={(e) => onChange({ ...data, age: e.target.value })}
          className="border px-3 py-2 rounded text-sm"
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          value={data.weight}
          onChange={(e) => onChange({ ...data, weight: e.target.value })}
          className="border px-3 py-2 rounded text-sm"
        />
        <label className="flex items-center gap-2 col-span-2">
          <input
            type="checkbox"
            checked={data.verified}
            onChange={(e) => onChange({ ...data, verified: e.target.checked })}
          />
          <span className="text-sm">Verified</span>
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2"
        >
          <Save size={16} /> Save Changes
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={32} /> Admin: User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all user credentials and account settings</p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-green-800 hover:text-green-900">
              <X size={20} />
            </button>
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded flex justify-between items-center">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="text-red-800 hover:text-red-900">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="flex items-center border rounded px-3 py-2">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Email, name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="donor">Donor</option>
                <option value="recipient">Recipient</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Verification</label>
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Actions</label>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm font-semibold"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">
              Total Users: <span className="text-blue-600">{filteredUsers.length}</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No users found matching your filters.</div>
          ) : (
            filteredUsers.map(user => <UserRow key={user.id} user={user} />)
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 mb-4">User: <strong>{passwordModalEmail}</strong></p>

            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4 text-sm"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm font-semibold"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
