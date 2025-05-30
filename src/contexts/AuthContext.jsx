import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/sessions`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Not authenticated');

      const data = await res.json();
      const userData = data.user || data;

      setRole(userData.role);
      setUser(userData);
    } catch (err) {
      // console.warn('⚠️ No active session:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      // ✅ Small delay for session to be fully available
      await new Promise(resolve => setTimeout(resolve, 100));
      await checkSession();

      return { success: true, user: data.user };
    } catch (err) {
      console.error('🔥 Login error:', err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    setRole(null);
    setUser(null);
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.warn('⚠️ Logout failed:', err);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ role, user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
