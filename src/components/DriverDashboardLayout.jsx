import Topbar from '../components/Topbar';
import {
  Box, Button, Card, CardContent, Container, Divider,
  Grid, ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material';
import DriverDeliveryCard from '../components/DriverDeliveryCard';
import BonusUpload from '../pages/Driver/BonusUpload';
import BonusGallery from '../components/BonusGallery';

const ClockStatusMessage = ({ clockInStatus }) => {
  if (clockInStatus?.status === 'pending') {
    return (
      <Typography variant="body2" sx={{ mb: 1, color: 'warning.main', fontWeight: 'bold' }}>
        ⏳ Waiting for approval...
      </Typography>
    );
  }
  if (clockInStatus?.status === 'approved') {
    return (
      <Typography variant="body2" sx={{ mb: 1, color: 'success.main', fontWeight: 'bold' }}>
        ✅ You are clocked in
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
  showGallery,
  setShowGallery,
  filter,
  setFilter,
  deliveries,
  navigate,
  weeklyEarnings,
  dailyBreakdown,
  lastSessionEarnings,
  clockRequestPending
}) => {
  return (
    <>
      <Topbar />
      <Box sx={{ backgroundColor: '#f9fafb', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="sm">
          <Typography variant="h5" fontWeight="bold" color="primary" mb={3} textAlign="center">
            Driver Dashboard
          </Typography>

          {/* Deliveries Section */}
          <Typography variant="h6" fontWeight="medium" color="text.primary" gutterBottom>
            Deliveries
          </Typography>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(e, val) => val && setFilter(val)}
            fullWidth
            sx={{ mb: 3, '& .MuiToggleButton-root': { fontWeight: 'bold' } }}
          >
            <ToggleButton value="assigned">Assigned</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>

          {deliveries.length > 0 ? (
            deliveries.map(del => (
              <Box key={del._id} mb={2}>
                <DriverDeliveryCard
                delivery={del}
                onStatusChange={handleStatusChange}
                userId={user?._id}
              />
              </Box>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No deliveries found.
            </Typography>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Clock & Bonus Section */}
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
                     You've earned: <strong>${(weeklyEarnings ?? 0).toFixed(2)}</strong> this week
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
                  disabled={clockRequestPending}
                  sx={{
                    mt: 2,
                    bgcolor:
                      clockRequestPending
                        ? 'grey.500'
                        : isClockedIn && clockInStatus?.status === 'approved'
                        ? 'error.main'
                        : 'success.main'
                  }}
                >
                  {clockRequestPending
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
                    Review Photos: <strong>{counts?.review ?? 0}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Customer Photos: <strong>{counts?.customer ?? 0}</strong>
                  </Typography>
                  <Box mt={2}>
                    <BonusUpload onCountUpdate={setShowGallery} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Weekly Breakdown Section */}
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
