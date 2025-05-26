export const fetchDeliveriesByDate = async (startDate, endDate) => {
  const api = process.env.REACT_APP_API_URL;
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
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch deliveries');
  return res.json();
};
