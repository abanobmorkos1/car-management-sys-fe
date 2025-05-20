// utils/fetchWithToken.js
export const fetchWithToken = async (url, token, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(JSON.parse(options.body)) : undefined
  });

  return res; // return full Response object
};
