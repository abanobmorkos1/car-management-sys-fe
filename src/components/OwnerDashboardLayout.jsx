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
  Button,
  Stack,
  CircularProgress,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import OwnerDeliveryCard from './OwnerDeliveryCard';
import ClockSessionItem from './ClockSessionItem';
import ClockApprovalCard from './ClockApprovalCard';
import Topbar from './Topbar';
import { format, isValid } from 'date-fns';

const OwnerDashboardLayout = ({
  deliveries = [],
  totalDeliveries = 0,
  clockSessions = [],
  pendingRequests = [],
  onApprove = () => {},
  onReject = () => {},
  setSelectedDate = () => {},
  selectedDate = new Date(),
  startDate = new Date(),
  endDate = new Date(),
  page = 1,
  loading = false,
  onDateRangeChange = () => {},
  onPageChange = () => {},
}) => {
  const [loadingId, setLoadingId] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const itemsPerPage = 4;

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
                🚗 Deliveries ({totalDeliveries})
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={2}
                  mb={3}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) =>
                        onDateRangeChange(newValue, endDate)
                      }
                      renderInput={(params) => (
                        <TextField {...params} size="small" />
                      )}
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) =>
                        onDateRangeChange(startDate, newValue)
                      }
                      renderInput={(params) => (
                        <TextField {...params} size="small" />
                      )}
                    />
                  </Stack>
                </Box>
              </LocalizationProvider>

              {loading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight="300px"
                >
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {deliveries.length > 0 ? (
                    deliveries.map((delivery) => (
                      <Box key={delivery._id} mb={2}>
                        <OwnerDeliveryCard delivery={delivery} />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No deliveries found for this date range.
                    </Typography>
                  )}

                  {Math.ceil(totalDeliveries / itemsPerPage) > 1 && (
                    <Box display="flex" justifyContent="center" mt={2}>
                      <Pagination
                        count={Math.ceil(totalDeliveries / itemsPerPage)}
                        page={page}
                        onChange={onPageChange}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Clock Sessions Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ⏰ Clock Sessions ({clockSessions.length})
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
            autoHideDuration={4000}
            onClose={() => setSnack({ ...snack, open: false })}
          >
            <Alert
              severity={snack.severity}
              onClose={() => setSnack({ ...snack, open: false })}
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
