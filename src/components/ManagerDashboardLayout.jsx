import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  TextField,
  Stack,
  CircularProgress,
  Skeleton,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Assignment,
  DirectionsCar,
  ReviewsOutlined,
  PhotoCamera,
  Search,
  DateRange,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Topbar from './Topbar';
import ManagerDeliveryCard from './ManagerDeliveryCard';
import BonusUpload from '../pages/Driver/BonusUpload';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

const ManagerDashboardLayout = ({
  drivers = [],
  user,
  onAssignDriver = () => {},
  handleStatusChange,
  triggerInitialBonusFetch,
}) => {
  const theme = useTheme();
  const [deliveries, setDeliveries] = useState([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bonusCounts, setBonusCounts] = useState({ review: 0, customer: 0 });

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Add pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const api = process.env.REACT_APP_API_URL;

  const handleBonusUpdate = (updatedCounts) => {
    if (
      updatedCounts?.review !== undefined &&
      updatedCounts?.customer !== undefined
    ) {
      setBonusCounts(updatedCounts);
    }
  };

  const fetchDeliveries = async (start = '', end = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Add pagination parameters
      params.append('page', page.toString());
      params.append('pageSize', perPage.toString());

      if (start) {
        params.append('startDate', start);
      }
      if (end) {
        params.append('endDate', end);
      }

      const res = await fetch(
        `${api}/api/delivery/deliveries?${params.toString()}`,
        {
          credentials: 'include',
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Handle both paginated and non-paginated responses
      const deliveriesData = data.deliveries;
      const total = data.total;
      const totalPagesCount = Math.ceil(total / perPage);

      setDeliveries(deliveriesData);
      setTotalDeliveries(total);
      setTotalPages(totalPagesCount);
    } catch (err) {
      console.error('❌ Failed to fetch deliveries:', err);
      setDeliveries([]);
      setTotalDeliveries(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (triggerInitialBonusFetch && typeof handleBonusUpdate === 'function') {
      const fetchInitialCounts = async () => {
        try {
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/driver/my-uploads`,
            {
              credentials: 'include',
            }
          );

          const data = await res.json();
          const reviewCount = data.filter((u) => u.type === 'review').length;
          const customerCount = data.filter(
            (u) => u.type === 'customer'
          ).length;
          handleBonusUpdate({ review: reviewCount, customer: customerCount });
        } catch (err) {
          console.error('🔴 Initial bonus count fetch failed:', err);
        }
      };

      fetchInitialCounts();
    }
  }, [triggerInitialBonusFetch]);

  useEffect(() => {
    fetchDeliveries();
  }, [startDate, endDate, page, perPage]);

  // Handle pagination changes
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handlePerPageChange = (event) => {
    setPerPage(event.target.value);
    setPage(1); // Reset to first page when changing items per page
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          {/* Enhanced Header */}
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              background: theme.gradients?.primary,
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Manager Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage deliveries and team performance
            </Typography>
          </Paper>

          {/* Enhanced Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: 'Total Deliveries',
                value: totalDeliveries,
                icon: <Assignment />,
                color: theme.gradients?.info,
              },
              {
                title: 'Active Drivers',
                value: drivers.length,
                icon: <DirectionsCar />,
                color: theme.gradients?.success,
              },
              {
                title: 'Reviews',
                value: bonusCounts.review,
                icon: <ReviewsOutlined />,
                color: theme.gradients?.warning,
              },
              {
                title: 'Customer Bonuses',
                value: bonusCounts.customer,
                icon: <PhotoCamera />,
                color: theme.gradients?.purple,
              },
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    borderRadius: 3,
                    background: stat.color,
                    color: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>{stat.icon}</Box>
                    <Typography variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Enhanced Bonus Section */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                height: '100%',
                border: '1px solid rgba(33, 150, 243, 0.1)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <PhotoCamera
                    sx={{ mr: 1, fontSize: '2rem', color: 'primary.main' }}
                  />
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Bonus Uploads
                  </Typography>
                </Box>

                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 2,
                      }}
                    >
                      <ReviewsOutlined color="primary" sx={{ mb: 1 }} />
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary"
                      >
                        {bonusCounts.review}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reviews
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 2,
                      }}
                    >
                      <PhotoCamera color="secondary" sx={{ mb: 1 }} />
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="secondary"
                      >
                        {bonusCounts.customer}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Customer Photos
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: 'success.light',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="black">
                    Total Bonus: $
                    {bonusCounts.review * 20 + bonusCounts.customer * 5}
                  </Typography>
                </Paper>

                <BonusUpload
                  onCountUpdate={(counts) => setBonusCounts(counts)}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Date Filter Section */}
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }}
          >
            <Stack spacing={3}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <DateRange color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Filter Deliveries by Date
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                  alignItems: 'center',
                }}
              >
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
                        onChange={(newValue) => setStartDate(newValue)}
                        renderInput={(params) => (
                          <TextField {...params} size="small" />
                        )}
                      />
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        renderInput={(params) => (
                          <TextField {...params} size="small" />
                        )}
                      />
                    </Stack>
                  </Box>
                </LocalizationProvider>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {deliveries.length} of {totalDeliveries} deliveries
                  (Page {page} of {totalPages})
                  {startDate &&
                    endDate &&
                    ` • Filtered: ${format(
                      startDate,
                      'MMM dd, yyyy'
                    )} to ${format(endDate, 'MMM dd, yyyy')}`}
                </Typography>
                {loading && <CircularProgress size={20} />}
              </Box>
            </Stack>
          </Paper>

          {/* Enhanced Deliveries Section */}
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                p: 3,
                background: theme.gradients?.success,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h5" fontWeight={600}>
                Delivery Management
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {totalDeliveries} total deliveries
                </Typography>
              </Box>
            </Box>
            <Box sx={{ p: 3 }}>
              {loading ? (
                <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                  {[...Array(4)].map((_, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{ height: 300, borderRadius: 3 }}>
                        <CardContent>
                          <Skeleton variant="text" height={32} />
                          <Skeleton variant="text" height={24} />
                          <Skeleton variant="text" height={24} />
                          <Skeleton
                            variant="rectangular"
                            height={40}
                            sx={{ mt: 2 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : deliveries.length > 0 ? (
                <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                  {deliveries.map((delivery) => (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      key={delivery._id}
                      sx={{ display: 'flex' }}
                    >
                      <ManagerDeliveryCard
                        user={user}
                        delivery={delivery}
                        drivers={drivers}
                        onAssignDriver={onAssignDriver}
                        onStatusChange={handleStatusChange}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Assignment
                    sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No deliveries found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {startDate || endDate
                      ? 'Try adjusting your date filters'
                      : 'No deliveries available'}
                  </Typography>
                </Box>
              )}

              {/* Add Pagination Controls */}
              {!loading && deliveries.length > 0 && totalPages > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 4,
                    gap: 2,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </Container>
  );
};

export default ManagerDashboardLayout;
