import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import RequestBlood from './pages/RequestBlood';
import FindDonors from './pages/FindDonors';
import BloodRequests from './pages/BloodRequests';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Matches from './pages/Matches';
import PrivacyAndTerms from './pages/PrivacyAndTerms';
import VerifyAccount from './pages/VerifyAccount';
import AdminDashboard from './pages/AdminDashboard';
import AdminAudit from './pages/AdminAudit';
import AdminDataManagement from './pages/AdminDataManagement';
import TestAPI from './pages/TestAPI';
import RewardsDashboard from './pages/RewardsDashboard';
import UploadCertificate from './pages/UploadCertificate';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);

  // Check authentication on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      setIsAuthenticated(!!token);
      setUserRole(role);
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (e.g., login in another tab)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogin = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  useEffect(() => {
    // Try to subscribe to push if logged in and VAPID key available
    const trySubscribe = async () => {
      const token = localStorage.getItem('token');
      const vapidKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      if (!token || !vapidKey) return;

      try {
        const { subscribeForPush } = await import('./services/push');
        await subscribeForPush(vapidKey);
      } catch (err) {
        console.error('Push subscribe error:', err);
      }
    };

    trySubscribe();
  }, [isAuthenticated]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/privacy-terms" element={<PrivacyAndTerms />} />
            <Route path="/verify" element={<VerifyAccount />} />
            <Route path="/test-api" element={<TestAPI />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
            <Route path="/admin/data" element={<AdminDataManagement />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            
            {isAuthenticated ? (
              <>
                <Route path="/blood-requests" element={<BloodRequests />} />
                <Route path="/dashboard" element={<DonorDashboard />} />
                <Route path="/request-blood" element={<RequestBlood />} />
                <Route path="/find-donors" element={<FindDonors />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/chat/:matchId" element={<Chat />} />
                <Route path="/rewards" element={<RewardsDashboard />} />
                <Route path="/upload-certificate" element={<UploadCertificate />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/" />} />
            )}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
