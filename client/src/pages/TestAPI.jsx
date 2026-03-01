import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api.config';
import { authAPI } from '../services/api';

const TestAPI = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const response = await authAPI.login('shivam@gmail.com', 'shivam123');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult(`ERROR: ${error.message}\n\nResponse: ${JSON.stringify(error.response?.data, null, 2)}\n\nStatus: ${error.response?.status}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-6">API Configuration Test</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h2 className="font-bold mb-2">Current Configuration:</h2>
          <p><strong>API URL:</strong> {API_BASE_URL}</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>REACT_APP_API_URL:</strong> {process.env.REACT_APP_API_URL || 'not set'}</p>
        </div>

        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 mb-4"
        >
          {loading ? 'Testing...' : 'Test Login (shivam@gmail.com)'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAPI;
