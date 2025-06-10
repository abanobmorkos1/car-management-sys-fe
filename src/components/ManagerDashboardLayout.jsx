import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Pagination,
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import {
  Assignment,
  DirectionsCar,
  ReviewsOutlined,
  PhotoCamera,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Topbar from './Topbar';
import ManagerDeliveryCard from './ManagerDeliveryCard';
import BonusUpload from '../pages/Driver/BonusUpload';

const ManagerDashboardLayout = ({
  user,
  deliveries = [],
  drivers = [],
  onAssignDriver = () => {},
  handleStatusChange,
  showGallery,
  setShowGallery,
  triggerInitialBonusFetch,
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;

  const [bonusCounts, setBonusCounts] = useState({ review: 0, customer: 0 });

  const handleBonusUpdate = (updatedCounts) => {
    if (
      updatedCounts?.review !== undefined &&
      updatedCounts?.customer !== undefined
    ) {
      setBonusCounts(updatedCounts);
    }
  };

  const pageCount = Math.ceil(deliveries.length / itemsPerPage);
  const paginatedDeliveries = deliveries.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

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
                value: deliveries.length,
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
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {deliveries.length} total deliveries
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {paginatedDeliveries.length > 0 ? (
                <>
                  <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                    {paginatedDeliveries.map((delivery) => (
                      <Grid
                        item
                        xs={12}
                        md={6}
                        key={delivery._id}
                        sx={{ display: 'flex' }}
                      >
                        <ManagerDeliveryCard
                          delivery={delivery}
                          drivers={drivers}
                          onAssignDriver={onAssignDriver}
                          onStatusChange={handleStatusChange}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {pageCount > 1 && (
                    <Box mt={4} display="flex" justifyContent="center">
                      <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
                        <Pagination
                          count={pageCount}
                          page={page}
                          onChange={(e, value) => setPage(value)}
                          color="primary"
                          size="large"
                        />
                      </Paper>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Assignment
                    sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    No deliveries found
                  </Typography>
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
