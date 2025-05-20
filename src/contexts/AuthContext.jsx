import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(); // ✅ Named export

export const AuthProvider = ({ children }) => { // ✅ Named export
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [user, setUser] = useState(null);

  const login = (token, role) => {
  if (!token || typeof token !== 'string') {
    console.error('❌ Invalid token passed to login:', token);
    return;
  }

  try {
    const decoded = jwtDecode(token);
    setToken(token);
    setRole(role);
    setUser({ _id: decoded.id, name: decoded.name });
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  } catch (err) {
    console.error('❌ Token decoding failed', err);
  }
};

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.clear();
  };

  useEffect(() => {
  if (!token || typeof token !== 'string') return;

  try {
    const decoded = jwtDecode(token);
    setUser({ _id: decoded.id, name: decoded.name });
  } catch (err) {
    console.error('❌ Invalid token in effect:', err);
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.clear();
  }
}, [token]);

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};