import { io } from 'socket.io-client';

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

const TOKEN_EVENT = 'dj_token_changed';
const TOKEN_KEY = 'dj_token';
const USER_KEY = 'dj_user';

/**
 * localStorage se current JWT (ya null).
 * AuthContext token `dj_token` me rakhta hai; purane sessions me
 * `dj_user.token` bhi mil sakta hai — dono supported hain.
 */
export const getToken = () => {
  const direct = localStorage.getItem(TOKEN_KEY);
  if (direct) return direct;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')?.token || null;
  } catch {
    return null;
  }
};

if (typeof window !== 'undefined') {
  // Login/logout ke baad listeners dobara connect ho sakein
  window.addEventListener('storage', (e) => {
    if (e.key === TOKEN_KEY || e.key === USER_KEY) window.dispatchEvent(new Event(TOKEN_EVENT));
  });
  window.__djTokenEvent = TOKEN_EVENT;
}

/** Token change hone par callback chalao (AuthContext se integrate hota hai). */
export const onTokenChange = (handler) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(TOKEN_EVENT, handler);
  return () => window.removeEventListener(TOKEN_EVENT, handler);
};

export const notifyTokenChanged = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(TOKEN_EVENT));
};

/**
 * Socket.IO server har connection par JWT verify karta hai,
 * isliye token handshake ke saath bhejna zaroori hai.
 *
 * Io middleware `next(new Error(...))` call karta hai, jo client ko
 * `connect_error` event deta hai (custom `auth_error` nahi). Yahan wahi
 * suna jaata hai — warna invalid token par retry loop chalta rehta tha.
 */
export const connectSocket = (token = getToken()) => {
  if (!token) return null;

  const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnectionAttempts: 5,
    reconnectionDelay: 1200
  });

  const rejectConnection = (err) => {
    const message = err?.message || '';
    // Auth reject hua (Authentication required / Invalid session / legacy token)
    // to retry bekar hai. Kayi baar connect_error network issue hota hai
    // (jhootha "auth" nahi) — us case me reconnection khud handle karo.
    const isAuthFail = /auth|session|token|log ?in/i.test(message);
    if (!isAuthFail) return;

    socket.disconnect();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dj_socket_auth_failed', { detail: message || 'unauthorised' })
      );
    }
  };

  socket.on('connect_error', rejectConnection);

  return socket;
};

export const disconnectSocket = (socket) => {
  if (socket) socket.disconnect();
};

export default { connectSocket, disconnectSocket, getToken, onTokenChange, notifyTokenChanged, SOCKET_URL };
