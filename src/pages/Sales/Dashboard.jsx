import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  Box,
  Paper,
  Stack,
  TextField,
  Chip,
  Pagination,
  Grid,
  Collapse,
  IconButton,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  Assessment,
  Business,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import Topbar from '../../components/Topbar';
import EditDeliveryForm from './EditDeliveryForm';
import NewDeliveryForm from './CreateDelivery';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const api = process.env.REACT_APP_API_URL;
const itemsPerPage = 4;

const SalesDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Calculate max date (today) and min date (5 days back)
  const today = new Date();
  const fiveDaysBack = new Date(today);
  fiveDaysBack.setDate(today.getDate() - 5);

  const [startDate, setStartDate] = useState(fiveDaysBack);
  const [endDate, setEndDate] = useState(today);

  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(true);

  const [sectionsExpanded, setSectionsExpanded] = useState({
    charts: false,
    deliveries: false,
  });

  const toggleSection = (section) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const fetchDeliveries = async (
    pageNum = page,
    dateFrom = startDate,
    dateTo = endDate
  ) => {
    setLoading(true);
    try {
      const from = new Date(
        dateFrom.getFullYear(),
        dateFrom.getMonth(),
        dateFrom.getDate()
      );
      const to = new Date(
        dateTo.getFullYear(),
        dateTo.getMonth(),
        dateTo.getDate()
      );
      to.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        start: from.toISOString(),
        end: to.toISOString(),
        page: pageNum.toString(),
        pageSize: itemsPerPage.toString(),
      });

      const res = await fetch(`${api}/api/delivery/deliveries?${params}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      const data = await res.json();
      setDeliveries(data.deliveries);
      setTotalDeliveries(data.total);
    } catch (err) {
      setDeliveries([]);
      setTotalDeliveries(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCODChartData = async (dateFrom = startDate, dateTo = endDate) => {
    setChartLoading(true);
    try {
      const from = new Date(
        dateFrom.getFullYear(),
        dateFrom.getMonth(),
        dateFrom.getDate()
      );
      const to = new Date(
        dateTo.getFullYear(),
        dateTo.getMonth(),
        dateTo.getDate()
      );
      to.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        start: from.toISOString(),
        end: to.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const res = await fetch(`${api}/api/delivery/cod-chart-data?${params}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      const data = await res.json();
      setChartData(data);
    } catch (err) {
      console.error('Error fetching COD chart data:', err);
      setChartData(null);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchCODChartData();
  }, []);

  useEffect(() => {
    fetchDeliveries(1, startDate, endDate);
    fetchCODChartData(startDate, endDate);
    setPage(1);
  }, [startDate, endDate]);

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchDeliveries(value, startDate, endDate);
  };

  const handleOpenEdit = (delivery) => {
    setSelectedDelivery(delivery);
    setEditOpen(true);
  };

  const handleDeliveryUpdated = (updatedDelivery) => {
    setDeliveries((prev) =>
      prev.map((d) => (d._id === updatedDelivery._id ? updatedDelivery : d))
    );
    setEditOpen(false);
  };

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
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
          Sales Dashboard
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
                onChange={(newValue) => setStartDate(newValue)}
                minDate={fiveDaysBack}
                maxDate={endDate}
                renderInput={(params) => (
                  <TextField {...params} size="small" fullWidth />
                )}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={fiveDaysBack}
                renderInput={(params) => (
                  <TextField {...params} size="small" fullWidth />
                )}
              />
            </Stack>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateOpen(true)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              ➕ Create Delivery
            </Button>
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
            {/* Charts Section - Collapsible */}
            <Paper
              elevation={3}
              sx={{
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
                    <Typography variant="h6" color="text.secondary">
                      No chart data available for the selected date range.
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Paper>

            {/* Deliveries Grid - Collapsible */}
            <Paper
              elevation={3}
              sx={{
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
                  background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                  color: 'white',
                  '&:hover': { opacity: 0.9 },
                }}
                onClick={() => toggleSection('deliveries')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business />
                  <Typography variant="h6" fontWeight="bold">
                    Deliveries ({totalDeliveries})
                  </Typography>
                </Box>
                <IconButton size="small" sx={{ color: 'white' }}>
                  {sectionsExpanded.deliveries ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </IconButton>
              </Box>
              <Collapse in={sectionsExpanded.deliveries}>
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {deliveries.length ? (
                      deliveries.map((delivery) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={4}
                          lg={3}
                          key={delivery._id}
                        >
                          <Card elevation={3} sx={{ borderRadius: 4, p: 2 }}>
                            <CardContent>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={1}
                              >
                                <Typography
                                  variant="h6"
                                  fontWeight={700}
                                  noWrap
                                >
                                  {delivery.customerName || 'Unnamed Customer'}
                                </Typography>
                                <Chip
                                  label={delivery.status || 'No Status'}
                                  size="small"
                                  color={
                                    delivery.status === 'Delivered'
                                      ? 'success'
                                      : delivery.status ===
                                          'Heading to Customer'
                                        ? 'primary'
                                        : delivery.status ===
                                            'Waiting for Paperwork'
                                          ? 'warning'
                                          : delivery.status ===
                                              'In Route for Pick Up'
                                            ? 'info'
                                            : 'default'
                                  }
                                />
                              </Box>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                fontWeight={500}
                              >
                                Delivery Date:{' '}
                                {new Date(
                                  delivery.deliveryDate
                                ).toLocaleString()}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                fontWeight={500}
                              >
                                Address: {delivery.address}
                              </Typography>

                              {delivery.driver?.name && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight={500}
                                >
                                  Driver: {delivery.driver.name}
                                </Typography>
                              )}

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                fontWeight={500}
                              >
                                Vehicle: {delivery.year} {delivery.make}{' '}
                                {delivery.model} {delivery.trim} -{' '}
                                {delivery.color}
                              </Typography>

                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={
                                  delivery.codCollected
                                    ? 'success.main'
                                    : 'error.main'
                                }
                              >
                                COD: ${delivery.codAmount}{' '}
                                {delivery.codCollected
                                  ? `(via ${delivery.codMethod})`
                                  : '(Pending)'}
                              </Typography>

                              <Chip
                                label={
                                  delivery.leaseReturn?.willReturn
                                    ? 'Lease Return'
                                    : 'No Lease Return'
                                }
                                color={
                                  delivery.leaseReturn?.willReturn
                                    ? 'warning'
                                    : 'default'
                                }
                                size="small"
                                sx={{ mt: 1 }}
                              />

                              <Button
                                variant="contained"
                                fullWidth
                                size="small"
                                sx={{ mt: 2, fontWeight: 600 }}
                                onClick={() => handleOpenEdit(delivery)}
                              >
                                Edit Delivery
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Paper
                          elevation={3}
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="h6" color="text.secondary">
                            No deliveries found for the selected date range.
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>

                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={Math.ceil(totalDeliveries / itemsPerPage)}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          </Stack>
        )}

        <Dialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedDelivery && (
            <EditDeliveryForm
              delivery={selectedDelivery}
              onClose={() => setEditOpen(false)}
              onSuccess={handleDeliveryUpdated}
            />
          )}
        </Dialog>

        <Dialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <NewDeliveryForm
            onClose={() => setCreateOpen(false)}
            onSuccess={(newDelivery) => {
              setDeliveries((prev) => [...prev, newDelivery]);
              setCreateOpen(false);
            }}
          />
        </Dialog>
      </Container>
    </Container>
  );
};

export default SalesDashboard;
