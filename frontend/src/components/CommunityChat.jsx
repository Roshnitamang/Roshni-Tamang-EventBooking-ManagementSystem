import { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { AppContent } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Hash, MessageSquare, Users, SmilePlus, X, Globe, Loader2, Settings
} from 'lucide-react';

const EMOJI_LIST = ['😀','😂','😍','🔥','👏','🎉','💯','❤️','🙌','🤩','😎','🥳','👍','🚀','✨','💬','🎶','😭','🤔','🙏'];

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const groupMessagesByDate = (messages) => {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    if (date !== lastDate) {
      groups.push({ type: 'divider', label: date, key: `divider-${msg._id}` });
      lastDate = date;
    }
    groups.push({ type: 'message', ...msg, key: msg._id });
  });
  return groups;
};

const getAvatar = (name) => (name ? name.charAt(0).toUpperCase() : '?');
const getColor = (name) => {
  const colors = ['bg-emerald-600','bg-violet-600','bg-blue-600','bg-rose-600','bg-amber-600','bg-cyan-600','bg-fuchsia-600'];
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (name.charCodeAt(i) + h * 31) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
};

const CommunityChat = ({ events = [] }) => {
  const { backendUrl, userData } = useContext(AppContent);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const [showEmoji, setShowEmoji] = useState(false);
  const [room, setRoom] = useState('global');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connected, setConnected] = useState(false);
  const [unreadRooms, setUnreadRooms] = useState({}); // { [roomId]: boolean }

  const socketRef = useRef(null);
  const currentRoomRef = useRef('global');
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeout = useRef(null);

  // Compute room string
  const getCurrentRoom = useCallback((r, ev) => {
    return r === 'global' ? 'global' : `event-${ev?._id}`;
  }, []);

  // ─── Connect socket ONCE ───────────────────────────────────────────────
  useEffect(() => {
    // Guard: don't create a second socket if already exists (React StrictMode)
    if (socketRef.current) return;

    const socket = io(backendUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    // ── KEY FIX 1: Only add message if it belongs to the current room ──
    socket.on('receive_message', (msg) => {
      const incomingRoom = String(msg.room || '');
      const currentRoom = String(currentRoomRef.current || '');
      
      console.log(`[Socket] Message from ${msg.name} in ${incomingRoom} (Local: ${currentRoom})`);

      // If server included room, filter by it
      if (incomingRoom && incomingRoom !== currentRoom) {
        console.log(`[Socket] Marking room "${incomingRoom}" as unread`);
        setUnreadRooms(prev => ({ ...prev, [incomingRoom]: true }));
        return;
      }

      setMessages((prev) => {
        // Replace optimistic message with confirmed one
        if (msg.tempId) {
          const hasOptimistic = prev.find(m => m._id === msg.tempId);
          if (hasOptimistic) {
            return prev.map(m =>
              m._id === msg.tempId ? { ...msg, _id: String(msg._id) } : m
            );
          }
        }
        // Deduplicate by real _id
        if (prev.find(m => m._id === String(msg._id))) return prev;
        return [...prev, { ...msg, _id: String(msg._id) }];
      });
    });

    socket.on('typing', ({ name, userId }) => {
      if (userId === userData?._id) return;
      setTypingUsers((prev) => {
        if (prev.find(u => u.userId === userId)) return prev;
        return [...prev, { name, userId }];
      });
    });

    socket.on('stop_typing', ({ userId }) => {
      setTypingUsers((prev) => prev.filter(u => u.userId !== userId));
    });

    socket.on('room_user_count', (count) => {
      setOnlineCount(count);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [backendUrl]);

  // Join all rooms for notifications
  useEffect(() => {
    if (connected && socketRef.current) {
      socketRef.current.emit('join_room', 'global');
      events.forEach(ev => {
        socketRef.current.emit('join_room', `event-${ev._id}`);
      });
    }
  }, [connected, events]);

  // ─── Join room + load history when room changes ────────────────────────
  useEffect(() => {
    const roomStr = getCurrentRoom(room, selectedEvent);
    currentRoomRef.current = roomStr;

    setMessages([]);
    setTypingUsers([]);
    setLoading(true);

    // Join new socket room
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_room', roomStr);
    }

    // ── KEY FIX 2: Use AbortController so stale fetches don't overwrite current room ──
    const controller = new AbortController();
    const params = {};
    if (room !== 'global' && selectedEvent) params.eventId = selectedEvent._id;

    axios.get(`${backendUrl}/api/messages`, {
      params,
      signal: controller.signal,
    })
      .then(({ data }) => {
        if (data.success) {
          setMessages(data.messages.map(m => ({ ...m, _id: String(m._id) })));
        }
      })
      .catch((err) => {
        if (axios.isCancel(err) || err.name === 'CanceledError') return; // room changed - ignore
        console.error('[Messages] Failed to load history:', err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort(); // cancel if room changes before fetch completes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, selectedEvent]);

  // Auto-scroll to bottom - Targeted to container only
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  // ─── Send message ──────────────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !userData || !socketRef.current?.connected) return;

    const roomStr = currentRoomRef.current;
    const tempId = `temp-${Date.now()}`;

    // Optimistic update: show the message immediately for sender
    const optimisticMsg = {
      _id: tempId,
      userId: userData._id || userData.id,
      name: userData.name,
      message: trimmed,
      room: roomStr,
      eventId: selectedEvent?._id || null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // Emit to server
    socketRef.current.emit('send_message', {
      room: roomStr,
      userId: userData._id || userData.id,
      eventId: selectedEvent?._id || null,
      message: trimmed,
      name: userData.name,
      tempId,
    });

    // Stop typing
    socketRef.current.emit('stop_typing', { room: roomStr, userId: userData._id || userData.id });
    setInput('');
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const roomStr = currentRoomRef.current;
    const uid = userData?._id || userData?.id;
    if (!uid) return;
    socketRef.current?.emit('typing', { room: roomStr, name: userData.name, userId: uid });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { room: roomStr, userId: uid });
    }, 2000);
  };

  const handleRoomSelect = (type, event = null) => {
    const newRoomStr = type === 'global' ? 'global' : `event-${event?._id}`;
    setUnreadRooms(prev => ({ ...prev, [newRoomStr]: false }));
    setRoom(type);
    setSelectedEvent(event);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="flex h-[75vh] min-h-[500px] bg-[#1e1f22] rounded-[2rem] overflow-hidden border border-zinc-700/50 shadow-2xl transition-all duration-500">

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 bg-[#2b2d31] flex flex-col border-r border-zinc-700/50 overflow-hidden"
          >
            {/* Server header */}
            <div className="px-4 py-4 border-b border-zinc-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold leading-none">Community</p>
                  <p className="text-zinc-400 text-[10px] mt-0.5">{onlineCount} online</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Channels */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-2 py-2">Text Channels</p>

              <button
                onClick={() => handleRoomSelect('global')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${room === 'global' ? 'bg-zinc-600/60 text-white' : 'text-zinc-400 hover:bg-zinc-700/40 hover:text-zinc-200'}`}
              >
                <div className="relative">
                  <Hash className="w-4 h-4 flex-shrink-0" />
                  {unreadRooms['global'] && (
                    <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#2b2d31] shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
                  )}
                </div>
                <span className="text-sm font-medium truncate">general</span>
                <Globe className="w-3 h-3 ml-auto opacity-50" />
              </button>

              {events.length > 0 && (
                <>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest px-2 pt-4 pb-2">Event Channels</p>
                  {events.map((ev) => (
                    <button
                      key={ev._id}
                      onClick={() => handleRoomSelect('event', ev)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${selectedEvent?._id === ev._id && room === 'event' ? 'bg-zinc-600/60 text-white' : 'text-zinc-400 hover:bg-zinc-700/40 hover:text-zinc-200'}`}
                    >
                      <div className="relative">
                        <Hash className="w-4 h-4 flex-shrink-0" />
                        {unreadRooms[`event-${ev._id}`] && (
                          <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#2b2d31] shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />
                        )}
                      </div>
                      <span className="text-sm font-medium truncate">{ev.title}</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* User panel */}
            <div className="px-3 py-3 border-t border-zinc-700/50 flex items-center gap-2.5 bg-[#232428]">
              <div className={`w-8 h-8 rounded-full ${getColor(userData?.name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {getAvatar(userData?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate">{userData?.name || 'You'}</p>
                <p className={`text-[10px] ${connected ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {connected ? '● Online' : '○ Connecting...'}
                </p>
              </div>
              <Settings className="w-4 h-4 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors flex-shrink-0" />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-zinc-700/50 bg-[#313338] flex-shrink-0 shadow-sm">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-white mr-1">
              <Users className="w-5 h-5" />
            </button>
          )}
          <Hash className="w-5 h-5 text-zinc-400 flex-shrink-0" />
          <span className="text-white font-semibold text-sm truncate">
            {room === 'global' ? 'general' : selectedEvent?.title}
          </span>
          {room !== 'global' && selectedEvent && (
            <span className="hidden sm:block text-zinc-500 text-xs border-l border-zinc-600 ml-2 pl-3 truncate">
              {selectedEvent.category}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2 text-zinc-400">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold">{onlineCount}</span>
          </div>
        </div>

        {/* Messages list */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 bg-[#313338] scroll-smooth"
        >
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 bg-zinc-700/50 rounded-full flex items-center justify-center mb-4">
                <Hash className="w-8 h-8 text-zinc-500" />
              </div>
              <p className="text-white font-bold text-lg">
                Welcome to #{room === 'global' ? 'general' : selectedEvent?.title}!
              </p>
              <p className="text-zinc-400 text-sm mt-1">This is the beginning of the conversation.</p>
            </div>
          ) : (
            grouped.map((item) => {
              if (item.type === 'divider') {
                return (
                  <div key={item.key} className="flex items-center gap-4 py-3">
                    <div className="flex-1 h-px bg-zinc-700/60" />
                    <span className="text-zinc-500 text-[11px] font-semibold whitespace-nowrap">{item.label}</span>
                    <div className="flex-1 h-px bg-zinc-700/60" />
                  </div>
                );
              }

              const isOwn = String(item.userId) === String(userData?._id || userData?.id);
              const isTemp = String(item._id).startsWith('temp-');

              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: isTemp ? 0.7 : 1, y: 0 }}
                  className={`flex items-start gap-3 group px-2 py-1.5 rounded-lg hover:bg-zinc-700/20 transition-colors ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full ${getColor(item.name)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5`}>
                    {getAvatar(item.name)}
                  </div>

                  <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className={`text-[13px] font-semibold ${isOwn ? 'text-emerald-400' : 'text-zinc-200'}`}>
                        {item.name}
                      </span>
                      <span className="text-zinc-500 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words max-w-full ${
                      isOwn
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-[#2b2d31] text-zinc-100 rounded-tl-sm'
                    }`}>
                      {item.message}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-2 py-1"
            >
              <div className="flex gap-1 items-end">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
              <span className="text-zinc-400 text-xs italic">
                {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
              </span>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 bg-[#313338] border-t border-zinc-700/30 flex-shrink-0">

          {/* Connection warning */}
          {!connected && (
            <div className="mb-2 px-4 py-2 bg-amber-900/40 border border-amber-700/40 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting to chat server...
            </div>
          )}

          <div className="flex items-end gap-2 bg-[#383a40] rounded-2xl px-4 py-2">
            {/* Emoji button */}
            <div className="relative">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="text-zinc-400 hover:text-emerald-400 transition-colors p-1 flex-shrink-0 mt-1"
                title="Emoji"
              >
                <SmilePlus className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-12 left-0 bg-[#2b2d31] border border-zinc-700 rounded-2xl p-3 shadow-2xl z-50 grid grid-cols-5 gap-1.5"
                    style={{ width: 200 }}
                  >
                    {EMOJI_LIST.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          setInput(prev => prev + e);
                          setShowEmoji(false);
                          inputRef.current?.focus();
                        }}
                        className="text-xl hover:bg-zinc-700/60 rounded-lg p-1 transition-colors"
                      >
                        {e}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={!connected}
              placeholder={
                connected
                  ? `Message #${room === 'global' ? 'general' : selectedEvent?.title || 'channel'}`
                  : 'Connecting...'
              }
              className="flex-1 bg-transparent resize-none text-zinc-100 placeholder-zinc-500 text-sm outline-none py-1.5 max-h-32 leading-relaxed disabled:opacity-50"
              style={{ minHeight: '36px' }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              className={`p-2 rounded-xl flex-shrink-0 transition-all ${
                input.trim() && connected
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                  : 'text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-zinc-600 text-[10px] text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
