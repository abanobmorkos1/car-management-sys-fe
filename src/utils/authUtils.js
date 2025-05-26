import { jwtDecode } from 'jwt-decode';

export const refreshAccessToken = async (setToken, setRole, setUser) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!res.ok) return false;

    const { accessToken } = await res.json();
    const decoded = jwtDecode(accessToken);

    // ✅ Save to context
    setToken(accessToken);
    setRole(decoded.role);
    setUser({ _id: decoded.id, name: decoded.name, role: decoded.role });

    return true;
  } catch (err) {
    console.error('❌ Failed to refresh token:', err);
    return false;
  }
};
