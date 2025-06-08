const api = process.env.REACT_APP_API_URL;

const fetchWithSession = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || 'Request failed');
    }

    return await res.json();
  } catch (err) {
    console.error(`❌ Error fetching ${url}:`, err.message);
    return null;
  }
};

export const fetchTodayDeliveries = async () => {
  let url = `${api}/api/delivery/deliveries`;
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  to.setHours(23, 59, 59, 999);
  url += `?start=${from.toISOString()}&end=${to.toISOString()}`;

  const data = await fetchWithSession(url);
  if (!Array.isArray(data)) return [];

  return data;
};

export const fetchDriverStatus = async () => {
  return await fetchWithSession(`${api}/api/hours/driver/status`);
};

export const requestClockIn = async () => {
  const res = await fetch(`${api}/api/hours/driver/clock-in-request`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const clockOut = async () => {
  return await fetchWithSession(`${api}/api/hours/driver/clock-out`, {
    method: 'POST',
  });
};

export const fetchWeeklyEarnings = async () => {
  const lastFriday = new Date();
  lastFriday.setDate(lastFriday.getDate() - ((lastFriday.getDay() + 2) % 7));
  lastFriday.setHours(0, 0, 0, 0);
  const lastFridayISO = lastFriday.toISOString();
  const res = await fetchWithSession(
    `${api}/api/hours/driver/weekly-earnings?startDate=${lastFridayISO}&timeZone=${
      Intl.DateTimeFormat().resolvedOptions().timeZone
    }`
  );
  return res || { totalHours: 0, bonus: 0, totalEarnings: 0 };
};

export const fetchWeeklyBreakdown = async () => {
  const lastFriday = new Date();
  lastFriday.setDate(lastFriday.getDate() - ((lastFriday.getDay() + 2) % 7));
  lastFriday.setHours(0, 0, 0, 0);
  const lastFridayISO = lastFriday.toISOString();
  const res = await fetchWithSession(
    `${api}/api/hours/driver/weekly-breakdown?startDate=${lastFridayISO}&timeZone=${
      Intl.DateTimeFormat().resolvedOptions().timeZone
    }`
  );
  return Array.isArray(res) ? res : [];
};

export async function fetchBonusCounts() {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/bonus/uploads`,
    {
      credentials: 'include',
    }
  );
  if (!res.ok) throw new Error('Failed to fetch bonus counts');
  return await res.json(); // Expected format: { review: number, customer: number }
}
