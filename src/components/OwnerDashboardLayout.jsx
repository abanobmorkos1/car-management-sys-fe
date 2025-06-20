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
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Assessment,
  Business,
  Schedule,
  Pending,
} from '@mui/icons-material';
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

  // Collapsible sections state
  const [sectionsExpanded, setSectionsExpanded] = useState({
    charts: false,
    deliveries: false,
    clockSessions: false,
    pendingClockIns: false,
  });

  const toggleSection = (section) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
  const isMobile = window.innerWidth < 600;
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Box sx={{ backgroundColor: '#f9fafb', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            mb={4}
            textAlign="center"
          >
            Owner Dashboard
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              gap={2}
              mb={3}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => onDateRangeChange(newValue, endDate)}
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) =>
                    onDateRangeChange(startDate, newValue)
                  }
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
              </Stack>
            </Box>
          </LocalizationProvider>
          {!loading && (
            <Paper
              elevation={3}
              sx={{
                mb: 4,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  p: 3,
                  pb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                  color: 'white',
                  '&:hover': { opacity: 0.9 },
                }}
                onClick={() => toggleSection('charts')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assessment />
                  <Typography variant="h6" fontWeight="bold">
                    Analytics & Charts
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'white' }}>
                  {sectionsExpanded.charts ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
              <Collapse in={sectionsExpanded.charts}>
                <Box sx={{ p: 3 }}>
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
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
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
                      </Grid>
                      <Grid item xs={12} md={6}>
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
                    </Grid>
                  ) : (
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ textAlign: 'center', p: 2 }}
                    >
                      No chart data available for the selected date range.
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Paper>
          )}
          <Card sx={{ mb: 4, overflow: 'hidden' }}>
            <Box
              sx={{
                p: 3,
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                color: 'white',
                '&:hover': { opacity: 0.9 },
              }}
              onClick={() => toggleSection('deliveries')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business />
                <Typography variant="h6" fontWeight="bold">
                  🚗 Deliveries ({totalDeliveries})
                </Typography>
              </Box>
              <IconButton size="small" sx={{ color: 'white' }}>
                {sectionsExpanded.deliveries ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            <Collapse in={sectionsExpanded.deliveries}>
              <CardContent>
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
            </Collapse>
          </Card>
          <Card sx={{ mb: 4, overflow: 'hidden' }}>
            <Box
              sx={{
                p: 3,
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                color: 'white',
                '&:hover': { opacity: 0.9 },
              }}
              onClick={() => toggleSection('clockSessions')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule />
                <Typography variant="h6" fontWeight="bold">
                  ⏰ Clock Sessions ({filteredClockSessions.length})
                </Typography>
              </Box>
              <IconButton size="small" sx={{ color: 'white' }}>
                {sectionsExpanded.clockSessions ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
              </IconButton>
            </Box>
            <Collapse in={sectionsExpanded.clockSessions}>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
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
            </Collapse>
          </Card>
          <Card sx={{ overflow: 'hidden' }}>
            <Box
              sx={{
                p: 3,
                pb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'linear-gradient(45deg, #f44336, #ef5350)',
                color: 'white',
                '&:hover': { opacity: 0.9 },
              }}
              onClick={() => toggleSection('pendingClockIns')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Pending />
                <Typography variant="h6" fontWeight="bold">
                  📝 Pending Clock-Ins ({pendingRequests?.length || 0})
                </Typography>
              </Box>
              <IconButton size="small" sx={{ color: 'white' }}>
                {sectionsExpanded.pendingClockIns ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
              </IconButton>
            </Box>
            <Collapse in={sectionsExpanded.pendingClockIns}>
              <CardContent>
                {Array.isArray(pendingRequests) &&
                pendingRequests.length > 0 ? (
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
            </Collapse>
          </Card>
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
