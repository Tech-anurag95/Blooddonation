import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Phone, Calendar, Droplet, AlertCircle,
  Clock, CheckCircle, Users, Download, RefreshCw, Star
} from 'lucide-react';
import { requestAPI } from '../services/api';
import { API_BASE_URL } from '../config/api.config';
import io from 'socket.io-client';

const TABS = [
  { key: 'all',       label: 'All Requests', icon: Droplet },
  { key: 'pending',   label: 'Pending',      icon: Clock },
  { key: 'matched',   label: 'Matched',      icon: Users },
  { key: 'completed', label: 'Completed',    icon: CheckCircle },
];

const STATUS_STYLES = {
  pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  matched:   { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Matched' },
  completed: { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completed' },
  cancelled: { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'Cancelled' },
};

const URGENCY_STYLES = {
  urgent:   'bg-red-100 text-red-700 border-red-300',
  critical: 'bg-red-200 text-red-800 border-red-400',
  high:     'bg-orange-100 text-orange-700 border-orange-300',
  normal:   'bg-green-100 text-green-700 border-green-300',
};

const SERVER_URL = API_BASE_URL.replace('/api', '');

const BloodRequests = () => {
  const [allRequests, setAllRequests]     = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [filter, setFilter]               = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [liveIndicator, setLiveIndicator] = useState(false);

  const currentUserId  = localStorage.getItem('userId');
  // Get donor's blood group from localStorage (set at login)
  const myBloodType    = localStorage.getItem('userBloodType') || '';

  // ── Fetch all requests ──────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await requestAPI.getAllRequests();
      setAllRequests(res.data?.data || []);
    } catch {
      setError('Failed to load blood requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    // Also try to load blood type from /users/me if not in localStorage
    const token = localStorage.getItem('token');
    if (token && !myBloodType) {
      fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          const bt = d?.data?.bloodType || d?.bloodType;
          if (bt) localStorage.setItem('userBloodType', bt);
        })
        .catch(() => {});
    }
  }, [fetchRequests, myBloodType]);

  // ── Real-time Socket.io ─────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    socket.on('new_blood_request', ({ request }) => {
      setAllRequests(prev => prev.find(r => r._id === request._id) ? prev : [request, ...prev]);
      flashLive();
    });
    socket.on('request_status_update', ({ requestId, request }) => {
      setAllRequests(prev => prev.map(r => r._id === requestId ? { ...r, ...request } : r));
      flashLive();
    });
    socket.on('request_deleted', ({ requestId }) => {
      setAllRequests(prev => prev.filter(r => r._id !== requestId));
    });
    return () => socket.disconnect();
  }, []);

  const flashLive = () => {
    setLiveIndicator(true);
    setTimeout(() => setLiveIndicator(false), 2000);
  };

  // ── Sort: my blood group first, then by urgency ─────────────────────────────
  const sortRequests = (list) => {
    const urgencyOrder = { critical: 0, urgent: 1, high: 2, normal: 3 };
    return [...list].sort((a, b) => {
      const aMatch = (a.bloodType || a.blood_type) === myBloodType ? 0 : 1;
      const bMatch = (b.bloodType || b.blood_type) === myBloodType ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      // Within same group, sort by urgency
      const aUrg = urgencyOrder[(a.urgency || 'normal').toLowerCase()] ?? 3;
      const bUrg = urgencyOrder[(b.urgency || 'normal').toLowerCase()] ?? 3;
      return aUrg - bUrg;
    });
  };

  // ── Filtered + sorted list ──────────────────────────────────────────────────
  const filtered = sortRequests(
    (filter === 'all' ? allRequests : allRequests.filter(r => r.status === filter))
      .filter(r => {
        // Hide requests posted by the current user
        const requesterId = r.requester?._id || r.requester;
        return requesterId !== currentUserId;
      })
  );

  // ── Tab counts (exclude own requests) ─────────────────────────────────────
  const othersRequests = allRequests.filter(r => {
    const requesterId = r.requester?._id || r.requester;
    return requesterId !== currentUserId;
  });
  const counts = {
    all:       othersRequests.length,
    pending:   othersRequests.filter(r => r.status === 'pending').length,
    matched:   othersRequests.filter(r => r.status === 'matched').length,
    completed: othersRequests.filter(r => r.status === 'completed').length,
  };

  // ── Accept with blood group warning ────────────────────────────────────────
  const handleAccept = async (request) => {
    const reqBlood = request.bloodType || request.blood_type;
    const isMatch  = reqBlood === myBloodType;

    if (!isMatch && myBloodType) {
      const confirmed = window.confirm(
        `⚠️ Blood Group Mismatch!\n\n` +
        `This request needs: ${reqBlood}\n` +
        `Your blood group: ${myBloodType}\n\n` +
        `Donating incompatible blood can be life-threatening.\n` +
        `Are you sure you want to proceed?`
      );
      if (!confirmed) return;
    } else {
      if (!window.confirm('Accept this blood donation request?')) return;
    }

    setActionLoading(request._id + '_accept');
    try {
      await requestAPI.updateRequest(request._id, { status: 'matched' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Mark completed ──────────────────────────────────────────────────────────
  const handleComplete = async (requestId) => {
    if (!window.confirm('Mark this donation as completed?')) return;
    setActionLoading(requestId + '_complete');
    try {
      await requestAPI.updateRequest(requestId, { status: 'completed' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as completed');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Download certificate ────────────────────────────────────────────────────
  const handleDownloadCertificate = async (request) => {
    try {
      const token = localStorage.getItem('token');
      const donationsRes  = await fetch(`${API_BASE_URL}/donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const donationsData = await donationsRes.json();
      const donation = (donationsData.data || []).find(
        d => d.request?._id === request._id || d.request === request._id
      );
      if (!donation) { alert('No donation record found for this request.'); return; }

      const certRes = await fetch(`${API_BASE_URL}/donations/${donation._id}/certificate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!certRes.ok) { const e = await certRes.json(); alert(e.message || 'Failed'); return; }

      const blob = await certRes.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `bloodde-certificate-${request._id}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert('Failed to download certificate'); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Blood Donation Requests</h1>
            <p className="text-gray-600">Help save lives by donating blood to those in need</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${liveIndicator ? 'bg-green-400 animate-ping' : 'bg-green-500'}`}></span>
              <span className="text-xs text-gray-500 font-medium">Live</span>
            </div>
            <button onClick={fetchRequests}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* My blood group info banner */}
        {myBloodType && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-5 flex items-center gap-3">
            <Star size={18} className="text-red-600 fill-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm font-semibold">
              Your blood group is <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold">{myBloodType}</span>
              &nbsp;— matching requests are shown first and highlighted.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 flex gap-2">
          {TABS.map(tab => {
            const Icon   = tab.icon;
            const active = filter === tab.key;
            return (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  active ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <Icon size={16} />
                {tab.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>{counts[tab.key]}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {/* Request Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map(request => {
              const reqBlood   = request.bloodType || request.blood_type;
              const isMyMatch  = myBloodType && reqBlood === myBloodType;
              const isMismatch = myBloodType && reqBlood !== myBloodType;
              const st         = STATUS_STYLES[request.status] || STATUS_STYLES.pending;
              const urgKey     = (request.urgency || 'normal').toLowerCase();
              const urgCls     = URGENCY_STYLES[urgKey] || URGENCY_STYLES.normal;
              const isMyAccepted = request.acceptedBy?._id === currentUserId ||
                                   request.acceptedBy === currentUserId;

              return (
                <div key={request._id}
                  className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all ${
                    isMyMatch
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-gray-100'
                  }`}>

                  {/* My blood group match banner */}
                  {isMyMatch && (
                    <div className="flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-4 w-fit">
                      <Star size={13} className="fill-white" />
                      YOUR BLOOD GROUP — PERFECT MATCH
                    </div>
                  )}

                  {/* Mismatch warning strip */}
                  {isMismatch && request.status === 'pending' && (
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-300 text-orange-800 text-xs font-semibold px-3 py-1.5 rounded-lg mb-4">
                      <AlertCircle size={13} />
                      This request needs <strong className="mx-1">{reqBlood}</strong> — not your blood group ({myBloodType}). You can still donate but a warning will appear.
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Left — info */}
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isMyMatch ? 'bg-red-600' : 'bg-red-50'}`}>
                          <Droplet size={22} className={isMyMatch ? 'text-white' : 'text-red-600'} />
                          <span className={`text-2xl font-extrabold ${isMyMatch ? 'text-white' : 'text-red-600'}`}>
                            {reqBlood}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${urgCls}`}>
                          {(request.urgency || 'Normal').toUpperCase()}
                        </span>
                        {request.donorName && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                            Donor: {request.donorName}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Requested by: {request.requester?.name || 'Anonymous'}
                      </h3>
                      {request.reason && <p className="text-gray-500 text-sm mb-4">{request.reason}</p>}

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-xs text-gray-400 uppercase">Hospital</p>
                            <p>{request.hospital}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-xs text-gray-400 uppercase">City</p>
                            <p>{request.city}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-gray-700">
                          <Droplet size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-xs text-gray-400 uppercase">Units</p>
                            <p>{request.quantity} ml</p>
                          </div>
                        </div>
                        {request.phone && (
                          <div className="flex items-start gap-2 text-gray-700">
                            <Phone size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-xs text-gray-400 uppercase">Contact</p>
                              <p>{request.phone}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-gray-700">
                          <Calendar size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-xs text-gray-400 uppercase">Requested</p>
                            <p>{new Date(request.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}</p>
                          </div>
                        </div>
                        {request.completedAt && (
                          <div className="flex items-start gap-2 text-gray-700">
                            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-xs text-gray-400 uppercase">Completed</p>
                              <p>{new Date(request.completedAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {['critical', 'urgent'].includes(urgKey) && request.status === 'pending' && (
                        <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">
                          <AlertCircle size={18} />
                          <span className="font-bold text-sm">URGENT: This request needs immediate attention!</span>
                        </div>
                      )}
                    </div>

                    {/* Right — actions */}
                    <div className="flex flex-col gap-3 lg:min-w-[180px]">

                      {/* PENDING — Accept button */}
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleAccept(request)}
                          disabled={actionLoading === request._id + '_accept'}
                          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold transition disabled:opacity-50 ${
                            isMyMatch
                              ? 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-300'
                              : 'bg-red-600 text-white hover:bg-red-700'
                          }`}>
                          {actionLoading === request._id + '_accept'
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Droplet size={18} />}
                          Accept & Donate
                        </button>
                      )}

                      {/* MATCHED — Mark Completed */}
                      {request.status === 'matched' && isMyAccepted && (
                        <button onClick={() => handleComplete(request._id)}
                          disabled={actionLoading === request._id + '_complete'}
                          className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50">
                          {actionLoading === request._id + '_complete'
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <CheckCircle size={18} />}
                          Mark Completed
                        </button>
                      )}

                      {request.status === 'matched' && !isMyAccepted && (
                        <div className="text-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                          <Users size={20} className="text-blue-600 mx-auto mb-1" />
                          <p className="text-blue-700 font-bold text-sm">Donor Matched</p>
                          <p className="text-blue-500 text-xs mt-1">{request.donorName || 'A donor has accepted'}</p>
                        </div>
                      )}

                      {/* COMPLETED — Download Certificate */}
                      {request.status === 'completed' && isMyAccepted && (
                        <button onClick={() => handleDownloadCertificate(request)}
                          className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-3 rounded-lg font-bold hover:from-red-700 hover:to-pink-700 transition shadow-md">
                          <Download size={18} /> Download Certificate
                        </button>
                      )}

                      {request.status === 'completed' && !isMyAccepted && (
                        <div className="text-center bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                          <CheckCircle size={20} className="text-green-600 mx-auto mb-1" />
                          <p className="text-green-700 font-bold text-sm">Donation Completed</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center">
              <Droplet size={56} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No blood requests found</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'all' ? 'There are currently no blood donation requests' : `No ${filter} requests at the moment`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodRequests;
