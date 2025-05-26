const api = process.env.REACT_APP_API_URL;

const fetchWithSession = async (url, options = {}) => {
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
  
};

export const fetchTodayDeliveries = async () => {
  return await fetchWithSession(`${api}/api/delivery/deliveries`);
};

export const fetchDrivers = async () => {
  return await fetchWithSession(`${api}/api/users/drivers`);
};

export const fetchClockSessions = async (date) => {
  const isoDate = new Date(date).toISOString().split('T')[0];
  return await fetchWithSession(`${api}/api/hours/manager-owner/sessions-by-date?date=${isoDate}`);
};

export const assignDriverToDelivery = async (deliveryId, driverId) => {
  return await fetchWithSession(`${api}/api/delivery/assign-driver/${deliveryId}`, {
    method: 'PUT',
    body: JSON.stringify({ driverId })
  });
};

export const approveClockIn = async (sessionId) => {
  return await fetchWithSession(`${api}/api/hours/manager-owner/approve/${sessionId}`, {
    method: 'PATCH'
  });
};

export const rejectClockIn = async (sessionId) => {
  return await fetchWithSession(`${api}/api/hours/manager-owner/reject/${sessionId}`, {
    method: 'PATCH'
  });
};
