import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import { messageAPI, matchAPI } from '../services/api';

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');
  const isInitialLoad = useRef(true);
  const shouldAutoScroll = useRef(false);

  useEffect(() => {
    fetchMatch();
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    // Only auto-scroll on initial load or after sending a message
    if (isInitialLoad.current || shouldAutoScroll.current) {
      scrollToBottom();
      isInitialLoad.current = false;
      shouldAutoScroll.current = false;
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMatch = async () => {
    try {
      const response = await matchAPI.getMatch(matchId);
      setMatch(response.data);
    } catch (err) {
      console.error('Failed to fetch match:', err);
      setError('Failed to load match details');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await messageAPI.getMessages(matchId);
      setMessages(response.data);
      
      // Mark unread messages as read
      response.data.forEach(msg => {
        if (!msg.is_read && msg.receiver.id === parseInt(currentUserId)) {
          messageAPI.markAsRead(msg.id).catch(console.error);
        }
      });
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      await messageAPI.sendMessage(matchId, newMessage);
      setNewMessage('');
      shouldAutoScroll.current = true; // Enable auto-scroll after sending
      fetchMessages(); // Refresh messages
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = () => {
    if (!match) return null;
    const currentUser = parseInt(currentUserId);
    return match.donor.id === currentUser ? match.request.requester : match.donor;
  };

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-grow">
            <h1 className="text-xl font-bold text-gray-900">
              {otherUser ? otherUser.username : 'Loading...'}
            </h1>
            {match && (
              <p className="text-sm text-gray-600">
                Blood Type: {match.request.blood_type} • {match.request.city}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender.id === parseInt(currentUserId);
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {isCurrentUser ? 'You' : message.sender.username}
                    </p>
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-red-100' : 'text-gray-500'}`}>
                      {new Date(message.sent_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
