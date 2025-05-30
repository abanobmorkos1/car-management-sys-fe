export const fetchWithSession = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (err) {
    console.error(`❌ Fetch failed for ${url}:`, err.message);
    return null;
  }
};
