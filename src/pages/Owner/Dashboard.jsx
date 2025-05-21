// Dashboard.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Paper, Accordion, AccordionSummary, AccordionDetails, TextField, MenuItem, Button , Divider , Stack 
, LinearProgress} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContext } from '../../contexts/AuthContext';
import Topbar from '../../components/Topbar';
import { fetchWithToken } from '../../utils/fetchWithToken';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const api = process.env.REACT_APP_API_URL; 
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const OwnerDashboard = () => {
  const { token } = useContext(AuthContext);

  const [stats, setStats] = useState({
    deliveriesToday: 0, deliveriesWeek: 0, deliveriesMonth: 0, deliveriesYear: 0,
    codToday: 0, codWeek: 0, codMonth: 0, codYear: 0,
    topSalespeople: [],
    codMethodBreakdown: [],
  });

  const [dateRange, setDateRange] = useState([null, null]);
  const [clockSessions, setClockSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('all');
  const [deliveries, setDeliveries] = useState([]);


  const pieData = stats.codMethodBreakdown || [];

  const fetchOwnerStats = async (startDate, endDate) => {
    try {
      let url = `${api}/api/owner/stats`;
      if (startDate && endDate) {
        const from = startDate.toISOString();
        const to = endDate.toISOString();
        url += `?from=${from}&to=${to}`;
      }
      const data = await fetchWithToken(url, token);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch owner stats');
    }
  };

  const fetchClockSessions = async () => {
    try {
      const res = await fetchWithToken(`${api}/api/hours/today-sessions`, token);
      setClockSessions(res);
    } catch (err) {
      console.error('❌ Fetch error:', err);
    }
  };

  const fetchPendingRequests = async () => {
  try {
    const data = await fetchWithToken(`${api}/api/hours/pending`, token);
    setPendingRequests(data);
  } catch (err) {
    console.error('❌ Pending fetch error:', err);
  }
};

const fetchDeliveriesByDate = async (startDate, endDate) => {
  try {
    let url = `${api}/api/delivery/deliveries`;

    if (startDate && endDate) {
      const from = new Date(startDate);
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      url += `?from=${from.toISOString()}&to=${to.toISOString()}`;
    }

    const data = await fetchWithToken(url, token);
    console.log("📦 Deliveries fetched from backend:", data);
    setDeliveries(data);
  } catch (err) {
    console.error('❌ Failed to fetch deliveries by date', err);
  }
};

  const getProgressValue = (status) => {
    switch (status) {
      case 'In route for pick up': return 25;
      case 'Waiting for paperwork': return 50;
      case 'Heading to customer': return 75;
      case 'Delivered': return 100;
      default: return 0;
    }
  };
useEffect(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 🛠 start of day
  const end = new Date(today);
  end.setHours(23, 59, 59, 999); // 🛠 end of day
  fetchDeliveriesByDate(today, end);
}, []);

const handleApproval = async (id, approve = true) => {
  try {
    await fetchWithToken(`${api}/api/hours/${approve ? 'approve' : 'reject'}/${id}`, token, {
      method: 'PUT',
    });
    fetchPendingRequests(); // Refresh the list
  } catch (err) {
    console.error(`❌ ${approve ? 'Approve' : 'Reject'} error:`, err);
  }
};

  useEffect(() => {
    fetchOwnerStats();
    fetchClockSessions();
    fetchPendingRequests();
  }, [token]);

  const StatCard = ({ title, value, color }) => (
    <Card sx={{ borderLeft: `5px solid ${color}`, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" fontWeight="bold">{value}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Topbar />
      <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" mb={3} color="primary.main">
            📊 Owner Dashboard
          </Typography>

          {/* Pending Clock-In Requests Accordion */}
      <Accordion sx={{ mt: 3, borderRadius: 2, boxShadow: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" fontWeight="bold">
          ⏳ Pending Clock-In Requests
        </Typography>
      </AccordionSummary>
          <AccordionDetails>
            {pendingRequests.length === 0 ? (
              <Typography>No pending requests.</Typography>
            ) : (
              pendingRequests.map((req, i) => (
                <Box key={i} mb={2} p={2} bgcolor="#fff" borderRadius={2} border="1px solid #ccc">
                  <Typography><strong>Driver:</strong> {req.driver.name}</Typography>
                  <Typography><strong>Date:</strong> {new Date(req.clockIn).toLocaleDateString()}</Typography>
                  <Typography><strong>Time:</strong> {new Date(req.clockIn).toLocaleTimeString()}</Typography>
                  <Box mt={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleApproval(req._id, true)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleApproval(req._id, false)}
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              ))
            )}
          </AccordionDetails>
        </Accordion>
          
          {/* Delivery + COD Summary with Date Picker */}
<Accordion elevation={3} sx={{ p: 0, borderRadius: 3, mt: 4 }}>
  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 4, py: 3 }}>
    <Typography variant="h5" fontWeight="bold" color="primary.main">
      🚚 Delivery Summary
    </Typography>
  </AccordionSummary>

  <AccordionDetails>
    <Box sx={{ px: 4, pb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateRangePicker
            value={dateRange}
            onChange={(newRange) => {
              setDateRange(newRange);
              const [start, end] = newRange;
              if (start && end) {
                fetchDeliveriesByDate(start.toDate(), end.toDate());
              }
            }}
            calendars={1}
            disableFuture
            localeText={{ start: 'Start Date', end: 'End Date' }}
            slotProps={{
              textField: { size: 'small' },
              fieldSeparator: { children: 'to' },
            }}
          />
        </LocalizationProvider>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box mt={2}>
        {deliveries.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No deliveries found in this date range.
          </Typography>
        ) : (
          deliveries.map((delivery, i) => (
            <Paper
              key={i}
              elevation={2}
              sx={{ mb: 2, px: 3, py: 2, borderRadius: 3, backgroundColor: '#fafafa' }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ md: 'center' }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">Customer</Typography>
                  <Typography fontWeight="bold">{delivery.customerName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Salesperson</Typography>
                  <Typography>{delivery.salesperson?.name || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Delivery Date</Typography>
                  <Typography>{new Date(delivery.deliveryDate).toLocaleDateString()}</Typography>
                </Box>
                <Box>
                  <Typography fontWeight="bold" variant="caption" color="text.secondary">COD</Typography>
                  <Typography fontWeight="bold">${delivery.codAmount}</Typography>
                </Box>
              </Stack>

              {delivery.status && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">Status: {delivery.status}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressValue(delivery.status)}
                    sx={{ mt: 1, height: 10, borderRadius: 5, transition: 'all 0.5s ease' }}
                    color={delivery.status === 'Delivered' ? 'success' : 'primary'}
                  />
                </Box>
              )}
            </Paper>
          ))
        )}
      </Box>
    </Box>
  </AccordionDetails>
</Accordion>

          {/* Clock-in Accordion */}
          <Accordion  sx={{ mt: 5, borderRadius: 2, boxShadow: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight="bold">
                🕒 Clock-In Sessions for {new Date().toLocaleDateString()}
              </Typography>
            </AccordionSummary> 
            <AccordionDetails>
              <Paper sx={{ p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Box mb={2}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Filter by Driver"
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                  >
                    <MenuItem value="all">All Drivers</MenuItem>
                    {clockSessions.map((driver) => (
                      <MenuItem key={driver.driver._id} value={driver.driver._id}>
                        {driver.driver.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {clockSessions.length === 0 ? (
                  <Typography>No sessions recorded today.</Typography>
                ) : (
                  clockSessions
                    .filter(driver => selectedDriverId === 'all' || driver.driver._id === selectedDriverId)
                    .map((driver, index) => (
                      <Box
                        key={driver.driver._id || index}
                        mb={2}
                        p={2}
                        border="1px solid #e0e0e0"
                        borderRadius={2}
                        bgcolor="#ffffff"
                      >
                        <Typography fontWeight="bold" color="primary">
                          {driver.driver.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          Total Hours: {(driver.totalHours ?? 0).toFixed(2)} hrs
                        </Typography>

                        {Array.isArray(driver.sessions) && driver.sessions.length > 0 ? (
                          driver.sessions.map((sesh, idx) => (
                            <Typography key={idx} variant="body2">
                              {new Date(sesh.clockIn).toLocaleTimeString()} –{' '}
                              {sesh.clockOut
                                ? new Date(sesh.clockOut).toLocaleTimeString()
                                : 'In progress'}{' '}
                              ({(sesh.totalHours ?? 0).toFixed(2)} hrs)
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No sessions recorded.
                          </Typography>
                        )}
                      </Box>
                    ))
                )}
              </Paper>
            </AccordionDetails>
          </Accordion>



          <Accordion  sx={{ mt: 5, borderRadius: 2, boxShadow: 2 , "default": false }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" fontWeight="bold">
                💼 Top Performing Salespeople
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={{ p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                {Array.isArray(stats.topSalespeople) && stats.topSalespeople.length > 0 ? (
                  stats.topSalespeople.map((s, i) => (
                    <Box key={i} mb={2}>
                      <Typography fontWeight="bold">
                        {i + 1}. {s.name} – {s.totalDeliveries} deliveries
                      </Typography>
                      {Object.entries(s.carsByMakeModel || {}).map(([makeModel, count], j) => (
                        <Typography key={j} variant="body2" ml={2} color="text.secondary">
                          • {makeModel}: {count}
                        </Typography>
                      ))}
                    </Box>
                  ))
                ) : (
                  <Typography>No data available.</Typography>
                )}
              </Paper>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Box>
    </>
  );
};

export default OwnerDashboard;