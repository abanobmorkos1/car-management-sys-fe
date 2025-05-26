// services/ownerDashboardService.js

const api = process.env.REACT_APP_API_URL;

// Fetch deliveries in a date range
export const fetchDeliveriesByDate = async (startDate, endDate) => {
  let url = `${api}/api/delivery/deliveries`;

  if (startDate && endDate) {
    const from = new Date(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);
    url += `?from=${from.toISOString()}&to=${to.toISOString()}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) throw new Error('Failed to fetch deliveries');
  return res.json();
};

// Fetch today's or specific date clock sessions
export const fetchClockSessionsByDate = async (date) => {
  const isoDate = new Date(date).toISOString().split('T')[0];
  const res = await fetch(`${api}/api/hours/manager-owner/sessions-by-date?date=${isoDate}`, {
    credentials: 'include'
  });

  if (!res.ok) throw new Error('Failed to fetch clock sessions');
  return res.json();
};

// Fetch pending clock-in approvals
export const fetchPendingClockInRequests = async () => {
  const res = await fetch(`${api}/api/hours/manager-owner/pending`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) throw new Error('Failed to fetch pending requests');
  return res.json();
};

// Approve or reject a clock-in
export const handleClockApproval = async (id, approve = true) => {
  const res = await fetch(`${api}/api/hours/manager-owner/${approve ? 'approve' : 'reject'}/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Request failed');
  }
};
