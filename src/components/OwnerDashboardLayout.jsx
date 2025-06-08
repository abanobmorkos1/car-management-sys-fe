import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Divider,
  Snackbar,
  Alert,
  Card,
  CardContent,
  TextField,
  Pagination,
} from '@mui/material';
import OwnerDeliveryCard from './OwnerDeliveryCard';
import ClockSessionItem from './ClockSessionItem';
import ClockApprovalCard from './ClockApprovalCard';
import Topbar from './Topbar';
import { format, isValid } from 'date-fns';
const OwnerDashboardLayout = ({
  deliveries = [],
  clockSessions = [],
  pendingRequests = [],
  onApprove = () => {},
  onReject = () => {},
  setSelectedDate = () => {},
  selectedDate = new Date(),
}) => {
  const [loadingId, setLoadingId] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  const handleApprove = async (id) => {
    try {
      setLoadingId(id);
      onApprove(id);
      setSnack({
        open: true,
        message: 'Clock-in approved ✅',
        severity: 'success',
      });
    } catch (err) {
      setSnack({
        open: true,
        message: 'Failed to approve ❌',
        severity: 'error',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoadingId(id);
      await onReject(id);
      setSnack({
        open: true,
        message: 'Clock-in rejected ❌',
        severity: 'info',
      });
    } catch (err) {
      setSnack({
        open: true,
        message: 'Failed to reject ❌',
        severity: 'error',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const paginatedDeliveries = deliveries.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  const pageCount = Math.ceil(deliveries.length / itemsPerPage);
  console.log({ clockSessions });
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Box sx={{ backgroundColor: '#f9fafb', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            mb={4}
            textAlign="center"
          >
            Owner Dashboard
          </Typography>

          {/* Deliveries Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🚗 Deliveries ({deliveries.length})
              </Typography>

              <TextField
                type="date"
                label="Filter by Date"
                variant="outlined"
                size="small"
                value={
                  isValid(selectedDate)
                    ? format(selectedDate, 'yyyy-MM-dd')
                    : ''
                }
                onChange={(e) => {
                  const rawValue = new Date(e.target.value);
                  rawValue.setHours(0, 0, 0, 0); // Normalize to start of day
                  setSelectedDate(rawValue);
                  setPage(1);
                }}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              {paginatedDeliveries.length > 0 ? (
                paginatedDeliveries.map((delivery) => (
                  <Box key={delivery._id} mb={2}>
                    <OwnerDeliveryCard delivery={delivery} />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No deliveries found for this date.
                </Typography>
              )}

              {pageCount > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Clock Sessions Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ⏱ Clock Sessions ({clockSessions?.length || 0})
              </Typography>
              {Array.isArray(clockSessions) && clockSessions.length > 0 ? (
                clockSessions.map(
                  ({
                    driver,
                    sessions,
                    totalHours,
                    weeklyTotalHours,
                    todaysDate,
                    weekRange,
                  }) => {
                    return (
                      <ClockSessionItem
                        key={driver._id}
                        todaysDate={todaysDate}
                        weekRange={weekRange}
                        driver={driver}
                        sessions={sessions}
                        totalHours={totalHours}
                        weeklyTotalHours={weeklyTotalHours}
                      />
                    );
                  }
                )
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No clock-in sessions found.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Pending Clock-In Requests */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
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
            </CardContent>
          </Card>

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
    </Container>
  );
};

export default OwnerDashboardLayout;
