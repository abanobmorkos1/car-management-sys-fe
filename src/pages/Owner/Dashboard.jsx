import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Divider, Paper, TextField
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContext } from '../../contexts/AuthContext';
import Topbar from '../../components/Topbar';
import { fetchWithToken } from '../../utils/fetchWithToken';


const api = process.env.REACT_APP_API_URL;


const OwnerDashboard = () => {
  const { token } = useContext(AuthContext);

  const [stats, setStats] = useState({
    deliveriesToday: 0,
    deliveriesWeek: 0,
    deliveriesMonth: 0,
    deliveriesYear: 0,
    codToday: 0,
    codWeek: 0,
    codMonth: 0,
    codYear: 0,
    topDrivers: [],
    topSalespeople: []
  });

  const [dateRange, setDateRange] = useState([null, null]);
  const [clockSessions, setClockSessions] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('all');

  const fetchOwnerStats = async (startDate, endDate) => {
  try {
    let url = `${api}/api/owner/stats`;
    if (startDate && endDate) {
      const from = startDate.toISOString();
      const to = endDate.toISOString();
      url += `?from=${from}&to=${to}`;
    }
    const data = await fetchWithToken(url, token); // ✅ no extra .json()
    console.log('📊 Owner Stats:', data);
    setStats(data);
  } catch (err) {
    console.error('Failed to fetch owner stats');
  }
};

  const fetchClockSessions = async () => {
    try {
      const res = await fetchWithToken(`${api}/api/hours/today-sessions`, token);
      const data = await res.json();
      console.log('🕒 Clock Sessions:', data);
      setClockSessions(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
    }
  };

useEffect(() => {
  fetchOwnerStats();
  fetchClockSessions();
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

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box mb={4}>
              <DateRangePicker
                value={dateRange}
                onChange={(newRange) => {
                  setDateRange(newRange);
                  const [start, end] = newRange;
                  if (start && end) {
                    fetchOwnerStats(start.toDate(), end.toDate());
                  }
                }}
                calendars={1}
                disableFuture
                localeText={{ start: 'Start Date', end: 'End Date' }}
                slotProps={{
                  textField: { size: 'small' },
                  fieldSeparator: { children: 'to' }
                }}
                sx={{ width: '100%' }}
              />
            </Box>
          </LocalizationProvider>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Deliveries Today" value={stats.deliveriesToday ?? 0} color="#007bff" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Deliveries This Week" value={stats.deliveriesWeek ?? 0} color="#17a2b8" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Deliveries This Month" value={stats.deliveriesMonth ?? 0} color="#28a745" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="Deliveries This Year" value={stats.deliveriesYear ?? 0} color="#ffc107" />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="COD Today" value={`$${(stats.codToday ?? 0).toFixed(2)}`} color="#fd7e14" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="COD This Week" value={`$${(stats.codWeek ?? 0).toFixed(2)}`} color="#20c997" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="COD This Month" value={`$${(stats.codMonth ?? 0).toFixed(2)}`} color="#6610f2" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="COD This Year" value={`$${(stats.codYear ?? 0).toFixed(2)}`} color="#e83e8c" />
            </Grid>
          </Grid>

          <Grid container spacing={3} mt={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" mb={1}>🏅 Top Performing Drivers</Typography>
                <Divider sx={{ mb: 2 }} />
                {Array.isArray(stats.topDrivers) && stats.topDrivers.length > 0 ? (
                  stats.topDrivers.map((d, i) => (
                    <Typography key={i}>
                      {i + 1}. {d.name} – {d.totalDeliveries} deliveries
                    </Typography>
                  ))
                ) : (
                  <>
                    {console.log('📭 No drivers to show:', stats.topDrivers)}
                    <Typography>No data available.</Typography>
                  </>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" mb={1}>💼 Top Performing Salespeople</Typography>
                <Divider sx={{ mb: 2 }} />
                {Array.isArray(stats.topSalespeople) && stats.topSalespeople.length > 0 ? (
                  stats.topSalespeople.map((s, i) => (
                    <Typography key={i}>
                      {i + 1}. {s.name} – ${s.totalCOD.toFixed(2)}
                    </Typography>
                  ))
                ) : (
                  <>
                    {console.log('📭 No salespeople to show:', stats.topSalespeople)}
                    <Typography>No data available.</Typography>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
          <Grid container spacing={3} mt={4}>
  <Grid item xs={12}>
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Box mb={2}>
  <TextField
    select
    fullWidth
    size="small"
    label="Filter by Driver"
    value={selectedDriverId}
    onChange={(e) => setSelectedDriverId(e.target.value)}
    SelectProps={{ native: true }}
  >
    <option value="all">All Drivers</option>
    {clockSessions.map((driver) => (
      <option key={driver.driver._id} value={driver.driver._id}>
        {driver.driver.name}
      </option>
    ))}
  </TextField>
</Box>

      <Typography variant="h6" gutterBottom>
        🕒 Today's Clock-In Sessions
      </Typography>

          {clockSessions.length === 0 ? (
            <Typography>No sessions recorded today.</Typography>
          ) : (
            clockSessions
              .filter((driver) =>
                selectedDriverId === 'all' ? true : driver.driver._id === selectedDriverId
              )
              .map((driver, index) =>
                driver?.driver ? (
                  <Box
                    key={driver.driver._id || index}
                    mb={2}
                    p={2}
                    border="1px solid #ccc"
                    borderRadius={2}
                    bgcolor="#f9f9f9"
                  >
                    <Typography fontWeight="bold">{driver.driver.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Hours: {(driver.totalHours ?? 0).toFixed(2)} hrs
                    </Typography>

                    {Array.isArray(driver.sessions) && driver.sessions.length > 0 ? (
                      driver.sessions.map((sesh, idx) => (
                        <Box key={idx} ml={1} mt={1}>
                          <Typography variant="body2">
                            {new Date(sesh.clockIn).toLocaleTimeString()} –{' '}
                            {sesh.clockOut
                              ? new Date(sesh.clockOut).toLocaleTimeString()
                              : 'In progress'}{' '}
                            ({(sesh.totalHours ?? 0).toFixed(2)} hrs)
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" ml={1}>
                        No sessions recorded.
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography key={index} color="error">
                    ⚠️ Invalid driver data
                  </Typography>
                )
              )
          )}
    </Paper>
  </Grid>
</Grid>
  </Container>
</Box>
  </>
  );
};

export default OwnerDashboard;
