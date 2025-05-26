import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';
import Topbar from '../components/Topbar';
import ClockApprovalCard from '../components/ClockApprovalCard';
import DriverDeliveryCard from '../components/DriverDeliveryCard';

const ManagerDashboardLayout = ({
  deliveries,
  drivers,
  clockSessions,
  selectedDate,
  setSelectedDate,
  selectedDriverId,
  setSelectedDriverId,
  handleAssignDriver,
  handleApproveClockIn,
  handleRejectClockIn,
  userId
}) => {
  return (
    <>
      <Topbar />
      <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Manager Dashboard
          </Typography>

          {/* Clock Approval Section */}
          <Typography variant="h6" gutterBottom>Clock-In Approvals</Typography>
          <Grid container spacing={2} mb={4}>
            {clockSessions.flatMap(session =>
              session.sessions
                .filter(s => s.status === 'pending')
                .map(s => (
                  <Grid item xs={12} sm={6} md={4} key={s._id}>
                    <ClockApprovalCard
                      session={s}
                      driver={session.driver}
                      onApprove={() => handleApproveClockIn(s._id)}
                      onReject={() => handleRejectClockIn(s._id)}
                    />
                  </Grid>
                ))
            )}
          </Grid>

          {/* Delivery Assignment Section */}
          <Typography variant="h6" gutterBottom>Deliveries</Typography>
          <Grid container spacing={2}>
            {deliveries.map(del => (
              <Grid item xs={12} key={del._id}>
                <DriverDeliveryCard
                delivery={del}
                availableDrivers={drivers}
                userId={userId} // <-- make sure ManagerDashboardLayout receives this prop too!
                onAssignDriver={handleAssignDriver}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default ManagerDashboardLayout;
