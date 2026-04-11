import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Send, Search, MoreVertical, Phone, Video,
  Loader2, CheckCheck, SmilePlus, Paperclip,
  ArrowLeft, Circle
} from 'lucide-react';

// Format time like WhatsApp: "10:45 AM"
const fmtTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
// Format date for section headers: "Today", "Yesterday", actual date
const fmtDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Group messages by date
const groupByDate = (messages) => {
  const groups = {};
  messages.forEach((msg) => {
    const key = fmtDate(msg.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
  });
  return groups;
};

export default function ChatInterface() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const socketRef = useRef();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Init socket with dynamic import (Vite-compatible)
  useEffect(() => {
    let socket;
    import('socket.io-client').then(({ io }) => {
      socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
      socketRef.current = socket;
    }).catch(() => { /* socket.io-client not available */ });
    return () => { if (socket) socket.disconnect(); };
  }, []);

  // Load conversations
  // Load conversations + auto-open guide from URL state
  useEffect(() => {
    const init = async () => {
      try {
        const res = await chatAPI.getMyChats();
        const convList = res.data;
        setConversations(convList);

        const state = location.state;

        if (state?.guideUserId) {
          // Came from "Message Guide" button — find existing booking chat with this guide
          const existing = convList.find(
            (c) => c.otherParty?.userId === state.guideUserId || c.otherParty?._id === state.guideUserId
          );

          if (existing) {
            // Have a booking with this guide — open that booking chat
            selectChat(existing);
          } else {
            // No booking yet — open a direct chat thread
            const directConv = {
              _id: `direct_${state.guideUserId}`,
              isDirect: true,
              status: 'direct',
              date: '',
              otherParty: {
                _id: state.guideUserId,
                userId: state.guideUserId,
                name: state.guideName || 'Guide',
                avatar: state.guideAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(state.guideName || 'Guide')}&background=3b82f6&color=fff`,
                phone: state.guidePhone || '',
                email: state.guideEmail || '',
              },
            };
            // Add to top of conversations if not there already
            setConversations((prev) => {
              const alreadyHas = prev.find((c) => c._id === directConv._id);
              return alreadyHas ? prev : [directConv, ...prev];
            });
            selectChat(directConv);
          }
        } else if (state?.bookingId) {
          const conv = convList.find((c) => c._id === state.bookingId);
          if (conv) selectChat(conv);
        } else if (convList.length > 0) {
          selectChat(convList[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Socket: listen for incoming messages
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = (msg) => {
      const isForActiveChat = activeChat && (
        (activeChat.isDirect && !msg.booking && (msg.sender === activeChat.otherParty?._id || msg.receiver === activeChat.otherParty?._id))
        || (!activeChat.isDirect && msg.booking === activeChat._id)
      );
      if (isForActiveChat) setMessages((prev) => [...prev, msg]);
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [activeChat]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChat = async (conv) => {
    setActiveChat(conv);
    setSidebarOpen(false);
    if (socketRef.current?.connected && !conv.isDirect) {
      socketRef.current.emit('join_booking', conv._id);
    }
    try {
      let msgs;
      if (conv.isDirect) {
        // Direct chat — load messages between two users (no booking)
        const res = await chatAPI.getDirectMessages(conv.otherParty?.userId || conv.otherParty?._id);
        msgs = res.data;
      } else {
        const res = await chatAPI.getBookingChat(conv._id);
        msgs = res.data;
      }
      setMessages(msgs);
    } catch { setMessages([]); }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat || sending) return;
    setSendError('');

    const receiverId = activeChat.otherParty?.userId || activeChat.otherParty?._id;
    if (!receiverId) {
      setSendError('Cannot send: guide info missing. Please refresh.');
      return;
    }

    setSending(true);
    const msgContent = input.trim();
    setInput('');

    try {
      const bookingId = activeChat.isDirect ? undefined : activeChat._id;
      const res = await chatAPI.sendMessage({ bookingId, receiverId, content: msgContent });
      // Add createdAt if server didn't return it (defensive)
      const newMsg = { ...res.data, createdAt: res.data.createdAt || new Date().toISOString() };
      setMessages((prev) => [...prev, newMsg]);
      if (socketRef.current?.connected) socketRef.current.emit('new_message', newMsg);
    } catch (err) {
      console.error('Send message error:', err);
      setInput(msgContent); // restore input
      setSendError(err?.response?.data?.message || 'Failed to send. Try again.');
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) => {
    const name = c.otherParty?.name || c.otherParty?.user?.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const otherName = activeChat?.otherParty?.name || 'User';
  const otherAvatar = activeChat?.otherParty?.avatar
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=3b82f6&color=fff`;

  const msgGroups = groupByDate(messages);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <Loader2 className="animate-spin text-[var(--color-primary-600)]" size={32} />
    </div>
  );

  return (
    <div className="flex h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/40" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)' }}>
      
      {/* ─── LEFT SIDEBAR ─────────────────────── */}
      <div className={`${sidebarOpen ? 'flex' : 'hidden md:flex'} md:w-80 w-full flex-col border-r border-white/30`} style={{ background: 'rgba(255,255,255,0.7)' }}>
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'rgba(37,99,235,0.96)' }}>
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Me')}&background=fff&color=3b82f6`}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
              alt="me"
            />
            <span className="font-bold text-white text-lg">Messages</span>
          </div>
          <MoreVertical size={20} className="text-white/70 cursor-pointer" />
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 bg-white/70 rounded-full px-4 py-2 border border-slate-200">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-1">Book a guide to start chatting!</p>
            </div>
          ) : filteredConvs.map((conv) => {
            const isActive = activeChat?._id === conv._id;
            const convName = conv.otherParty?.name || 'User';
            const convAvatar = conv.otherParty?.avatar
              || `https://ui-avatars.com/api/?name=${encodeURIComponent(convName)}&background=3b82f6&color=fff`;
            const statusColor = { confirmed: 'bg-green-500', requested: 'bg-amber-400', pending_advance: 'bg-amber-400', pending: 'bg-slate-400', cancelled: 'bg-red-400', completed: 'bg-slate-400' }[conv.status] || 'bg-slate-300';

            return (
              <div
                key={conv._id}
                onClick={() => selectChat(conv)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-100/60 transition-colors ${
                  isActive ? 'bg-[var(--color-primary-50)]' : 'hover:bg-white/60'
                }`}
              >
                {/* Avatar with status dot */}
                <div className="relative shrink-0">
                  <img src={convAvatar} className="w-12 h-12 rounded-full object-cover ring-2 ring-white" alt={convName} />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColor}`} title={conv.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-900 text-sm truncate">{convName}</span>
                    <span className="text-[11px] text-slate-400 shrink-0 ml-2">{conv.date}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate capitalize">
                    {conv.isDirect ? '💬 Direct Message' : `Booking · ${conv.status?.replace(/_/g, ' ')}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── RIGHT: CHAT AREA ─────────────────── */}
      <div className={`${!sidebarOpen || window.innerWidth >= 768 ? 'flex' : 'hidden'} flex-1 flex-col`} style={{ background: 'rgba(248,250,252,0.8)' }}>
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-white/40 shadow-sm" style={{ background: 'rgba(37,99,235,0.96)' }}>
              {/* Back button (mobile) */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-white/80 hover:text-white mr-1"
              >
                <ArrowLeft size={20} />
              </button>

              <img src={otherAvatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/40" alt={otherName} />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base leading-tight">{otherName}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Circle size={8} className={`fill-current ${activeChat.status === 'confirmed' ? 'text-green-400' : 'text-slate-300'}`} />
                  <p className="text-xs text-blue-100 capitalize">{activeChat.status?.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="text-white/80 hover:text-white transition-colors" title="Voice Call">
                  <Phone size={19} />
                </button>
                <button className="text-white/80 hover:text-white transition-colors" title="Video Call">
                  <Video size={19} />
                </button>
                <button className="text-white/80 hover:text-white transition-colors">
                  <MoreVertical size={19} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {messages.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Send size={24} className="text-[var(--color-primary-400)]" />
                  </div>
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm">Say hello to get started!</p>
                </div>
              )}

              {Object.entries(msgGroups).map(([dateLabel, dayMsgs]) => (
                <div key={dateLabel}>
                  {/* Date divider */}
                  <div className="flex items-center justify-center my-4">
                    <span className="bg-white/80 text-slate-500 text-xs px-3 py-1 rounded-full shadow-sm font-medium">
                      {dateLabel}
                    </span>
                  </div>

                  {dayMsgs.map((msg, idx) => {
                    const isMe = msg.sender === user?.id || msg.sender?._id === user?.id;
                    const isSystem = msg.isAutoMsg;
                    
                    if (isSystem) {
                      return (
                        <div key={idx} className="flex justify-center my-3">
                          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm max-w-xs text-center">
                            🤖 {msg.content}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {/* Avatar for other person's messages */}
                        {!isMe && (
                          <img
                            src={otherAvatar}
                            className="w-7 h-7 rounded-full object-cover mr-2 self-end mb-1 shrink-0"
                            alt={otherName}
                          />
                        )}

                        <div className={`max-w-[72%] group`}>
                          <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            isMe
                              ? 'bg-[var(--color-primary-600)] text-white rounded-br-sm'
                              : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
                          }`}>
                            <p>{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 justify-end ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                              <span className="text-[10px]">{fmtTime(msg.createdAt)}</span>
                              {isMe && <CheckCheck size={12} className="text-blue-200" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="px-4 py-3 border-t border-white/30" style={{ background: 'rgba(255,255,255,0.85)' }}>
              {sendError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-2 font-medium">
                  ⚠️ {sendError}
                </div>
              )}
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors p-2">
                  <SmilePlus size={22} />
                </button>
                <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors p-2">
                  <Paperclip size={22} />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); if (sendError) setSendError(''); }}
                  placeholder="Type a message..."
                  className="flex-1 px-5 py-3 rounded-full bg-white border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[var(--color-primary-300)] placeholder-slate-400 transition-shadow"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 rounded-full bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-500)] flex items-center justify-center text-white transition-all disabled:opacity-50 shadow-md hover:scale-105 active:scale-95"
                >
                  {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No chat selected */
          <div className="flex-1 flex flex-col items-center justify-center" style={{ background: 'rgba(248,250,252,0.5)' }}>
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-5 ring-8 ring-blue-50/50">
              <Send size={40} className="text-[var(--color-primary-400)]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Your Messages</h3>
            <p className="text-slate-500 text-center max-w-xs">Select a conversation from the left, or book a guide to start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
}
