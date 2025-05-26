let getToken = () => null;
let setToken = () => null;

/**
 * Call this once inside a component (like TokenBridge.jsx) to register access
 * to the current token and updater function from context.
 */
export const registerTokenHandler = (getTokenFn, setTokenFn) => {
  getToken = getTokenFn;
  setToken = setTokenFn;
};

export const fetchWithToken = async (url, options = {}) => {
  const accessToken = getToken();

  const makeRequest = async (tokenToUse) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${tokenToUse}`,
      },
      credentials: 'include', // important for session cookies
    });

    if (res.status === 401) throw new Error('401 Unauthorized');

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    return res.json();
  };

  try {
    return await makeRequest(accessToken);
  } catch (err) {
    if (err.message === '401 Unauthorized') {
      console.warn('🔁 Token expired, trying refresh...');

      try {
        const refreshRes = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/refresh-token`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshRes.ok) throw new Error('Refresh failed');

        const { accessToken: newToken } = await refreshRes.json();
        setToken(newToken);
        return await makeRequest(newToken);
      } catch (refreshErr) {
        console.error('❌ Token refresh failed:', refreshErr);
        throw new Error('Session expired. Please login again.');
      }
    }

    throw err;
  }
};
