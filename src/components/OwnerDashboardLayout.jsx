import React, { useEffect, useState } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import OwnerDeliveryCard from './OwnerDeliveryCard';
import ClockSessionItem from './ClockSessionItem';
import ClockApprovalCard from './ClockApprovalCard';
import Topbar from './Topbar';
import { Bar, Line } from 'react-chartjs-2';

const OwnerDashboardLayout = ({
  deliveries = [],
  totalDeliveries = 0,
  clockSessions = [],
  pendingRequests = [],
  onApprove = () => {},
  onReject = () => {},
  startDate = new Date(),
  endDate = new Date(),
  page = 1,
  loading = false,
  onDateRangeChange = () => {},
  onPageChange = () => {},
  chartData = null,
  chartLoading = false,
}) => {
  const [loadingId, setLoadingId] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('all');
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

  // Get unique drivers for filter dropdown
  const uniqueDrivers = Array.isArray(clockSessions)
    ? clockSessions.reduce((acc, session) => {
        if (session.driver && !acc.find((d) => d._id === session.driver._id)) {
          acc.push(session.driver);
        }
        return acc;
      }, [])
    : [];

  // Filter clock sessions based on selected driver
  const filteredClockSessions = Array.isArray(clockSessions)
    ? selectedDriver === 'all'
      ? clockSessions
      : clockSessions.filter((session) => session.driver._id === selectedDriver)
    : [];
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'COD Collections Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
  };

  const prepareChartData = () => {
    if (!chartData || !chartData?.dailyCollections?.length) return null;

    return {
      labels: chartData.dailyCollections.map((item) =>
        new Date(item.date).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Total COD Collected',
          data: chartData.dailyCollections.map((item) => item.totalAmount),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
        },
        {
          label: 'Number of Collections',
          data: chartData.dailyCollections.map((item) => item.count),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          yAxisID: 'y1',
        },
      ],
    };
  };

  const chartOptionsWithSecondAxis = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
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
                <Stack spacing={4}>
                  {/* Charts Section - Moved above deliveries */}
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    {chartLoading ? (
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight="400px"
                      >
                        <CircularProgress />
                      </Box>
                    ) : chartData?.dailyCollections?.length ? (
                      <Grid display="flex" spacing={3} columns={2}>
                        <Card elevation={2} sx={{ p: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Daily COD Collections
                          </Typography>
                          <Box sx={{ height: '400px' }}>
                            {prepareChartData() && (
                              <Bar
                                data={prepareChartData()}
                                options={{
                                  ...chartOptions,
                                  maintainAspectRatio: false,
                                }}
                              />
                            )}
                          </Box>
                        </Card>

                        <Card elevation={2} sx={{ p: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            COD Trend Over Time
                          </Typography>
                          <Box sx={{ height: '400px' }}>
                            {prepareChartData() && (
                              <Line
                                data={prepareChartData()}
                                options={{
                                  ...chartOptionsWithSecondAxis,
                                  maintainAspectRatio: false,
                                }}
                              />
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ) : (
                      <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                          No chart data available for the selected date range.
                        </Typography>
                      </Paper>
                    )}
                  </Paper>
                </Stack>
              )}
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
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight="bold">
                  ⏰ Clock Sessions ({filteredClockSessions.length})
                </Typography>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Driver</InputLabel>
                  <Select
                    value={selectedDriver}
                    label="Filter by Driver"
                    onChange={(e) => setSelectedDriver(e.target.value)}
                  >
                    <MenuItem value="all">All Drivers</MenuItem>
                    {uniqueDrivers.map((driver) => (
                      <MenuItem key={driver._id} value={driver._id}>
                        {driver.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {filteredClockSessions.length > 0 ? (
                filteredClockSessions.map(
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
                  {selectedDriver === 'all'
                    ? 'No clock-in sessions found.'
                    : 'No clock-in sessions found for selected driver.'}
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
