import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BonusUpload from '../Driver/BonusUpload';
import BonusGallery from '../../components/BonusGallery';
import { AuthContext } from '../../contexts/AuthContext';

const api = process.env.REACT_APP_API_URL;

const DriverDashboard = () => {
  const { userName, token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showGallery, setShowGallery] = useState(false);
  const [counts, setCounts] = useState({ review: 0, customer: 0 });
  const [todaysDeliveries, setTodaysDeliveries] = useState([]);

  const handleBonusCount = (data) => {
    setCounts(data);
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(`${api}/api/driver/my-uploads`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) return;

        const uploads = await res.json();
        const review = uploads.filter(u => u.type === 'review').length;
        const customer = uploads.filter(u => u.type === 'customer').length;

        setCounts({ review, customer });
      } catch (err) {
        console.error('Error fetching uploads:', err);
      }
    };

    const fetchDeliveries = async () => {
      try {
        const res = await fetch(`${api}/api/delivery/deliveries`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const today = new Date().toISOString().split('T')[0];

        const filtered = data.filter(del => {
          const deliveryDate = new Date(del.deliveryDate).toISOString().split('T')[0];
          return deliveryDate === today;
        });

        setTodaysDeliveries(filtered);
      } catch (err) {
        console.error('Error fetching deliveries:', err);
      }
    };

    fetchCounts();
    fetchDeliveries();
  }, [token]);

  return (
    <Box sx={{ backgroundColor: '#e9eff6', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" color="primary.main" mb={3}>
          Welcome, {userName || 'Driver'} 👋
        </Typography>

        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Work Status</Typography>
          <Button variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>
            Clock In
          </Button>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Today's Deliveries</Typography>
          {todaysDeliveries.length === 0 ? (
            <Typography color="text.secondary">No deliveries scheduled for today.</Typography>
          ) : (
            todaysDeliveries.map((d, i) => (
              <Typography key={i} color="text.secondary" mb={0.5}>
                {d.customerName} • {new Date(d.deliveryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            ))
          )}
        </Paper>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6}>
            <Card elevation={1} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Hours Worked</Typography>
                <Typography variant="h5" color="primary.dark">6.5 hrs</Typography>
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
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/driver/cod/new')}>
                Post Contract
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/lease/create')}>
                Post Lease Return
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/new-car')}>
                Post New Car
              </Button>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/allcods')}>
                View CODs
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/driver/lease-returns')}>
                View Lease Returns
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/cars')}>
                View New Cars
              </Button>
            </Grid>
          </Grid>

          <BonusUpload onCountUpdate={handleBonusCount} />

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
            💰 $20 per review picture · $20 per review picture \xb7 $5 per customer picture
          </Typography>
        </Paper>

        <Collapse in={showGallery}>
          <Box mt={5}>
            <BonusGallery />
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
};

export default DriverDashboard;
