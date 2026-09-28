import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Hash, Users, MessageSquare, Plus, Search, Loader2, User, Trash2, X, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { connectSocket } from '../api/socket';
import { toast } from 'react-hot-toast';

const STAFF = ['teacher', 'principal', 'admin'];

const input = 'w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-base outline-none focus:border-primary/50 transition-colors placeholder:text-slate-500';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [directory, setDirectory] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [listVisible, setListVisible] = useState(true);

  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const activeRoomRef = useRef(null);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
        const [roomsRes, directoryRes] = await Promise.allSettled([
          axios.get('/api/chatrooms'),
          axios.get('/api/chatrooms/directory')
        ]);
        if (cancelled) return;

        if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value.data);
        else toast.error('Could not load your chats');

        if (directoryRes.status === 'fulfilled') setDirectory(directoryRes.value.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return undefined;

    socketRef.current = socket;

    socket.on('receive_message', (message) => {
      const room = activeRoomRef.current;
      if (room && message.roomId === room.id) {
        setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      }
    });

    socket.on('message_deleted', ({ id }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });

    socket.on('room_error', ({ error }) => toast.error(error));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setListVisible(false);

    const open = async () => {
      try {
        if (!activeRoom.joined) await axios.post(`/api/chatrooms/${activeRoom.id}/join`);
        const res = await axios.get(`/api/messages/${activeRoom.id}`);
        if (cancelled) return;
        setMessages(Array.isArray(res.data) ? res.data : []);
        socketRef.current?.emit('join_room', activeRoom.id);
        setRooms((prev) => prev.map((r) => (r.id === activeRoom.id ? { ...r, joined: true } : r)));
      } catch (err) {
        if (cancelled) return;
        toast.error(err.response?.data?.error || 'Could not open this chat');
        setActiveRoom(null);
      }
    };

    open();
    return () => {
      cancelled = true;
      if (activeRoom) socketRef.current?.emit('leave_room', activeRoom.id);
    };
  }, [activeRoom]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = newMessage.trim();
    if (!content || !activeRoom) return;

    setSending(true);
    try {
      await axios.post('/api/messages', { roomId: activeRoom.id, content });
      setNewMessage('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Message could not be sent');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/messages/${messageId}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success('Message deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Message could not be deleted');
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await axios.delete(`/api/chatrooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      if (activeRoom?.id === roomId) setActiveRoom(null);
      toast.success('Chat removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Chat could not be removed');
    }
  };

  const startPrivateChat = async (target) => {
    const loadingToast = toast.loading(`Opening chat with ${target.name}`);
    try {
      const res = await axios.post('/api/chatrooms', {
        name: target.name,
        type: 'private',
        targetUserId: target.id
      });
      const room = res.data.room;
      setRooms((prev) => (prev.some((r) => r.id === room.id) ? prev : [room, ...prev]));
      setActiveRoom({ ...room, joined: true });
      setShowUserSearch(false);
      toast.success('Chat opened', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Chat could not be created', { id: loadingToast });
    }
  };

  const createGroup = async (event) => {
    event.preventDefault();
    const name = groupName.trim();
    if (!name) return;

    const loadingToast = toast.loading('Creating channel');
    try {
      const res = await axios.post('/api/chatrooms', {
        name,
        type: 'public',
        className: user.class && user.class !== 'N/A' ? user.class : 'All'
      });
      const room = res.data.room;
      setRooms((prev) => [room, ...prev]);
      setActiveRoom({ ...room, joined: true });
      setGroupName('');
      setShowGroupCreate(false);
      toast.success('Channel created', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Channel could not be created', { id: loadingToast });
    }
  };

  const term = searchTerm.trim().toLowerCase();
  const filteredDirectory = directory.filter((person) =>
    !term ||
    person.name.toLowerCase().includes(term) ||
    person.role.includes(term) ||
    String(person.class).toLowerCase().includes(term) ||
    person.subject.toLowerCase().includes(term)
  );

  const canDeleteRoom = (room) => user?.role === 'admin' || room.createdBy === user?.id;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-background lg:h-[calc(100dvh-5rem)] lg:flex-row">
      <aside
        className={`${listVisible ? 'flex' : 'hidden'} w-full shrink-0 flex-col border-white/5 glass-effect lg:flex lg:w-80 xl:w-96 lg:border-r`}
      >
        <div className="border-b border-white/5 p-5">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-xl font-black sm:text-2xl">Messages</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUserSearch(true)}
                className="rounded-xl bg-primary/10 p-2.5 text-primary transition-colors hover:bg-primary hover:text-white"
                aria-label="Find people"
              >
                <Search size={18} />
              </button>
              {STAFF.includes(user?.role) && (
                <button
                  onClick={() => setShowGroupCreate(true)}
                  className="rounded-xl bg-accent/10 p-2.5 text-accent transition-colors hover:bg-accent hover:text-white"
                  aria-label="Create channel"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              type="search"
              placeholder="Search your chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${input} pl-11`}
            />
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : rooms.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No chats yet. Find a classmate or teacher to begin.
            </p>
          ) : (
            rooms.map((room) => {
              const isActive = activeRoom?.id === room.id;
              return (
                <div
                  key={room.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                    isActive ? 'border-primary bg-primary/15' : 'border-transparent bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <button onClick={() => setActiveRoom(room)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        isActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {room.type === 'private' ? <User size={20} /> : <Hash size={20} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{room.name}</span>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                        {room.type} · {room.members} members
                      </span>
                    </span>
                  </button>
                  {canDeleteRoom(room) && (
                    <button
                      onClick={() => deleteRoom(room.id)}
                      className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                      aria-label={`Delete ${room.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      <section className={`${listVisible ? 'hidden' : 'flex'} min-w-0 flex-1 flex-col bg-background/50 lg:flex`}>
        {activeRoom ? (
          <>
            <header className="flex items-center gap-3 border-b border-white/5 glass-effect px-4 py-3.5">
              <button
                onClick={() => setListVisible(true)}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Back to chats"
              >
                <ArrowLeft size={20} />
              </button>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Users size={19} />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-bold">{activeRoom.name}</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  {activeRoom.type} · {activeRoom.members} members
                </p>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
              {messages.length === 0 ? (
                <p className="py-16 text-center text-sm text-slate-500">
                  No messages in this chat yet.
                </p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMe && (
                          <p className="mb-1 ml-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                            {msg.senderName || 'Member'} · {msg.senderRole}
                          </p>
                        )}
                        <div
                          className={`group/msg flex items-start gap-2 rounded-3xl px-4 py-3 ${
                            isMe
                              ? 'rounded-br-md bg-primary text-white'
                              : 'rounded-bl-md border border-white/10 bg-white/5 text-slate-200'
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">{msg.content || msg.message}</p>
                          {(isMe || user?.role === 'admin') && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-black/10 group-hover/msg:opacity-100"
                              aria-label="Delete message"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>

            <div className="glass-effect border-t border-white/5 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
              <form onSubmit={sendMessage} className="flex items-center gap-2 rounded-[2rem] border border-white/10 bg-white/5 p-2 pl-4 transition-colors focus-within:border-primary/50">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a message"
                  disabled={sending}
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform active:scale-95 disabled:opacity-40"
                  aria-label="Send message"
                >
                  {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={17} className="ml-0.5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="mb-7 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary/10 text-primary">
              <MessageSquare size={44} />
            </span>
            <h2 className="mb-3 text-2xl font-black sm:text-3xl">Your school conversations</h2>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500">
              Message teachers and classmates, or open a class channel from the list.
            </p>
            <button
              onClick={() => setShowUserSearch(true)}
              className="mt-8 flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-sm font-bold text-white transition-transform active:scale-95"
            >
              <Search size={17} />
              Find people
            </button>
          </div>
        )}

        <AnimatePresence>
          {showUserSearch && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/85 p-0 backdrop-blur-md sm:items-center sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                className="glass-effect max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl border border-white/10 p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-7"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-black">Find people</h2>
                  <button
                    onClick={() => setShowUserSearch(false)}
                    className="rounded-xl p-2 transition-colors hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="relative mb-5">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="search"
                    placeholder="Search by name, role, class or subject"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${input} pl-12`}
                  />
                </div>

                <div className="space-y-2">
                  {filteredDirectory.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => startPrivateChat(person)}
                      className="flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-3.5 text-left transition-colors hover:border-primary/30 hover:bg-white/10"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <User size={20} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-bold">{person.name}</span>
                        <span className="block truncate text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                          {person.role}
                          {person.class ? ` · class ${person.class}` : ''}
                          {person.subject ? ` · ${person.subject}` : ''}
                        </span>
                      </span>
                    </button>
                  ))}
                  {filteredDirectory.length === 0 && (
                    <p className="py-10 text-center text-sm text-slate-500">No one matches that search.</p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showGroupCreate && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/85 p-0 backdrop-blur-md sm:items-center sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                className="glass-effect w-full rounded-t-3xl border border-white/10 p-6 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-7"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-black">Create channel</h2>
                  <button
                    onClick={() => setShowGroupCreate(false)}
                    className="rounded-xl p-2 transition-colors hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={createGroup} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                      Channel name
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Science · Class 10"
                      className={input}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-sm font-bold text-white transition-transform active:scale-[0.99]"
                  >
                    <Users size={18} />
                    Create channel
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default ChatPage;
