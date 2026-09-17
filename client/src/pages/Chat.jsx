import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Smile } from 'lucide-react';
import { messageAPI, matchAPI } from '../services/api';

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');
  const isInitialLoad = useRef(true);
  const shouldAutoScroll = useRef(false);

  // Common emojis for quick access
  const commonEmojis = [
    '😊', '😂', '❤️', '👍', '🙏', '😢', '😍', '🎉', 
    '👏', '🔥', '💯', '✨', '🤝', '💪', '🩸', '❗'
  ];

  useEffect(() => {
    // Prevent body scroll when chat is open
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    fetchMatch();
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    
    return () => {
      clearInterval(interval);
      // Restore body scroll when leaving chat
      document.body.style.overflow = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
      document.body.style.height = 'auto';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const receiverId = String(msg.receiver?.id || msg.receiver?._id || '');
        if (!msg.is_read && receiverId === String(currentUserId)) {
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
    setShowEmojiPicker(false); // Close emoji picker when sending

    try {
      await messageAPI.sendMessage(matchId, newMessage);
      setNewMessage('');
      shouldAutoScroll.current = true; // Enable auto-scroll after sending
      fetchMessages(); // Refresh messages
      
      // Re-focus the input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    // Re-focus input after selecting emoji
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const getOtherUser = () => {
    if (!match) return null;
    const currentUser = String(currentUserId);
    const donorId = String(match.donor?.id || match.donor?._id || '');
    return donorId === currentUser ? match.request.requester : match.donor;
  };

  const otherUser = getOtherUser();

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="bg-white shadow-md p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-grow">
            <h1 className="text-xl font-bold text-gray-900">
              {otherUser ? otherUser.name || otherUser.username : 'Loading...'}
            </h1>
            {match && (
              <p className="text-sm text-gray-600">
                Blood Type: {match.request.bloodType || match.request.blood_type} • {match.request.city}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages - Scrollable area */}
      <div className="flex-1 overflow-y-auto p-4">
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
              const isCurrentUser = String(message.sender?.id || message.sender?._id || '') === String(currentUserId);
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
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
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

      {/* Message Input - Fixed at bottom */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Quick Emojis</p>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:bg-gray-200 rounded p-2 transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
              title="Add emoji"
            >
              <Smile size={24} />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
              disabled={loading}
              autoComplete="off"
              autoFocus
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
