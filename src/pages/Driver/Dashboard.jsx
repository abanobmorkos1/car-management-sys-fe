import React, { useState } from 'react';
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

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [showGallery, setShowGallery] = useState(false);
  const [counts, setCounts] = useState({ review: 0, customer: 0 });

  const handleBonusCount = (data) => {
    setCounts(data);
  };

  return (
    <Box sx={{ backgroundColor: '#e9eff6', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        {/* Welcome */}
        <Typography variant="h4" fontWeight="bold" color="primary.main" mb={3}>
          Welcome, Driver 👋
        </Typography>

        {/* Clock */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Work Status
          </Typography>
          <Button variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>
            Clock In
          </Button>
        </Paper>

        {/* Deliveries */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Today's Deliveries
          </Typography>
          <Typography color="text.secondary" mb={0.5}>• 2 New Cars</Typography>
          <Typography color="text.secondary" mb={0.5}>• 1 COD Pickup</Typography>
          <Typography color="text.secondary">• 1 Lease Return</Typography>
        </Paper>

        {/* Stats */}
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

        {/* Uploads */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>Uploads & Bonuses</Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/driver/cod/new')}>
                Upload Contract
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined">
                Upload Car Pictures
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/allcods')}>
                View All CODs
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
            💰 $25 per review picture · $5 per customer picture
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
