// services/ownerDashboardService.js

const api = process.env.REACT_APP_API_URL;
// const fetchWithSession = async (url, options = {}) => {
//   const res = await fetch(url, {
//     ...options,
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//       ...(options.headers || {})
//     }
//   });

//   if (!res.ok) throw new Error(await res.text());
//   return await res.json();

// }; fetchWithSession is not used in this file look at it ... IMPORTANT

// Fetch deliveries in a date range
export const fetchDeliveriesByDate = async (startDate, endDate) => {
  let url = `${api}/api/delivery/deliveries`;

  if (startDate && endDate) {
    const from = new Date(startDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);
    url += `?start=${from.toISOString()}&end=${to.toISOString()}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch deliveries');
  return res.json();
};

// Fetch today's or specific date clock sessions
export const fetchClockSessionsByDate = async () => {
  const lastFriday = new Date();
  const today = new Date().toISOString();
  lastFriday.setDate(lastFriday.getDate() - ((lastFriday.getDay() + 2) % 7));
  lastFriday.setHours(0, 0, 0, 0);
  const lastFridayISO = lastFriday.toISOString();
  const res = await fetch(
    `${api}/api/hours/manager-owner/sessions-by-date?today=${today}&weekStart=${lastFridayISO}`,
    {
      credentials: 'include',
    }
  );

  if (!res.ok) throw new Error('Failed to fetch clock sessions');
  return res.json();
};

// Fetch pending clock-in approvals
export const fetchPendingClockInRequests = async () => {
  const res = await fetch(`${api}/api/hours/manager-owner/pending`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch pending requests');
  return res.json();
};

// Approve or reject a clock-in
export const handleClockApproval = async (id, approve = true) => {
  const res = await fetch(
    `${api}/api/hours/manager-owner/${approve ? 'approve' : 'reject'}/${id}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Request failed');
  }
};
