import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [user, setUser] = useState(null); // ✅ full user object

  const login = (token, role) => {
    try {
      const decoded = jwtDecode(token);
      setToken(token);
      setRole(role);
      setUser({ _id: decoded.id, name: decoded.name }); // ✅ decoded ID from JWT
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
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ _id: decoded.id, name: decoded.name }); // ✅ initialize on refresh
      } catch (err) {
        console.error('Invalid token');
      }
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
