import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">BloodConnect</h3>
            <p className="text-gray-400">
              Connecting blood donors with those in need. Save lives through blood donation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/rules" className="hover:text-white transition">Rules</Link></li>
              <li><Link to="/instructions" className="hover:text-white transition">Instructions</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">FAQs</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/privacy-terms" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/privacy-terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/privacy-terms" className="hover:text-white transition">Report Issue</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@bloodconnect.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Emergency: 911</li>
              <li>Follow us on social media</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BloodConnect. All rights reserved. Made with ❤️ for saving lives.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
