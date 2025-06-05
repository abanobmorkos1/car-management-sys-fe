import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import {
  Box, Button, Card, CardContent, Container, Divider,
  Grid, ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material';
import DriverDeliveryCard from '../components/DriverDeliveryCard';
import BonusUpload from '../pages/Driver/BonusUpload';
import BonusGallery from '../components/BonusGallery';
import { useNavigate } from 'react-router-dom';

const ClockStatusMessage = ({ clockInStatus }) => {
  if (!clockInStatus?.status) return null;
  if (clockInStatus.status === 'pending') {
    return (
      <Typography variant="body2" sx={{ mb: 1, color: 'warning.main', fontWeight: 'bold' }}>
        ⏳ Waiting for approval...
      </Typography>
    );
  }
  if (clockInStatus.status === 'approved') {
    return (
      <Typography variant="body2" sx={{ mb: 1, color: 'success.main', fontWeight: 'bold' }}>
        ✅ You are clocked in
      </Typography>
    );
  }
  if (clockInStatus.status === 'rejected') {
    return (
      <Typography variant="body2" sx={{ mb: 1, color: 'error.main', fontWeight: 'bold' }}>
        ❌ Clock-in rejected. Contact management.
      </Typography>
    );
  }
  return null;
};


const DriverDashboardLayout = ({
  user,
  isClockedIn,
  clockInStatus,
  handleClockInOut,
  handleStatusChange,
  secondsWorked,
  totalHours,
  counts,
  filter,
  setFilter,
  deliveries,
  navigate,
  weeklyEarnings,
  dailyBreakdown,
  lastSessionEarnings,
  submittingClockIn,
  showGallery,
  setShowGallery,
}) => {
  const [bonusCounts, setBonusCounts] = useState({ review: 0, customer: 0 });
  const base = weeklyEarnings?.baseEarnings || 0;
  const bonus = bonusCounts.review * 20 + bonusCounts.customer * 5;
  const total = base + bonus;

  useEffect(() => {
    const fetchBonusCounts = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/driver/my-uploads`, {
          credentials: 'include'
        });
        const data = await res.json();
        const reviewCount = data.filter(u => u.type === 'review').length;
        const customerCount = data.filter(u => u.type === 'customer').length;
        setBonusCounts({ review: reviewCount, customer: customerCount });
      } catch (err) {
        console.error('❌ Failed to fetch bonus counts', err);
      }
    };
    fetchBonusCounts();
  }, []);

  return (
    <>
      <Topbar />
      <Box sx={{ backgroundColor: '#f9fafb', minHeight: '100vh', py: 3 , justifyItems: 'center'}}>
        <Container maxWidth="sm"  >
          <Typography variant="h5" fontWeight="bold" color="primary" mb={3} textAlign="center">
            Driver Dashboard
          </Typography>

          <Typography variant="h6" fontWeight="medium" color="text.primary" display={'flex'} justifyContent={"center"} gutterBottom>
            Deliveries
          </Typography>
<Box display="flex" justifyContent="center" gap={2} flexWrap="wrap" mb={2}>
  <Button
    variant="contained"
    color="primary"
    onClick={() => navigate('/new-car')}
  >
    🚗 Post New Car
  </Button>
  <Button
    variant="contained"
    color="secondary"
    onClick={() => navigate('/lease/create')}
  >
    🔁 Post Lease Return
  </Button>
  <Button
    variant="contained"
    color="success"
    onClick={() => navigate('/driver/cod/new')}
  >
    💵 Create COD
  </Button>
</Box>

          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(e, val) => val && setFilter(val)}
            fullWidth
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 3,
                '& .MuiToggleButton-root': {
                  fontWeight: 'bold',
                  flex: 1, // optional: makes buttons equal width
                  maxWidth: 200 // optional: limits max width
                }
              }}

          >
                <Button
            onClick={() => setFilter('assigned')}
            variant={filter === 'assigned' ? 'contained' : 'outlined'}
          >
            Assigned
          </Button>
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'contained' : 'outlined'}
          >
            All
          </Button>
          </ToggleButtonGroup>

          {deliveries.length > 0 ? (
            deliveries.map(del => (
              <Box key={del._id} mb={2}>
                <DriverDeliveryCard
                  delivery={del}
                  onStatusChange={handleStatusChange}
                  userId={user?._id}
                  navigate={navigate}
                />
              </Box>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No deliveries found.
            </Typography>
          )}

          <Divider sx={{ my: 4 }} />

          <Grid container spacing={2} mb={3}>
            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#ffffff' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    My Time
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {isClockedIn
                      ? `${Math.floor(secondsWorked / 3600)}h ${Math.floor((secondsWorked % 3600) / 60)}m ${secondsWorked % 60}s`
                      : `${Number(totalHours || 0).toFixed(2)} hrs`}
                  </Typography>
                  <Typography variant="body2" mt={1} color="text.secondary">
                    You've earned: <strong>${total.toFixed(2)}</strong> this week
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Base: ${base.toFixed(2)} + Bonus: ${bonus.toFixed(2)}
                  </Typography>
                  {lastSessionEarnings !== null && (
                    <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                      🕓 Last session earnings: <strong>${lastSessionEarnings.toFixed(2)}</strong>
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleClockInOut}
                    disabled={submittingClockIn || clockInStatus?.status === 'pending'}
                    sx={{
                      mt: 2,
                      bgcolor: submittingClockIn
                        ? 'info.main'
                        : isClockedIn && clockInStatus?.status === 'approved'
                        ? 'error.main'
                        : clockInStatus?.status === 'pending'
                        ? 'warning.main'
                        : 'success.main'
                    }}
                  >
                    {submittingClockIn
                      ? 'Submitting Request...'
                      : clockInStatus?.status === 'pending'
                      ? 'Awaiting Approval...'
                      : isClockedIn && clockInStatus?.status === 'approved'
                      ? 'Clock Out'
                      : 'Clock In'}
                  </Button>
                  <ClockStatusMessage clockInStatus={clockInStatus} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#ffffff' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Bonus Uploads
                  </Typography>
                  <Typography variant="body2" mb={0.5}>
                    Review Photos: <strong>{bonusCounts.review}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Customer Photos: <strong>{bonusCounts.customer}</strong>
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold" mt={1}>
                    Total Bonus: ${bonusCounts.review * 20 + bonusCounts.customer * 5}
                  </Typography>
                  <Box mt={2}>
                    <BonusUpload onCountUpdate={(counts) => setBonusCounts(counts)} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              🗓 Weekly Breakdown
            </Typography>
            {dailyBreakdown.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No data available for this week.
              </Typography>
            ) : (
              dailyBreakdown.map(day => (
                <Box key={day.date} mb={2}>
                  <Typography variant="body2" fontWeight="bold">{day.date}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ⏱ {day.totalHours} hrs | 💰 ${day.baseEarnings.toFixed(2)} base + 🎁 ${day.bonus.toFixed(2)} bonus = <strong>${day.totalEarnings.toFixed(2)}</strong>
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          {showGallery && (
            <Box mt={4}>
              <BonusGallery />
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default DriverDashboardLayout;
