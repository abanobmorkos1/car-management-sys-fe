import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip,
  Avatar,
  Paper,
  TextField,
  Stack,
  Pagination,
  CircularProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  DirectionsCar,
  Assignment,
  AttachMoney,
  AccessTime,
  TrendingUp,
  PhotoCamera,
  ReviewsOutlined,
  DateRange,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import DriverDeliveryCard from '../components/DriverDeliveryCard';
import BonusUpload from '../pages/Driver/BonusUpload';
import BonusGallery from '../components/BonusGallery';
import { useNavigate } from 'react-router-dom';

const ClockStatusMessage = ({ clockInStatus }) => {
  if (!clockInStatus?.status) return null;

  const statusConfig = {
    pending: {
      color: 'warning.main',
      icon: '⏳',
      message: 'Waiting for approval...',
      bgColor: 'warning.light',
      textColor: 'warning.dark',
    },
    approved: {
      color: 'success.main',
      icon: '✅',
      message: 'You are clocked in',
      bgColor: 'success.light',
      textColor: 'success.dark',
    },
    rejected: {
      color: 'error.main',
      icon: '❌',
      message: 'Clock-in rejected. Contact management.',
      bgColor: 'error.light',
      textColor: 'error.dark',
    },
  };

  const config = statusConfig[clockInStatus.status];
  if (!config) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2,
        bgcolor: config.bgColor,
        borderRadius: 2,
        border: `1px solid ${config.color}`,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: config.textColor,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <span style={{ fontSize: '1.2em' }}>{config.icon}</span>
        {config.message}
      </Typography>
    </Paper>
  );
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
  filter,
  setFilter,
  deliveries,
  navigate,
  weeklyEarnings,
  dailyBreakdown,
  lastSessionEarnings,
  submittingClockIn,
  showGallery,
  setShowGallery,
  startDate,
  endDate,
  onDateChange,
  page,
  totalPages,
  onPageChange,
  loading,
}) => {
  const [bonusCounts, setBonusCounts] = useState({ review: 0, customer: 0 });
  const base = weeklyEarnings?.baseEarnings || 0;
  const bonus = bonusCounts.review * 20 + bonusCounts.customer * 5;
  const total = base + bonus;

  const [sectionsExpanded, setSectionsExpanded] = useState({
    quickActions: false,
    timeEarnings: false,
    bonusUploads: false,
    deliveries: false,
    weeklyBreakdown: false,
    bonusGallery: false,
  });

  const toggleSection = (section) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    const fetchBonusCounts = async () => {
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
        const customerCount = data.filter((u) => u.type === 'customer').length;
        setBonusCounts({ review: reviewCount, customer: customerCount });
      } catch (err) {
        console.error('❌ Failed to fetch bonus counts', err);
      }
    };
    fetchBonusCounts();
  }, []);
  console.log({ clockInStatus });
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f0f4f8 0%, #e0e7ff 100%)',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={4}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '2rem',
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || '👤'}
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="primary" mb={1}>
              Welcome back, {user?.name?.split(' ')[0] || 'Driver'}!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Driver Dashboard
            </Typography>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              mb: 4,
              borderRadius: 3,
              bgcolor: 'background.paper',
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
              onClick={() => toggleSection('quickActions')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment color="primary" />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
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

          <Grid container spacing={3}>
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
                  onClick={() => toggleSection('timeEarnings')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime
                      sx={{ fontSize: '2rem', color: 'primary.main' }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Time & Earnings
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    {sectionsExpanded.timeEarnings ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )}
                  </IconButton>
                </Box>
                <Collapse in={sectionsExpanded.timeEarnings}>
                  <CardContent sx={{ pt: 0 }}>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      mb={1}
                      color="primary.main"
                    >
                      {isClockedIn
                        ? `${Math.floor(secondsWorked / 3600)}h ${Math.floor(
                            (secondsWorked % 3600) / 60
                          )}m`
                        : `${Number(totalHours || 0).toFixed(1)} hrs`}
                    </Typography>

                    <Box mb={3}>
                      <Typography variant="h6" mb={1} color="text.primary">
                        Weekly Earnings: ${total.toFixed(2)}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                          label={`Base: $${base.toFixed(2)}`}
                          size="small"
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'white',
                          }}
                        />
                        <Chip
                          label={`Bonus: $${bonus.toFixed(2)}`}
                          size="small"
                          sx={{
                            bgcolor: 'success.light',
                            color: 'black',
                          }}
                        />
                      </Box>
                    </Box>

                    {lastSessionEarnings !== null && (
                      <Typography
                        variant="body2"
                        sx={{ mb: 2, color: 'text.secondary' }}
                      >
                        🕓 Last session:{' '}
                        <strong>${lastSessionEarnings.toFixed(2)}</strong>
                      </Typography>
                    )}
                    {clockInStatus?.status !== 'pending' && (
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleClockInOut}
                        disabled={
                          submittingClockIn ||
                          clockInStatus?.status === 'pending'
                        }
                        sx={{
                          py: 2,
                          borderRadius: 2,
                          fontWeight: 'bold',
                          bgcolor: submittingClockIn
                            ? 'grey.400'
                            : isClockedIn &&
                                clockInStatus?.status === 'approved'
                              ? 'error.main'
                              : clockInStatus?.status === 'pending'
                                ? 'warning.main'
                                : 'success.main',
                          '&:hover': {
                            transform: submittingClockIn
                              ? 'none'
                              : 'translateY(-2px)',
                            boxShadow: submittingClockIn ? 'none' : 4,
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {isClockedIn && clockInStatus?.status === 'approved'
                          ? 'Clock Out'
                          : 'Clock In'}
                      </Button>
                    )}

                    <ClockStatusMessage clockInStatus={clockInStatus} />
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>

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
              bgcolor: 'background.paper',
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
              onClick={() => toggleSection('deliveries')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment color="primary" />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Deliveries
                </Typography>
              </Box>
              <IconButton size="small">
                {sectionsExpanded.deliveries ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            <Collapse in={sectionsExpanded.deliveries}>
              <Box sx={{ px: 3, pb: 3 }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background:
                      'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <DateRange color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Filter Deliveries by Date
                    </Typography>
                  </Box>

                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack spacing={2}>
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
                          onChange={(newValue) =>
                            onDateChange(newValue, endDate)
                          }
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
                          onChange={(newValue) =>
                            onDateChange(startDate, newValue)
                          }
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
                    </Stack>
                  </LocalizationProvider>
                </Paper>

                <Box display="flex" justifyContent="center" mb={3}>
                  <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={(e, val) => val && setFilter(val)}
                    sx={{
                      '& .MuiToggleButton-root': {
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        border: 'none',
                        bgcolor: 'grey.100',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        },
                        '&:hover': {
                          bgcolor: 'grey.200',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="assigned">
                      Assigned ({counts?.assigned || 0})
                    </ToggleButton>
                    <ToggleButton value="all">
                      All ({counts?.total || 0})
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {loading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="300px"
                  >
                    <CircularProgress />
                  </Box>
                ) : deliveries.length > 0 ? (
                  <>
                    <Grid container spacing={2}>
                      {deliveries.map((del) => (
                        <Grid item xs={12} key={del._id}>
                          <DriverDeliveryCard
                            delivery={del}
                            onStatusChange={handleStatusChange}
                            userId={user?._id}
                            navigate={navigate}
                          />
                        </Grid>
                      ))}
                    </Grid>

                    {totalPages > 1 && (
                      <Box display="flex" justifyContent="center" mt={3}>
                        <Pagination
                          count={totalPages}
                          page={page}
                          onChange={onPageChange}
                          color="primary"
                          size="large"
                        />
                      </Box>
                    )}
                  </>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      No deliveries found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {startDate || endDate
                        ? 'Try adjusting your date filters'
                        : 'Check back later for new assignments'}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Collapse>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              mt: 4,
              borderRadius: 3,
              bgcolor: 'background.paper',
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
              onClick={() => toggleSection('weeklyBreakdown')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Weekly Breakdown
                </Typography>
              </Box>
              <IconButton size="small">
                {sectionsExpanded.weeklyBreakdown ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
              </IconButton>
            </Box>
            <Collapse in={sectionsExpanded.weeklyBreakdown}>
              <Box sx={{ px: 3, pb: 3 }}>
                {dailyBreakdown.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No data available for this week
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={2}>
                    {dailyBreakdown.map((day) => (
                      <Grid item xs={12} sm={6} md={4} key={day.date}>
                        <Card
                          elevation={2}
                          sx={{ borderRadius: 2, height: '100%' }}
                        >
                          <CardContent>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              mb={1}
                            >
                              {day.date}
                            </Typography>
                            <Box
                              display="flex"
                              flexDirection="column"
                              gap={0.5}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                ⏱ {day.totalHours} hours
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                💰 ${day.baseEarnings.toFixed(2)} base
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                🎁 ${day.bonus.toFixed(2)} bonus
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="primary"
                              >
                                ${day.totalEarnings.toFixed(2)}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Collapse>
          </Paper>

          {showGallery && (
            <Paper
              elevation={3}
              sx={{
                mt: 4,
                borderRadius: 3,
                bgcolor: 'background.paper',
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
                onClick={() => toggleSection('bonusGallery')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhotoCamera color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Bonus Gallery
                  </Typography>
                </Box>
                <IconButton size="small">
                  {sectionsExpanded.bonusGallery ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </IconButton>
              </Box>
              <Collapse in={sectionsExpanded.bonusGallery}>
                <Box sx={{ px: 3, pb: 3 }}>
                  <BonusGallery />
                </Box>
              </Collapse>
            </Paper>
          )}
        </Container>
      </Box>
    </Container>
  );
};

export default DriverDashboardLayout;
