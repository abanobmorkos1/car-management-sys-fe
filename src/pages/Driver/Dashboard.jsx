import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Paper, Grid, Card, CardContent,
  Divider, Collapse, MenuItem, Select, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BonusUpload from '../Driver/BonusUpload';
import BonusGallery from '../../components/BonusGallery';
import { AuthContext } from '../../contexts/AuthContext';
import Topbar from '../../components/Topbar';
import { fetchWithToken } from '../../utils/fetchWithToken';

const api = process.env.REACT_APP_API_URL;

const DriverDashboard = () => {
  const { userName, token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showGallery, setShowGallery] = useState(false);
  const [counts, setCounts] = useState({ review: 0, customer: 0 });
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [filter, setFilter] = useState('assigned');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [secondsWorked, setSecondsWorked] = useState(0);
  const [clockInTime, setClockInTime] = useState(null);

useEffect(() => {
  const getClockStatus = async () => {
    try {
      const res = await fetchWithToken(`${api}/api/hours/status`, token);
      setIsClockedIn(res.isClockedIn);
      if (res.clockIn) {
        const clockedDate = new Date(res.clockIn);
        setClockInTime(clockedDate);
      }
    } catch (err) {
      console.error('Failed to fetch clock-in status', err.message);
    }
  };
  if (token) getClockStatus();
}, [token]);

useEffect(() => {
  let interval;
  if (isClockedIn && clockInTime) {
    interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - clockInTime) / 1000); // in seconds
      setSecondsWorked(diff);
    }, 1000);
  }
  return () => clearInterval(interval);
}, [isClockedIn, clockInTime]);

  const fetchDeliveries = useCallback(async () => {
    try {
      const data = await fetchWithToken(`${api}/api/delivery/deliveries`, token);
      const today = new Date().toISOString().split('T')[0];
      const todayDeliveries = data.filter(del =>
        new Date(del.deliveryDate).toISOString().split('T')[0] === today
      );
      setAllDeliveries(todayDeliveries);
    } catch (err) {
      console.error('Error fetching deliveries:', err.message);
    }
  }, [token]);

  const fetchCounts = useCallback(async () => {
    try {
      const uploads = await fetchWithToken(`${api}/api/driver/my-uploads`, token);
      const review = uploads.filter(u => u.type === 'review').length;
      const customer = uploads.filter(u => u.type === 'customer').length;
      setCounts({ review, customer });
    } catch (err) {
      console.error('Error fetching uploads:', err.message);
    }
  }, [token]);

  const fetchWeeklyHours = useCallback(async () => {
    try {
      const data = await fetchWithToken(`${api}/api/hours/weekly-hours`, token);
      setTotalHours(data.totalHours || 0);
    } catch (err) {
      console.error('Error fetching weekly hours:', err.message);
    }
  }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetchWithToken(`${api}/api/delivery/delivery/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      fetchDeliveries();
    } catch (err) {
      console.error('Failed to update status', err.message);
    }
  };

  const handleClockInOut = async () => {
    try {
      const endpoint = isClockedIn ? 'clock-out' : 'clock-in';
      await fetchWithToken(`${api}/api/hours/${endpoint}`, token, { method: 'POST' });

      const newStatus = !isClockedIn;
      setIsClockedIn(newStatus);

      if (!newStatus) {
        setSecondsWorked(0);
        localStorage.removeItem('secondsWorked');
      } else {
        localStorage.setItem('secondsWorked', 0);
      }

      localStorage.setItem('isClockedIn', newStatus);
      fetchWeeklyHours();
    } catch (err) {
      console.error('Clock in/out error:', err.message);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchCounts();
    fetchDeliveries();
    fetchWeeklyHours();
  }, [fetchCounts, fetchDeliveries, fetchWeeklyHours, token]);

  const filteredDeliveries = allDeliveries.filter(del =>
    filter === 'assigned' ? del.driver?._id === user?._id : true
  );

  return (
    <>
      <Topbar />
      <Box sx={{ backgroundColor: '#e9eff6', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" color="primary.main" mb={3}>
            Welcome, {userName || 'Driver'} 👋
          </Typography>

          <Button
            variant="contained"
            onClick={handleClockInOut}
            fullWidth
            sx={{
              mb: 3,
              py: 1,
              fontSize: '0.9rem',
              backgroundColor: isClockedIn ? 'error.main' : 'blue',
              '&:hover': {
                backgroundColor: isClockedIn ? 'error.dark' : 'primary.dark',
              }
            }}
          >
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </Button>

          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Today's Deliveries ({filteredDeliveries.length})
            </Typography>

            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(e, val) => val && setFilter(val)}
              sx={{ mb: 2 }}
              fullWidth
            >
              <ToggleButton value="assigned">Assigned</ToggleButton>
              <ToggleButton value="all">All</ToggleButton>
            </ToggleButtonGroup>

            {filteredDeliveries.length === 0 ? (
              <Typography>No deliveries found for this filter.</Typography>
            ) : (
              filteredDeliveries.map((d) => (
                <Box key={d._id} mb={2} p={2} border="1px solid #ccc" borderRadius={2} bgcolor="#fff" boxShadow={1}>
                  <Typography fontWeight="bold">{d.customerName}</Typography>
                  <Typography variant="body2">📞 {d.phoneNumber}</Typography>
                  <Typography variant="body2">📍 {d.address}</Typography>
                  <Typography variant="body2">🚗 {d.pickupFrom}</Typography>
                  <Typography variant="body2">🕒 {new Date(d.deliveryDate).toLocaleString()}</Typography>
                  <Typography variant="body2">
                    💵 COD: ${d.codAmount} {d.codCollected ? `(via ${d.codMethod})` : '(Pending)'}
                  </Typography>
                  <Typography variant="body2">
                    🚘 {d.year} {d.make} {d.model} {d.trim} - {d.color}
                  </Typography>
                  {d.notes && <Typography variant="body2">📝 {d.notes}</Typography>}

                  <Box mt={1}>
                    <Typography variant="body2">Status:</Typography>
                    {d.driver?._id === user?._id ? (
                      <>
                        <Select
                          size="small"
                          value={d.status || 'In route for pick up'}
                          onChange={(e) => handleStatusChange(d._id, e.target.value)}
                          fullWidth
                        >
                          <MenuItem value="In route for pick up">In route for pick up</MenuItem>
                          <MenuItem value="Waiting for paperwork">Waiting for paperwork</MenuItem>
                          <MenuItem value="Heading to customer">Heading to customer</MenuItem>
                          <MenuItem value="Delivered">Delivered</MenuItem>
                        </Select>
                        {d.status !== 'Delivered' && (
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => handleStatusChange(d._id, 'Delivered')}
                            sx={{ mt: 1 }}
                            fullWidth
                          >
                            Mark as Delivered
                          </Button>
                        )}
                      </>
                    ) : (
                      <Typography color="error" mt={1}>
                        You are not assigned to this delivery.
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Paper>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6}>
              <Card elevation={1} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h5" color="primary.dark">
                    {isClockedIn
                      ? `${Math.floor(secondsWorked / 3600)}h ${Math.floor((secondsWorked % 3600) / 60)}m ${secondsWorked % 60}s`
                      : `${totalHours.toFixed(2)} hrs`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card elevation={1} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">COD Collected</Typography>
                  <Typography variant="h5" color="primary.dark">$1,200</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Uploads & Bonuses</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={4}><Button fullWidth variant="outlined" onClick={() => navigate('/driver/cod/new')}>Post Contract</Button></Grid>
              <Grid item xs={12} sm={4}><Button fullWidth variant="outlined" onClick={() => navigate('/lease/create')}>Post Lease Return</Button></Grid>
              <Grid item xs={12} sm={4}><Button fullWidth variant="outlined" onClick={() => navigate('/new-car')}>Post New Car</Button></Grid>
              <Grid item xs={12} sm={4}><Button fullWidth variant="outlined" onClick={() => navigate('/allcods')}>View CODs</Button></Grid>
              <Grid item xs={12} sm={4}><Button fullWidth variant="outlined" onClick={() => navigate('/driver/lease-returns')}>View Lease Returns</Button></Grid>
              <Grid item xs={12} sm={4}><Button fullWidth variant="outlined" onClick={() => navigate('/cars')}>View New Cars</Button></Grid>
            </Grid>

            <BonusUpload onCountUpdate={fetchCounts} />

            <Grid container spacing={2} mt={2}>
              <Grid item xs={6}>
                <Button variant="contained" color="success" fullWidth onClick={() => setShowGallery(!showGallery)}>
                  Reviews: {counts.review}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" color="primary" fullWidth onClick={() => setShowGallery(!showGallery)}>
                  Customers: {counts.customer}
                </Button>
              </Grid>
            </Grid>

            <Typography mt={2} variant="body2" color="text.secondary">
              💰 $20 per review picture · $5 per customer picture
            </Typography>
          </Paper>

          <Collapse in={showGallery}>
            <Box mt={5}>
              <BonusGallery />
            </Box>
          </Collapse>
        </Container>
      </Box>
    </>
  );
};

export default DriverDashboard;
