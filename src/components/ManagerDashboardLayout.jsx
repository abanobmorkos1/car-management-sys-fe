import React, { useState , useEffect} from 'react';
import {
  Box,
  Container,
  Typography,
  Divider,
  Pagination,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import Topbar from './Topbar';
import ManagerDeliveryCard from './ManagerDeliveryCard';
import BonusUpload from '../pages/Driver/BonusUpload';
import BonusGallery from '../components/BonusGallery';


const ManagerDashboardLayout = ({
  user,
  deliveries = [],
  drivers = [],
  onAssignDriver = () => {},
  handleStatusChange,
  showGallery,
  setShowGallery,
  triggerInitialBonusFetch
}) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [bonusCounts, setBonusCounts] = useState({ review: 0, customer: 0 });

  const handleBonusUpdate = (updatedCounts) => {
    if (updatedCounts?.review !== undefined && updatedCounts?.customer !== undefined) {
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
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/driver/my-uploads`, {
          credentials: 'include'
        });

        const data = await res.json();
        const reviewCount = data.filter(u => u.type === 'review').length;
        const customerCount = data.filter(u => u.type === 'customer').length;

        handleBonusUpdate({ review: reviewCount, customer: customerCount });
      } catch (err) {
        console.error('🔴 Initial bonus count fetch failed:', err);
      }
    };

    fetchInitialCounts();
  }
}, [triggerInitialBonusFetch]);

  return (
    <>
      <Topbar />
      <Box sx={{ backgroundColor: '#f9fafb', minHeight: '100vh', py: 3 }}>
        <Container maxWidth="sm">
          <Typography variant="h5" fontWeight="bold" color="primary" mb={3} textAlign="center">
            Manager Dashboard
          </Typography>

          {paginatedDeliveries.length > 0 ? (
            paginatedDeliveries.map(del => (
              <Box key={del._id} mb={2}>
                <ManagerDeliveryCard
                  delivery={del}
                  drivers={drivers}
                  user={user}
                  onAssignDriver={onAssignDriver}
                  onStatusChange={handleStatusChange}
                />
              </Box>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No deliveries found.
            </Typography>
          )}

          {pageCount > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Bonus Upload Section */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2, bgcolor: '#ffffff' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Bonus Uploads
                  </Typography>
                  <Typography variant="body2" mb={0.5}>
                    Review Photos: <strong>{bonusCounts.review}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Customer Photos: <strong>{bonusCounts.customer}</strong>
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold" mt={1}>
                    Total Bonus: ${bonusCounts.review * 20 + bonusCounts.customer * 5}
                  </Typography>
                  <Box mt={2}>
                    <BonusUpload onCountUpdate={handleBonusUpdate} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {showGallery && (
            <Box mt={4}>
              <BonusGallery />
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default ManagerDashboardLayout;
