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
  Snackbar,
  Alert,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Assignment,
  DirectionsCar,
  ReviewsOutlined,
  PhotoCamera,
  Search,
  DateRange,
  AttachMoney,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Topbar from './Topbar';
import ManagerDeliveryCard from './ManagerDeliveryCard';
import BonusUpload from '../pages/Driver/BonusUpload';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import ClockApprovalCard from './ClockApprovalCard';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ManagerDashboardLayout = ({
  drivers = [],
  user,
  onAssignDriver = () => {},
  handleStatusChange,
  triggerInitialBonusFetch,
  pendingRequests = [],
  onApprove = () => {},
  onReject = () => {},
}) => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const theme = useTheme();
  const [deliveries, setDeliveries] = useState([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bonusCounts, setBonusCounts] = useState({ review: 0, customer: 0 });
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Add pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  // Collapsible sections state
  const [sectionsExpanded, setSectionsExpanded] = useState({
    stats: false,
    quickActions: false,
    bonusUploads: false,
    deliveries: false,
    pendingClockIns: false,
  });

  const toggleSection = (section) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const api = process.env.REACT_APP_API_URL;

  const handleBonusUpdate = (updatedCounts) => {
    if (
      updatedCounts?.review !== undefined &&
      updatedCounts?.customer !== undefined
    ) {
      setBonusCounts(updatedCounts);
    }
  };
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
          const lastFriday = new Date();
          lastFriday.setDate(
            lastFriday.getDate() - ((lastFriday.getDay() + 2) % 7)
          );
          lastFriday.setHours(0, 0, 0, 0);
          const lastFridayISO = lastFriday.toISOString();
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/driver/my-uploads?startDate=${lastFridayISO}`,
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

          <Paper
            elevation={2}
            sx={{ mt: 4, mb: 4, borderRadius: 3, overflow: 'hidden' }}
          >
            {/* Date Filter Section */}

            <Box
              sx={{
                p: 3,
                background: theme.gradients?.success,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
              }}
              onClick={() => toggleSection('deliveries')}
            >
              <Typography variant="h5" fontWeight={600}>
                Delivery Management
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {totalDeliveries} total deliveries
                </Typography>
                <IconButton size="small" sx={{ color: 'white' }}>
                  {sectionsExpanded.deliveries ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </IconButton>
              </Box>
            </Box>
            <Collapse in={sectionsExpanded.deliveries}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  mb: 4,
                }}
              >
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DateRange color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Filter Deliveries by Date
                    </Typography>
                  </Box>

                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        alignItems: { xs: 'stretch', sm: 'center' },
                      }}
                    >
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            fullWidth
                            sx={{ minWidth: { xs: 'auto', sm: 200 } }}
                          />
                        )}
                      />
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            fullWidth
                            sx={{ minWidth: { xs: 'auto', sm: 200 } }}
                          />
                        )}
                      />
                    </Box>
                  </LocalizationProvider>

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Showing {deliveries.length} of {totalDeliveries}{' '}
                      deliveries (Page {page} of {totalPages})
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
            </Collapse>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              mb: 4,
              borderRadius: 3,
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
                background: theme.gradients?.info,
                color: 'white',
                '&:hover': { opacity: 0.9 },
              }}
              onClick={() => toggleSection('stats')}
            >
              <Typography variant="h6" fontWeight="bold">
                📊 Dashboard Statistics
              </Typography>
              <IconButton size="small" sx={{ color: 'white' }}>
                {sectionsExpanded.stats ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            <Collapse in={sectionsExpanded.stats}>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
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
              </Box>
            </Collapse>
          </Paper>

          <Grid container spacing={4}>
            {/* Quick Actions - Collapsible */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                  height: 'fit-content',
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
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                  }}
                  onClick={() => toggleSection('quickActions')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment color="primary" />
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Quick Actions
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    {sectionsExpanded.quickActions ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </IconButton>
                </Box>
                <Collapse in={sectionsExpanded.quickActions}>
                  <Box sx={{ px: 3, pb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={<DirectionsCar />}
                          onClick={() => navigate('/new-car')}
                          sx={{
                            py: 2,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            background:
                              'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 4,
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Post New Car
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={<Assignment />}
                          onClick={() => navigate('/lease/create')}
                          sx={{
                            py: 2,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            background:
                              'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 4,
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Lease Return
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={<AttachMoney />}
                          onClick={() => navigate('/driver/cod/new')}
                          sx={{
                            py: 2,
                            borderRadius: 2,
                            fontWeight: 'bold',
                            background:
                              'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 4,
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Create COD
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Paper>
            </Grid>

            {/* Bonus Uploads - Collapsible */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={4}
                sx={{
                  borderRadius: 3,
                  background:
                    'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                  height: 'fit-content',
                  border: '1px solid rgba(33, 150, 243, 0.1)',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                  }}
                  onClick={() => toggleSection('bonusUploads')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhotoCamera
                      sx={{ fontSize: '2rem', color: 'primary.main' }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Bonus Uploads
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    {sectionsExpanded.bonusUploads ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </IconButton>
                </Box>
                <Collapse in={sectionsExpanded.bonusUploads}>
                  <CardContent sx={{ pt: 0 }}>
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
                </Collapse>
              </Card>
            </Grid>
          </Grid>

          <Paper
            elevation={3}
            sx={{
              mt: 4,
              borderRadius: 3,
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
                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
              }}
              onClick={() => toggleSection('pendingClockIns')}
            >
              <Typography variant="h6" fontWeight="bold">
                📝 Pending Clock-Ins ({pendingRequests?.length || 0})
              </Typography>
              <IconButton size="small">
                {sectionsExpanded.pendingClockIns ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
              </IconButton>
            </Box>
            <Collapse in={sectionsExpanded.pendingClockIns}>
              <Box sx={{ px: 3, pb: 3 }}>
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
              </Box>
            </Collapse>
          </Paper>
        </Container>
      </Box>

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
  );
};

export default ManagerDashboardLayout;
