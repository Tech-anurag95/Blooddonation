/**
 * API Configuration - Smart Environment Detection
 * This file automatically determines the correct API URL based on the environment
 */

const getApiUrl = () => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Check if there's an explicit API URL set in environment
  const envApiUrl = process.env.REACT_APP_API_URL;
  
  // If environment variable is set and it's a localhost URL, use it
  if (envApiUrl && envApiUrl.includes('localhost')) {
    return envApiUrl;
  }
  
  // If environment variable is set and it's NOT localhost (e.g., tunnel URL), use it
  if (envApiUrl && !envApiUrl.includes('localhost')) {
    return envApiUrl;
  }
  
  // Default to localhost in development
  if (isDevelopment) {
    return 'http://localhost:5000/api';
  }
  
  // In production, use relative path (same domain)
  return '/api';
};

export const API_BASE_URL = getApiUrl();

export const config = {
  apiUrl: API_BASE_URL,
  vapidPublicKey: process.env.REACT_APP_VAPID_PUBLIC_KEY || 'your_vapid_public_key_here'
};

// Log the API URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    apiUrl: API_BASE_URL,
    environment: process.env.NODE_ENV
  });
}

export default config;
