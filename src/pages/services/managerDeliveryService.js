const api = process.env.REACT_APP_API_URL;

const fetchWithSession = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

export const fetchTodayDeliveries = async () => {
  let url = `${api}/api/delivery/deliveries`;
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  to.setHours(23, 59, 59, 999);
  url += `?start=${from.toISOString()}&end=${to.toISOString()}`;

  return await fetchWithSession(url);
};

export const fetchDrivers = async () => {
  return await fetchWithSession(`${api}/api/users/drivers`);
};

export const fetchClockSessions = async (date) => {
  const lastFriday = new Date();
  const today = new Date().toISOString();
  lastFriday.setDate(lastFriday.getDate() - ((lastFriday.getDay() + 2) % 7));
  lastFriday.setHours(0, 0, 0, 0);
  const lastFridayISO = lastFriday.toISOString();
  return await fetchWithSession(
    `${api}/api/hours/manager-owner/sessions-by-date?today=${today}&weekStart=${lastFridayISO}`
  );
};

export const assignDriverToDelivery = async (deliveryId, driverId) => {
  return await fetchWithSession(
    `${api}/api/delivery/assign-driver/${deliveryId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ driverId }),
    }
  );
};

export const approveClockIn = async (sessionId) => {
  return await fetchWithSession(
    `${api}/api/hours/manager-owner/approve/${sessionId}`,
    {
      method: 'PATCH',
    }
  );
};

export const rejectClockIn = async (sessionId) => {
  return await fetchWithSession(
    `${api}/api/hours/manager-owner/reject/${sessionId}`,
    {
      method: 'PATCH',
    }
  );
};
