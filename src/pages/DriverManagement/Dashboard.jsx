import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Select, MenuItem, Button, TextField,
  ToggleButtonGroup, ToggleButton, Card, CardContent, Divider, Collapse
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import Topbar from '../../components/Topbar';
import { useNavigate } from 'react-router-dom';
import { fetchWithToken } from '../../utils/fetchWithToken';
import BonusUpload from '../Driver/BonusUpload';
import BonusGallery from '../../components/BonusGallery';

const api = process.env.REACT_APP_API_URL;

const ManDashboard = () => {
  const { token, role } = useContext(AuthContext);
  const navigate = useNavigate();

  const [allDeliveries, setAllDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [clockSessions, setClockSessions] = useState([]);

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [secondsWorked, setSecondsWorked] = useState(0);
  const [clockInTime, setClockInTime] = useState(null);

  const [counts, setCounts] = useState({ review: 0, customer: 0 });
  const [showGallery, setShowGallery] = useState(false);

  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

 const handleAssignDriver = async (deliveryId, driverId) => {
  try {
    console.log('📦 Assigning delivery ID:', deliveryId);
    console.log('🚚 Driver ID received:', driverId);

    const updatedDelivery = await fetchWithToken(`${api}/api/delivery/assign-driver/${deliveryId}`, token, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ driverId })
    });

    // Optimistically update UI
    setAllDeliveries(prev =>
      prev.map(del =>
        del._id === deliveryId ? { ...del, driver: updatedDelivery.delivery.driver } : del
      )
    );

     setSnack({
      open: true,
      msg: 'Driver assigned successfully!',
      severity: 'success'
    });
  } catch (err) {
    console.error('❌ Failed to assign driver:', err);
        setSnack({
      open: true,
      msg: 'Failed to assign driver',
      severity: 'error'
    });
  }
};

  const fetchDeliveries = useCallback(async () => {
    try {
      const res = await fetch(`${api}/api/delivery/deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const today = new Date().toISOString().split('T')[0];
      const todayDeliveries = data.filter(del =>
        new Date(del.deliveryDate).toISOString().split('T')[0] === today
      );
      setAllDeliveries(todayDeliveries);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    }
  }, [token]);

const fetchDrivers = async () => {
  try {
    const data = await fetchWithToken(`${api}/api/users/drivers`, token); // fetchWithToken already returns parsed JSON
    console.log('✅ Drivers fetched:', data);
    setDrivers(data);
  } catch (err) {
    console.error('❌ Failed to fetch drivers:', err);
  }
};

      <ToggleButtonGroup
        color="primary"
        exclusive
        value={filter}
        onChange={(e, newVal) => {
          if (newVal !== null) setFilter(newVal);
        }}
        fullWidth
        sx={{ flexWrap: 'wrap', mb: 3 }}
      >
        <ToggleButton value="all">All</ToggleButton>
        {drivers.map((d) => (
          <ToggleButton key={d._id} value={d._id}>
            {d.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>


  const fetchClockSessions = async () => {
    try {
      const res = await fetch(`${api}/api/hours/today-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setClockSessions(data);
    } catch (err) {
      console.error('Error fetching clock sessions:', err);
    }
  };

  const handleOverride = async (sessionId, newHours) => {
    try {
      await fetch(`${api}/api/hours/override/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ totalHours: parseFloat(newHours) })
      });
      fetchClockSessions();
    } catch (err) {
      console.error('Failed to override hours', err);
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

  const fetchWeeklyHours = useCallback(async () => {
    try {
      const data = await fetchWithToken(`${api}/api/hours/weekly-hours`, token);
      setTotalHours(data.totalHours || 0);
    } catch (err) {
      console.error('Error fetching weekly hours:', err.message);
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

  useEffect(() => {
    fetchDrivers();
    fetchDeliveries();
    fetchClockSessions();
    fetchWeeklyHours();
    fetchCounts();
  }, [token]);

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
        const diff = Math.floor((now - clockInTime) / 1000);
        setSecondsWorked(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

    const filteredDeliveries = allDeliveries.filter(del => {
      if (filter === 'all') return true;
      return del.driver?._id?.toString() === filter;
    });

  return (
    <>
      <Topbar />
      <Box sx={{ backgroundColor: '#f3f6fa', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" color="primary.main" mb={3}>
            Management Dashboard
          </Typography>

          <Button
            variant="contained"
            onClick={handleClockInOut}
            fullWidth
            sx={{ mb: 3, py: 1, fontSize: '0.9rem', backgroundColor: isClockedIn ? 'error.main' : 'blue' }}
          >
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </Button>

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

            <ToggleButtonGroup
              color="primary"
              exclusive
              value={filter}
              onChange={(e, newVal) => {
                if (newVal !== null) setFilter(newVal);
              }}
              fullWidth
              sx={{ flexWrap: 'wrap', mb: 3 }}
            >
              <ToggleButton value="all">All</ToggleButton>
              {drivers.map((d) => (
                <ToggleButton key={d._id} value={d._id}>
                  {d.name}
                </ToggleButton>
              ))}
          </ToggleButtonGroup>

<Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
  <Typography variant="h6" gutterBottom>Today's Deliveries ({filteredDeliveries.length})</Typography>
  {filteredDeliveries.length === 0 ? (
    <Typography>No deliveries found.</Typography>
  ) : (
    filteredDeliveries.map((d) => (
      <Box key={d._id} mb={2} p={2} border="1px solid #ccc" borderRadius={2} bgcolor="#fff">
  <Typography fontWeight="bold">{d.customerName}</Typography>
  <Typography variant="body2">📍 Address: {d.address}</Typography>
  <Typography variant="body2">🕒 {new Date(d.deliveryDate).toLocaleString()}</Typography>
  <Typography variant="body2">🚘 Car: {d.year} {d.make} {d.model} {d.trim}</Typography>
  <Typography variant="body2">💵 COD: ${d.codAmount} ({d.codCollected ? 'Collected' : 'Not Collected'})</Typography>

      <Typography variant="body2" mt={1} fontWeight="medium">
        Driver: {d.driver?.name || 'Unassigned'}
      </Typography>

<Select
  fullWidth
  value={d.driver?._id || ''}
  onChange={(e) => handleAssignDriver(d._id, e.target.value)}
  displayEmpty
  sx={{ mt: 1 }}
>
  <MenuItem value="">Assign Driver</MenuItem>
  {drivers.map((drv) => (
    <MenuItem key={drv._id} value={drv._id}>
      {drv.name}
    </MenuItem>
  ))}
</Select>

    </Box>
    ))
  )}
</Paper>

          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Today's Clock-In Sessions</Typography>
            {clockSessions.length === 0 ? (
              <Typography>No sessions recorded today.</Typography>
            ) : (
              clockSessions.map((driver) => (
                <Box key={driver.driver._id} mb={2} p={2} border="1px solid #ccc" borderRadius={2} bgcolor="#fff">
                  <Typography fontWeight="bold">{driver.driver.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours: {driver.totalHours.toFixed(2)} hrs
                  </Typography>
                  {driver.sessions.map((sesh, idx) => (
                    <Box key={idx} ml={1}>
                      <Typography variant="body2">
                        {new Date(sesh.clockIn).toLocaleTimeString()} – {sesh.clockOut ? new Date(sesh.clockOut).toLocaleTimeString() : 'In progress'}
                        {' '} ({sesh.totalHours?.toFixed(2) || '0.00'} hrs)
                      </Typography>
                      {role === 'owner' && sesh.clockOut && (
                        <Box display="flex" alignItems="center" mt={1}>
                          <TextField
                            size="small"
                            label="Override"
                            type="number"
                            inputProps={{ step: '0.01' }}
                            onBlur={(e) => handleOverride(sesh._id, e.target.value)}
                            sx={{ width: 120, mr: 1 }}
                          />
                          <Typography variant="caption">hrs</Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              ))
            )}
          </Paper>

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

export default ManDashboard;
