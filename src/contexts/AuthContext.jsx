import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // ✅ named import now

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');

  const login = (token, role) => {
    try {
      const decoded = jwtDecode(token); // ✅ Correct usage
      setToken(token);
      setRole(role);
      setUserName(decoded.name);
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userName', decoded.name);
    } catch (err) {
      console.error('❌ Token decoding failed', err);
    }
  };
  
  const logout = () => {
    setToken(null);
    setRole(null);
    setUserName('');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.name); // restore from token if needed
      } catch (err) {
        console.error('Invalid token');
      }
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, role, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
