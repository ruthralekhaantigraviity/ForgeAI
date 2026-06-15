import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const register = async (name, email, password) => {
    await axios.post(`${API_BASE_URL}/api/auth/register`, {
      name,
      email,
      password,
    });
  };

  const loginAsGuest = () => {
    const guestUser = {
      _id: 'guest_001',
      name: 'Guest User',
      email: 'guest@forge.ai',
      role: 'Business User',
      subscription: 'Free',
      credits: 5,
      token: 'guest_token_placeholder'
    };
    setUser(guestUser);
    localStorage.setItem('userInfo', JSON.stringify(guestUser));
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginAsGuest, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
