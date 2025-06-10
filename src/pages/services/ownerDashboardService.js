// services/ownerDashboardService.js

const api = process.env.REACT_APP_API_URL;
const itemsPerPage = 4;

// Fetch deliveries in a date range with pagination
export const fetchDeliveriesByDate = async (
  startDate,
  endDate,
  pageNum = 1
) => {
  let url = `${api}/api/delivery/deliveries`;
  const params = new URLSearchParams();

  if (startDate && endDate) {
    const from = new Date(startDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    params.append('start', from.toISOString());
    params.append('end', to.toISOString());
  }

  params.append('page', pageNum.toString());
  params.append('pageSize', itemsPerPage.toString());

  url += '?' + params.toString();

  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch deliveries');
  return res.json();
};

// Fetch today's or specific date clock sessions
export const fetchClockSessionsByDate = async () => {
  let url = `${api}/api/hours/manager-owner/sessions-by-date`;

  const lastFriday = new Date();
  const today = new Date().toISOString();
  lastFriday.setDate(lastFriday.getDate() - ((lastFriday.getDay() + 2) % 7));
  lastFriday.setHours(0, 0, 0, 0);
  const lastFridayISO = lastFriday.toISOString();
  url += `?today=${today}&weekStart=${lastFridayISO}`;

  const res = await fetch(url, {
    credentials: 'include',
  });

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
