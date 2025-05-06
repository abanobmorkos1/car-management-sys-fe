import React from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BonusUpload from '../Driver/BonusUpload';
import BonusGallery from '../../components/BonusGallery';

const DriverDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="md">
        {/* Welcome */}
        <Typography variant="h5" mb={2}>
          Welcome, Driver 👋
        </Typography>

        {/* Clock In / Out */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body1" mb={1}>
            Work Status:
          </Typography>
          <Button variant="contained" color="primary" fullWidth>
            Clock In
          </Button>
        </Paper>

        {/* Today's Deliveries */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" mb={1}>
            Today's Deliveries
          </Typography>
          <Typography variant="body2">• 2 New Cars</Typography>
          <Typography variant="body2">• 1 COD Pickup</Typography>
          <Typography variant="body2">• 1 Lease Return</Typography>
        </Paper>

        {/* Quick Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">Hours Worked</Typography>
                <Typography variant="h6">6.5 hrs</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">COD Collected</Typography>
                <Typography variant="h6">$1,200</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Upload Section */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Uploads & Bonuses
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
            Upload Car Pictures
          </Button>

          <Button fullWidth variant="outlined" sx={{ mb: 1 }} onClick={() => navigate('/driver/cod/new')}>
            Upload Contract
          </Button>

          <Button fullWidth variant="outlined" sx={{ mb: 1 }} onClick={() => navigate('/allcods')}>
            View All CODs
          </Button>

          {/* Integrated Bonus Upload Component */}
          <BonusUpload />

          <Typography mt={2} variant="body2" color="text.secondary">
            💰 $25 per review picture · $5 per customer picture
          </Typography>
        </Paper>
        <Box mt={4}>
          <BonusGallery />
        </Box>
      </Container>
    </Box>
  );
};

export default DriverDashboard;
