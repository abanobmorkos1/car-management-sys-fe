export const fetchWithToken = async (url, token, options = {}) => {
  console.log('🛡️ Sending token:', token); // <--- add this line

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    console.warn(`⚠️ Request to ${url} failed:`, res.status);
  }

  return res.json(); // only if res has a body
};
