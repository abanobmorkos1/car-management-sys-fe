import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import OwnerDeliveryCard from './OwnerDeliveryCard';
import ClockSessionItem from './ClockSessionItem';
import ClockApprovalCard from './ClockApprovalCard';
import Topbar from './Topbar';

const OwnerDashboardLayout = ({
  deliveries = [],
  clockSessions = [],
  pendingRequests = [],
  selectedDate = new Date(),
  onApprove = () => {},
  onReject = () => {}
}) => {
  const [loadingId, setLoadingId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleApprove = async (id) => {
    try {
      setLoadingId(id);
      await onApprove(id);
      setSnack({ open: true, message: 'Clock-in approved ✅', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, message: 'Failed to approve ❌', severity: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoadingId(id);
      await onReject(id);
      setSnack({ open: true, message: 'Clock-in rejected ❌', severity: 'info' });
    } catch (err) {
      setSnack({ open: true, message: 'Failed to reject ❌', severity: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
    <Topbar/>
    <Box sx={{ backgroundColor: '#f9fafb', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
          Owner Dashboard
        </Typography>

        {/* Deliveries */}
        <Typography variant="h6" fontWeight="bold" color="text.primary" mb={2}>
          🚗 Deliveries ({deliveries?.length || 0})
        </Typography>
        {Array.isArray(deliveries) && deliveries.length > 0 ? (
          deliveries.map((delivery) => (
            <Box key={delivery._id} mb={2}>
              <OwnerDeliveryCard delivery={delivery} />
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No deliveries found.
          </Typography>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Clock Sessions */}
        <Typography variant="h6" fontWeight="bold" color="text.primary" mb={2}>
          ⏱ Clock Sessions ({clockSessions?.length || 0})
        </Typography>
        {Array.isArray(clockSessions) && clockSessions.length > 0 ? (
          clockSessions.map((driver) => {
            const weekly = driver?.weeklyEarnings || { total: 0 };
            return (
              <ClockSessionItem
                key={driver.driver._id}
                driver={driver}
                weeklyTotal={weekly}
              />
            );
          })
        ) : (
          <Typography variant="body2" color="text.secondary">
            No clock-in sessions found.
          </Typography>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Pending Clock-In Requests */}
        <Typography variant="h6" fontWeight="bold" color="text.primary" mb={2}>
          📝 Pending Clock-Ins ({pendingRequests?.length || 0})
        </Typography>
        {Array.isArray(pendingRequests) && pendingRequests.length > 0 ? (
          pendingRequests.map((req) => (
            <Box key={req._id} mb={2}>
              <ClockApprovalCard
                request={req}
                onApprove={handleApprove}
                onReject={handleReject}
                loading={loadingId === req._id}
              />
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No pending clock-in requests.
          </Typography>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          <Alert
            onClose={() => setSnack({ ...snack, open: false })}
            severity={snack.severity}
            variant="filled"
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
    </>
  );
};

export default OwnerDashboardLayout;