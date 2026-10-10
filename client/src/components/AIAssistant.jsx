import React, { useState, useRef, useEffect, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, X, Send, Loader2, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const HIDDEN_ROUTES = ['/login', '/register', '/teacher-login', '/teacher-register', '/principal-login', '/admin-login'];

const SCHOOL = {
  name: 'Janta +2 High School',
  address: 'Bazar Tand Road, Khalari, Jharkhand 829205',
  hours: 'Monday to Saturday, 8:00 AM to 2:30 PM',
  office: 'The school office is open on working days during school hours.'
};

// Backend /api/ai/chat par chala jaata hai — wahan la kidhar deta hai na?
// Nahin. Yahan bhi client-side quick answers rakhe hain taaki API down ho
// to bhi common portal questions ka jawab mil sake.
const quickReplies = (user) => {
  if (!user) {
    return [
      { key: 'address', icon: null, label: 'School address', match: ['address', 'location', 'where', 'kahan'] },
      { key: 'hours', icon: null, label: 'School hours', match: ['hours', 'timing', 'kab', 'time'] },
      { key: 'register', icon: null, label: 'How to register', match: ['register', 'account', 'join', 'admission'] }
    ];
  }
  if (user.role === 'student') {
    return [
      { key: 'attendance', icon: null, label: 'My attendance', match: ['attendance', 'present', 'absent'] },
      { key: 'result', icon: null, label: 'My results', match: ['result', 'marks', 'score', 'exam', 'percentage'] },
      { key: 'homework', icon: null, label: 'My homework', match: ['homework', 'assignment', 'notes', 'material', 'study'] },
      { key: 'event', icon: null, label: 'Upcoming events', match: ['event', 'function', 'sports', 'schedule'] }
    ];
  }
  return [
    { key: 'class', icon: null, label: 'My classes', match: ['class', 'student', 'section'] },
    { key: 'note', icon: null, label: 'Material I shared', match: ['note', 'material', 'homework', 'shared'] },
    { key: 'event', icon: null, label: 'Upcoming events', match: ['event', 'function', 'notice'] },
    { key: 'result', icon: null, label: 'Results overview', match: ['result', 'marks', 'report'] }
  ];
};

const answerFor = (key, user) => {
  if (key === 'address') return `The school is at ${SCHOOL.address}.`;
  if (key === 'hours') return `School runs ${SCHOOL.hours}. ${SCHOOL.office}`;
  if (key === 'register') {
    return user
      ? 'Your account is already active. You can update your details from the Settings page of your portal.'
      : 'Use Create account on this page to register. Students can sign up directly. Teaching staff are added by the school office from the admin portal.';
  }
  if (key === 'attendance') {
    return user
      ? 'Open the Attendance section in your portal to see your record. Your percentage is worked out from the days your teachers have marked.'
      : 'Sign in to view attendance records.';
  }
  if (key === 'result') {
    return user
      ? 'Open the Results section in your portal. Your average is calculated from the subjects your teachers have published.'
      : 'Sign in to view results.';
  }
  if (key === 'homework') {
    return user
      ? 'Open Study Material in your portal. Teachers publish notes and homework there, and new uploads appear as soon as they are posted.'
      : 'Sign in to view study material.';
  }
  if (key === 'event') {
    return user
      ? 'Open the Events section in your portal to see the schedule of functions, sports and examinations.'
      : 'Sign in to view the events schedule.';
  }
  if (key === 'class') return 'Your class details are shown in the Overview section of your portal.';
  if (key === 'note') return 'Open Study Material in your portal to see everything you have shared with students.';
  return null;
};

// API ke liye "thinking" state aur history rasim rakhe.
const AIAssistant = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);

  const replies = quickReplies(user);
  const visible = !HIDDEN_ROUTES.includes(location.pathname);

  useEffect(() => {
    historyRef.current = [];
    setChat([
      {
        role: 'bot',
        content: user
          ? `Hello ${user.name.split(' ')[0]}. I can help you with the portal, your subject chapters, notes and maths questions.`
          : `Hello. I can share details about ${SCHOOL.name}, your portal and also explain class 9-12 chapters and maths.`
      }
    ]);
  }, [user?.id]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [chat]);

  const askBackend = async (message) => {
    const body = { message, history: historyRef.current.slice(-10) };
    const { data } = await axios.post('/api/ai/chat', body);
    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: message },
      { role: 'assistant', content: data.reply }
    ].slice(-12);
    return data.reply;
  };

  const handleSend = async (event) => {
    if (event) event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;

    const next = [...chat, { role: 'user', content: message }];
    setChat([...next, { role: 'bot', content: '', thinking: true }]);
    setInput('');
    setBusy(true);

    try {
      const reply = await askBackend(message);
      setChat((prev) => {
        const copy = prev.slice(0, -1);
        return [...copy, { role: 'bot', content: reply, thinking: false }];
      });
    } catch (err) {
      // Backend unavailable ho to bhi basic portal answers milen:
      // agar error server ki taraf hai to clear hint dikhao.
      const status = err.response?.status;
      const serverMessage = err.response?.data?.error;
      let fallback = answerFor(
        quickReplies(user).find((r) => r.match.some((k) => message.toLowerCase().includes(k)))?.key,
        user
      );
      if (status) {
        fallback =
          (fallback ? fallback + '\n\n' : '') +
          (status === 429
            ? 'Too many messages — wait a minute and try again.'
            : (serverMessage || `The server did not respond (${status}). Please try again shortly.`));
      } else {
        fallback =
          (fallback ? fallback + '\n\n' : '') +
          'Could not reach the server. The backend has to be running for this to work.';
      }
      setChat((prev) => {
        const copy = prev.slice(0, -1);
        return [...copy, { role: 'bot', content: fallback, thinking: false }];
      });
    } finally {
      setBusy(false);
    }
  };

  // Quick-reply buttons bhi backend se jawab lete hain.
  const handleQuick = (key) => {
    const answer = answerFor(key, user);
    if (answer) {
      const label = quickReplies(user).find((r) => r.key === key)?.label || key;
      setChat((prev) => [...prev, { role: 'user', content: label }, { role: 'bot', content: answer }]);
      return;
    }
    handleSend({ preventDefault: () => {} });
  };

  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);

  return (
    <>
      {visible && (
        <button
          onClick={() => setOpen(true)}
          className="fixed z-30 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-2xl shadow-primary/30 transition-transform active:scale-95"
          style={{
            right: 'calc(1rem + var(--safe-right))',
            bottom: 'calc(5.5rem + var(--safe-bottom))',
            width: '3.5rem',
            height: '3.5rem'
          }}
          aria-label="Open help assistant"
        >
          <Sparkles size={22} />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-50 flex flex-col glass-effect border border-white/10 shadow-2xl overflow-hidden"
            style={{
              right: 'calc(0.75rem + var(--safe-right))',
              bottom: 'calc(9.75rem + var(--safe-bottom))',
              left: '0.75rem',
              top: 'calc(4.5rem + var(--safe-top))',
              maxWidth: '24rem',
              marginLeft: 'auto',
              borderRadius: '1.5rem'
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-primary/10 px-4 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <MessageSquare size={18} className="text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white leading-tight">Help Assistant</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Portal guide</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -mr-1 rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close assistant"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
              {chat.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <p
                    className={`whitespace-pre-line max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-primary text-white rounded-2xl rounded-br-md'
                        : 'bg-white/5 text-slate-300 border border-white/5 rounded-2xl rounded-bl-md'
                    }`}
                  >
                    {message.thinking ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> soch raha hoon…
                      </span>
                    ) : (
                      message.content
                    )}
                  </p>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {chat.length === 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {replies.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleQuick(key)}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-primary/40 hover:text-white disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="border-t border-white/5 bg-white/5 p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-background/60 px-3 focus-within:border-primary/50">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Portal, chapter ya maths poochho…"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || busy}
                  className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white transition-opacity disabled:opacity-40 shrink-0"
                  aria-label="Send"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
