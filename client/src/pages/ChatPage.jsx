import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Hash, Users, MessageSquare, Paperclip, Plus, Search, Loader2, LogIn, User, Trash2, ArrowLeft, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../api/socket';
import { toast } from 'react-hot-toast';

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSaving] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchUserTerm, setSearchUserTerm] = useState('');

  const scrollRef = useRef();

  const loadData = async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const targetUserId = queryParams.get('userId');

      const [roomsRes, usersRes] = await Promise.all([
        axios.get(`/api/chatrooms?userId=${user.id}&className=${user.class}&role=${user.role}`),
        axios.get('/api/school/users')
      ]);
      
      const fetchedRooms = roomsRes.data;
      const fetchedUsers = usersRes.data.filter(u => u.id !== user.id);
      
      setRooms(fetchedRooms);
      setAllUsers(fetchedUsers);

      if (targetUserId) {
        const targetUser = fetchedUsers.find(u => u.id === targetUserId);
        if (targetUser) {
          startPrivateChat(targetUser);
        }
      }
    } catch (err) {
      console.error('Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user?.id]);

  useEffect(() => {
    if (activeRoom) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`/api/messages/${activeRoom.id}`);
          setMessages(res.data);
          socket.emit('join_room', activeRoom.id);
        } catch (err) {
          console.error('Failed to load messages');
        }
      };
      fetchMessages();
    }
  }, [activeRoom]);

  useEffect(() => {
    socket.on('receive_message', (message) => {
      if (activeRoom && message.roomId === activeRoom.id) {
        setMessages((prev) => [...prev, message]);
      }
    });
    return () => socket.off('receive_message');
  }, [activeRoom]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;
    setSaving(true);
    const msgData = {
      roomId: activeRoom.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      message: newMessage,
      type: 'text'
    };
    try {
      await axios.post('/api/messages', msgData);
      socket.emit('send_message', msgData);
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSaving(false);
    }
  };

  const deleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`/api/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const deleteRoom = async (e, roomId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this entire chat?')) return;
    try {
      await axios.delete(`/api/chatrooms/${roomId}`);
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (activeRoom?.id === roomId) setActiveRoom(null);
      toast.success('Chat deleted');
    } catch (err) {
      toast.error('Failed to delete chat');
    }
  };

  const startPrivateChat = async (targetUser) => {
    const loadingToast = toast.loading(`Connecting with ${targetUser.name}...`);
    try {
      const res = await axios.post('/api/chatrooms', {
        name: `Chat with ${targetUser.name}`,
        type: 'private',
        createdBy: user.id,
        createdByName: user.name,
        targetUserId: targetUser.id,
        targetUserName: targetUser.name
      });
      const room = res.data.room;
      setRooms((prev) => {
        if (prev.some(r => r.id === room.id)) return prev;
        return [room, ...prev];
      });
      setActiveRoom(room);
      setShowUserSearch(false);
      toast.success('Connected!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to start chat', { id: loadingToast });
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    const loadingToast = toast.loading('Creating group...');
    try {
      const res = await axios.post('/api/chatrooms', {
        name: groupName,
        type: 'public',
        className: user.class || 'All',
        createdBy: user.id,
        createdByName: user.name
      });
      const room = res.data.room;
      setRooms([room, ...rooms]);
      setActiveRoom(room);
      setGroupName('');
      setShowGroupCreate(false);
      toast.success('Group created!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to create group', { id: loadingToast });
    }
  };

  const joinRoom = async (room) => {
    if (room.joined) {
      setActiveRoom(room);
      return;
    }
    const loadingToast = toast.loading('Joining...');
    try {
      await axios.post(`/api/chatrooms/${room.id}/join`, {
        userId: user.id,
        userName: user.name,
        role: user.role
      });
      setRooms(rooms.map(r => r.id === room.id ? { ...r, joined: true, members: r.members + 1 } : r));
      setActiveRoom({ ...room, joined: true });
      toast.success('Joined successfully!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to join', { id: loadingToast });
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
    String(u.role).toLowerCase().includes(searchUserTerm.toLowerCase()) ||
    String(u.class || '').toLowerCase().includes(searchUserTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background">
      <div className="w-80 md:w-96 border-r border-white/5 flex flex-col glass-effect">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black">Messages</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowUserSearch(true)}
                className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                title="Find People"
              >
                <Search size={20} />
              </button>
              {(user?.role === 'teacher' || user?.role === 'principal' || user?.role === 'admin') && (
                <button 
                  onClick={() => setShowGroupCreate(true)}
                  className="p-2 bg-accent/10 text-accent rounded-xl hover:bg-accent hover:text-white transition-all"
                  title="Create Group"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm font-bold"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : rooms.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">No chats found.</p>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => joinRoom(room)}
                className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all border ${
                  activeRoom?.id === room.id 
                    ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  activeRoom?.id === room.id ? 'bg-white/20' : 'bg-primary/10 text-primary'
                }`}>
                  {room.type === 'private' ? <User size={24} /> : <Hash size={24} />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className={`font-bold truncate ${activeRoom?.id === room.id ? 'text-white' : 'text-gray-200'}`}>{room.name}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${activeRoom?.id === room.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {room.type} • {room.members} members
                  </p>
                </div>
                {(user?.role === 'admin' || room.createdBy === user?.id) && (
                  <button onClick={(e) => deleteRoom(e, room.id)} className={`p-2 rounded-lg transition-all ${activeRoom?.id === room.id ? 'hover:bg-white/20 text-white/50 hover:text-white' : 'hover:bg-rose-500/10 text-gray-600 hover:text-rose-500'}`}><Trash2 size={14} /></button>
                )}
                {!room.joined && (
                  <div className="bg-accent px-2 py-1 rounded-lg text-[8px] font-black uppercase text-white">Join</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative bg-background/50">
        {activeRoom ? (
          <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between glass-effect">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary"><Users size={20} /></div>
                <div>
                  <h2 className="font-bold text-lg">{activeRoom.name}</h2>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    {activeRoom.joined ? 'Connected' : 'Preview Mode'} • {activeRoom.members} members
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`max-w-[70%] ${isMe ? 'order-2' : ''} relative`}>
                      {!isMe && (
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-2">
                          {msg.senderName} • {msg.senderRole}
                        </p>
                      )}
                      <div className={`p-4 rounded-3xl group/msg flex items-start gap-3 ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                      }`}>
                        <p className="text-sm leading-relaxed flex-1">{msg.message}</p>
                        {(isMe || user?.role === 'admin') && (
                          <button onClick={() => deleteMessage(msg.id)} className="opacity-0 group-hover/msg:opacity-100 p-1 hover:bg-black/10 rounded transition-all text-white/50 hover:text-white"><Trash2 size={12} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <div className="p-6 glass-effect">
              <form onSubmit={sendMessage} className="relative flex items-center gap-4 bg-white/5 p-2 pl-6 rounded-[2rem] border border-white/10 focus-within:border-primary/50 transition-all">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={activeRoom.joined ? "Type your message..." : "Join room to send messages"} 
                  disabled={!activeRoom.joined || sending}
                  className="flex-1 bg-transparent outline-none py-3 text-sm font-medium disabled:opacity-50"
                />
                <button 
                  type="submit" 
                  disabled={sending || !activeRoom.joined || !newMessage.trim()}
                  className="w-12 h-12 bg-primary rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin text-white" size={18} /> : <Send size={18} className="text-white ml-0.5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-8 animate-bounce-slow">
              <MessageSquare size={48} />
            </div>
            <h2 className="text-3xl font-black mb-4">Your Digital Campus</h2>
            <p className="text-gray-500 max-w-sm font-bold uppercase text-xs tracking-widest leading-loose">
              Connect with teachers, students, and groups in real-time. Select a chat to start communicating.
            </p>
            <button 
              onClick={() => setShowUserSearch(true)}
              className="mt-10 px-8 py-4 bg-primary rounded-[1.5rem] font-black text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Search size={18} /> Find People
            </button>
          </div>
        )}

        <AnimatePresence>
          {showUserSearch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-effect p-8 rounded-[3rem] border border-white/10 shadow-2xl w-full max-w-lg"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black">Find People</h2>
                  <button onClick={() => setShowUserSearch(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X /></button>
                </div>
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search students or teachers..." 
                    value={searchUserTerm}
                    onChange={(e) => setSearchUserTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary/50 transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredUsers.map(u => (
                    <button 
                      key={u.id}
                      onClick={() => startPrivateChat(u)}
                      className="w-full flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="font-black">{u.name}</p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                          {u.role} {u.class && u.class !== 'N/A' ? `• Class ${u.class}` : ''} {u.subject ? `• ${u.subject}` : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-gray-500 py-10 font-bold uppercase text-[10px] tracking-widest">No users found.</p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showGroupCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-effect p-10 rounded-[3rem] border border-white/10 shadow-2xl w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black">Create New Group</h2>
                  <button onClick={() => setShowGroupCreate(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X /></button>
                </div>
                <form onSubmit={createGroup} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Group Name</label>
                    <input 
                      type="text" 
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Science Class 10th"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 transition-all font-bold"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-4 bg-accent rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent/20"
                  >
                    <Users size={18} /> Create Community Group
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatPage;
