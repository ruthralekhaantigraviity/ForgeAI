import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
    const { data } = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password,
    });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('http://localhost:5000/api/auth/register', {
      name,
      email,
      password,
    });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginAsGuest, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
