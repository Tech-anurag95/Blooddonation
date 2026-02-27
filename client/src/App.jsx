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
import Profile from './pages/Profile';
import Rules from './pages/Rules';
import Instructions from './pages/Instructions';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import VerifyAccount from './pages/VerifyAccount';
import AdminDashboard from './pages/AdminDashboard';
import AdminAudit from './pages/AdminAudit';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);

  const handleLogin = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
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
            <Route path="/rules" element={<Rules />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/verify" element={<VerifyAccount />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            
            {isAuthenticated ? (
              <>
                <Route path="/dashboard" element={<DonorDashboard />} />
                <Route path="/request-blood" element={<RequestBlood />} />
                <Route path="/find-donors" element={<FindDonors />} />
                <Route path="/profile" element={<Profile />} />
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
