import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Hash, Users, MessageSquare, Paperclip, Plus, Search, Loader2, LogIn } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const socket = io('http://localhost:5000');

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', type: 'public', className: user?.class || 'All' });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/chatrooms?userId=${user.id}&className=${user.class || ''}&role=${user.role}`);
      setRooms(res.data);
      setActiveRoom((current) => current || res.data.find((room) => room.joined) || res.data[0] || null);
    } catch (err) {
      console.error('Rooms load failed', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    if (!roomId) return setMessages([]);
    try {
      const res = await axios.get(`/api/messages/${encodeURIComponent(roomId)}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Messages load failed', err);
    }
  };

  useEffect(() => {
    if (user) loadRooms();
  }, [user?.id]);

  useEffect(() => {
    if (!activeRoom?.id) return;
    socket.emit('join_room', activeRoom.id);
    loadMessages(activeRoom.id);
    const handleReceive = (data) => {
      if ((data.roomId || data.room) === activeRoom.id) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    };
    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
  }, [activeRoom?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinRoom = async (room) => {
    try {
      await axios.post(`/api/chatrooms/${room.id}/join`, { userId: user.id, userName: user.name, role: user.role });
      setActiveRoom({ ...room, joined: true });
      await loadRooms();
    } catch (err) {
      alert('Could not join room');
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/chatrooms', {
        ...roomForm,
        createdBy: user.id,
        createdByName: user.name,
        role: user.role
      });
      setRoomForm({ name: '', type: 'public', className: user?.class || 'All' });
      setShowCreate(false);
      await loadRooms();
      setActiveRoom(res.data.room);
    } catch (err) {
      alert(err.response?.data?.error || 'Room create failed');
    }
  };

  const sendPayload = async (payload) => {
    setSending(true);
    try {
      const res = await axios.post('/api/messages', payload);
      const messageData = { ...payload, id: res.data.id, time: res.data.time };
      socket.emit('send_message', messageData);
      setMessages((prev) => [...prev, messageData]);
    } catch (err) {
      alert('Message send failed');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeRoom?.joined) return;
    await sendPayload({
      roomId: activeRoom.id,
      user: user.name,
      userId: user.id,
      role: user.role,
      content: message.trim(),
      type: 'text'
    });
    setMessage('');
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !activeRoom?.joined) return;
    if (file.size > 350000) {
      alert('Please upload a file smaller than 350 KB for Google Sheets storage.');
      event.target.value = '';
      return;
    }
    const fileData = await fileToDataUrl(file);
    await sendPayload({
      roomId: activeRoom.id,
      user: user.name,
      userId: user.id,
      role: user.role,
      content: file.name,
      type: 'file',
      fileName: file.name,
      fileData
    });
    event.target.value = '';
  };

  const filteredRooms = rooms.filter((room) => room.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-[calc(100vh-80px)] flex bg-white/5 rounded-tl-[3rem] overflow-hidden border-t border-l border-white/5">
      <div className="w-80 border-r border-white/5 flex flex-col bg-background/30 backdrop-blur-xl">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search rooms..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-primary/50 outline-none" />
          </div>
          <button onClick={() => setShowCreate((value) => !value)} className="w-full py-3 bg-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Plus size={16} /> Create Group</button>
          {showCreate && (
            <form onSubmit={createRoom} className="space-y-3">
              <input value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} placeholder="Group name" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm outline-none" required />
              <select value={roomForm.className} onChange={(e) => setRoomForm({ ...roomForm, className: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm outline-none">
                {['All', '9', '10', '11', '12'].map((klass) => <option className="bg-background" key={klass} value={klass}>{klass === 'All' ? 'All Classes' : `Class ${klass}`}</option>)}
              </select>
              <button className="w-full py-2 bg-white/10 rounded-xl text-xs font-bold">Save Group</button>
            </form>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-4 mb-2">Groups</p>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
          ) : filteredRooms.length === 0 ? (
            <p className="px-4 text-sm text-gray-500">No groups yet. Create one to start real chat.</p>
          ) : filteredRooms.map((room) => (
            <button key={room.id} onClick={() => setActiveRoom(room)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${activeRoom?.id === room.id ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
              <div className="flex items-center gap-3">
                <Hash size={18} />
                <div className="text-left">
                  <span className="text-sm font-bold block">{room.name}</span>
                  <span className="text-[10px] text-gray-500">{room.className === 'All' ? 'All classes' : `Class ${room.className}`}</span>
                </div>
              </div>
              <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md">{room.members}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        {!activeRoom ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">Create or select a group.</div>
        ) : (
          <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between glass-effect">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center"><Hash size={24} className="text-primary" /></div>
                <div>
                  <h2 className="text-lg font-bold">{activeRoom.name}</h2>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><Users size={14} /> {activeRoom.members} joined</p>
                </div>
              </div>
              {!activeRoom.joined && (
                <button onClick={() => joinRoom(activeRoom)} className="px-4 py-2 bg-primary rounded-xl text-sm font-bold flex items-center gap-2"><LogIn size={16} /> Join</button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {!activeRoom.joined ? (
                <div className="text-center py-20 text-gray-500">Join this group to see and send messages.</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No messages yet.</div>
              ) : messages.map((msg) => (
                <div key={msg.id || `${msg.time}-${msg.user}`} className="flex gap-4 group">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/5 group-hover:border-primary/30 transition-all">
                    <MessageSquare size={18} className="text-gray-400 group-hover:text-primary transition-all" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{msg.user}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-primary/20 text-primary">{msg.role}</span>
                      <span className="text-[10px] text-gray-500">{msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    {msg.type === 'file' ? (
                      <a href={msg.fileData} download={msg.fileName} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm text-primary hover:bg-primary hover:text-white transition-all">
                        <Paperclip size={16} /> {msg.fileName || msg.content}
                      </a>
                    ) : (
                      <div className="text-sm text-gray-300 leading-relaxed max-w-3xl">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-4 glass-effect p-2 rounded-2xl border border-white/10 group focus-within:border-primary/50 transition-all">
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
                <button type="button" disabled={!activeRoom.joined} onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-40"><Paperclip size={20} /></button>
                <input value={message} onChange={(e) => setMessage(e.target.value)} disabled={!activeRoom.joined} type="text" placeholder={activeRoom.joined ? `Message #${activeRoom.name}` : 'Join group to message'} className="flex-1 bg-transparent border-none outline-none text-sm py-2 disabled:opacity-40" />
                <button disabled={sending || !activeRoom.joined} type="submit" className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-40">
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="text-white" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
