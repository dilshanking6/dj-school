import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dj_token');
    const savedUser = localStorage.getItem('dj_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role, phone, otp) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password, role, phone, otp });
      const { token, user } = res.data;
      
      localStorage.setItem('dj_token', token);
      localStorage.setItem('dj_user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (err) {
      throw err.response?.data?.error || err.message;
    }
  };

  const logout = () => {
    localStorage.removeItem('dj_token');
    localStorage.removeItem('dj_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('dj_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
