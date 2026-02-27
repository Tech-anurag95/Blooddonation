import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { GiDroplets } from 'react-icons/gi';

const Navbar = ({ isAuthenticated, userRole, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl hover:text-red-100">
            <GiDroplets size={28} />
            <span>BloodConnect</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link to="/rules" className="hover:text-red-100 transition">Rules</Link>
            <Link to="/instructions" className="hover:text-red-100 transition">Instructions</Link>
            <Link to="/faq" className="hover:text-red-100 transition">FAQ</Link>
            <Link to="/privacy" className="hover:text-red-100 transition">Privacy</Link>
            <Link to="/terms" className="hover:text-red-100 transition">Terms</Link>
            {isAuthenticated ? (
              <>
                <Link to="/find-donors" className="hover:text-red-100 transition">
                  Find Donors
                </Link>
                <Link to="/request-blood" className="hover:text-red-100 transition">
                  Request Blood
                </Link>
                {userRole === 'donor' && (
                  <Link to="/dashboard" className="hover:text-red-100 transition">
                    Dashboard
                  </Link>
                )}
                {userRole === 'donor' && (
                  <Link to="/verify" className="hover:text-red-100 transition">Verify Account</Link>
                )}
                {userRole === 'admin' && (
                  <Link to="/admin" className="hover:text-red-100 transition">Admin</Link>
                )}
                <Link to="/profile" className="hover:text-red-100 transition flex items-center space-x-1">
                  <FiUser /> <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-red-100 transition flex items-center space-x-1"
                >
                  <FiLogOut /> <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-red-100 transition">
                  Login
                </Link>
                <Link to="/register" className="bg-white text-red-600 px-4 py-2 rounded hover:bg-red-50 transition">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 hover:bg-red-700 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
