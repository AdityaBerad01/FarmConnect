import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';

export default function Messages() {
  const { user, api } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const targetUserId = searchParams.get('user');
    if (targetUserId) {
      loadUserChat(targetUserId);
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserChat = async (userId) => {
    try {
      const userRes = await api.get(`/users/${userId}`);
      setSelectedUser(userRes.data);
      setSendingTo(userId);
      
      const messagesRes = await api.get(`/messages/${userId}`);
      setMessages(messagesRes.data);
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedUser(conv.otherUser);
    setSendingTo(conv.otherUser._id);
    try {
      const res = await api.get(`/messages/${conv.otherUser._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !sendingTo) return;

    try {
      const res = await api.post('/messages', {
        receiverId: sendingTo,
        content: newMessage
      });

      setMessages(prev => [...prev, res.data]);
      
      if (socket) {
        socket.emit('sendMessage', {
          receiverId: sendingTo,
          message: res.data
        });
      }

      setNewMessage('');
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="messages-layout">
      {/* Conversations Sidebar */}
      <div className="conversations-list">
        <h3 style={{ 
          fontFamily: 'var(--font-heading)', 
          padding: '0.75rem 1rem', 
          marginBottom: '0.5rem',
          borderBottom: '1px solid var(--color-border)'
        }}>
          💬 Conversations
        </h3>
        {conversations.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p>No conversations yet</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Start by messaging a farmer from the marketplace!</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.conversationId}
              className={`conversation-item ${sendingTo === conv.otherUser?._id ? 'active' : ''}`}
              onClick={() => selectConversation(conv)}
            >
              <div className="navbar-avatar" style={{ width: 40, height: 40, flexShrink: 0 }}>
                {conv.otherUser?.name?.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{conv.otherUser?.name}</span>
                  {conv.unreadCount > 0 && (
                    <span style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--color-text-muted)', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {conv.lastMessage}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Chat Area */}
      {selectedUser ? (
        <div className="chat-area">
          <div className="chat-header">
            <div className="navbar-avatar" style={{ width: 40, height: 40 }}>
              {selectedUser.name?.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{selectedUser.name}</div>
              <div style={{ fontSize: '0.8rem', color: onlineUsers.includes(selectedUser._id) ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {onlineUsers.includes(selectedUser._id) ? '● Online' : '○ Offline'}
              </div>
            </div>
          </div>

          <div className="chat-messages" id="chat-messages">
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
                <p>Start a conversation with {selectedUser.name}</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg._id}
                  className={`message-bubble ${
                    (msg.sender?._id || msg.sender) === user._id ? 'sent' : 'received'
                  }`}
                >
                  {msg.content}
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              id="message-input"
            />
            <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()} id="send-message-btn">
              <HiOutlinePaperAirplane />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
          <h3 style={{ fontFamily: 'var(--font-heading)' }}>Select a Conversation</h3>
          <p style={{ fontSize: '0.9rem' }}>Choose from the sidebar or message a farmer</p>
        </div>
      )}
    </div>
  );
}
