import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null); // only used as "logged-in" flag
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Called after login
  const login = (userData) => {
    setToken('session'); // placeholder
    setRole(userData.role);
    setUser(userData);
  };

  const logout = async () => {
    setToken(null);
    setRole(null);
    setUser(null);
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('⚠️ Logout failed:', err);
    }
  };

  // ✅ Called on page reload
// ✅ Called on page reload
const checkSession = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/sessions`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      console.log('🔐 Session data:', data);

      const userData = data.user || data;

      setToken('session');
      setRole(userData.role);
      setUser(userData);
  } catch (err) {
    console.warn('⚠️ No active session:', err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, role, user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
