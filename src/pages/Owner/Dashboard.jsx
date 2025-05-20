import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, Divider, Paper, TextField
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
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
      console.error('Failed to fetch owner stats', err);
    }
  };

  useEffect(() => {
    fetchOwnerStats();
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
                {stats.topDrivers.length === 0 ? (
                  <Typography>No data available.</Typography>
                ) : (
                  stats.topDrivers.map((d, i) => (
                    <Typography key={i}>
                      {i + 1}. {d.name} – {d.totalDeliveries} deliveries
                    </Typography>
                  ))
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" mb={1}>💼 Top Performing Salespeople</Typography>
                <Divider sx={{ mb: 2 }} />
                {stats.topSalespeople.length === 0 ? (
                  <Typography>No data available.</Typography>
                ) : (
                  stats.topSalespeople.map((s, i) => (
                    <Typography key={i}>
                      {i + 1}. {s.name} – ${s.totalCOD.toFixed(2)}
                    </Typography>
                  ))
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
