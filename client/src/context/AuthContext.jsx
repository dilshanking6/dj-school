import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { notifyTokenChanged } from '../api/socket';

const TOKEN_KEY = 'dj_token';
const USER_KEY = 'dj_user';

export const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const decodeExpiry = (token) => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const expireTimer = useRef(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    // Open socket connection turant band karo, warna stale token se retry hoti rahegi
    notifyTokenChanged();
  }, []);

  const scheduleExpiry = useCallback((token) => {
    if (expireTimer.current) clearTimeout(expireTimer.current);
    const expiresAt = decodeExpiry(token);
    if (!expiresAt) return;
    const delay = expiresAt - Date.now();
    if (delay <= 0) {
      clearSession();
      return;
    }
    expireTimer.current = setTimeout(clearSession, delay);
  }, [clearSession]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = readStoredUser();

    if (token && storedUser) {
      const expiresAt = decodeExpiry(token);
      if (expiresAt && expiresAt > Date.now()) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        setUser(storedUser);
        scheduleExpiry(token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }

    setLoading(false);
    return () => {
      if (expireTimer.current) clearTimeout(expireTimer.current);
    };
  }, [scheduleExpiry]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
          clearSession();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [clearSession]);

  // Socket.IO ne token reject kiya (expired/invalid) — session clear karo.
  useEffect(() => {
    const onSocketAuthFail = () => clearSession();
    window.addEventListener('dj_socket_auth_failed', onSocketAuthFail);
    return () => window.removeEventListener('dj_socket_auth_failed', onSocketAuthFail);
  }, [clearSession]);

  const login = async ({ email, password, role, phone, otp }) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password, role, phone, otp });
      const { token, user: nextUser } = res.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(nextUser);
      scheduleExpiry(token);
      notifyTokenChanged();
      return nextUser;
    } catch (err) {
      // String throw karne se caller ka `err.message` undefined ho jaata tha
      // aur login screen sirf generic "Unable to sign in" dikhati thi — asli
      // server message (galat password, account pending, storage error) kabhi
      // nahi milta tha. Isliye hamesha Error object throw karte hain.
      throw new Error(err?.response?.data?.error || err?.message || 'Unable to sign in right now');
    }
  };

  const requestOtp = async (email, phone) => {
    try {
      const res = await axios.post('/api/auth/otp/request', { email, phone });
      return res.data;
    } catch (err) {
      throw new Error(err?.response?.data?.error || err?.message || 'Unable to send a verification code');
    }
  };

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const updateProfile = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, requestOtp, updateProfile }),
    [user, loading, login, logout, requestOtp, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
