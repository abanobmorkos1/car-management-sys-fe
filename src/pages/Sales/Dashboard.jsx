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
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import Topbar from '../../components/Topbar';
import EditDeliveryForm from './EditDeliveryForm';
import NewDeliveryForm from './CreateDelivery';

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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

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

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    fetchDeliveries(1, startDate, endDate);
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
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
            </Stack>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateOpen(true)}
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
            <Grid container spacing={3}>
              {deliveries.length ? (
                deliveries.map((delivery) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={delivery._id}>
                    <Card elevation={3} sx={{ borderRadius: 4, p: 2 }}>
                      <CardContent>
                        {/* Header: Customer Name + Status */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="h6" fontWeight={700} noWrap>
                            {delivery.customerName || 'Unnamed Customer'}
                          </Typography>
                          <Chip
                            label={delivery.status || 'No Status'}
                            size="small"
                            color={
                              delivery.status === 'Delivered'
                                ? 'success'
                                : delivery.status === 'Heading to Customer'
                                  ? 'primary'
                                  : delivery.status === 'Waiting for Paperwork'
                                    ? 'warning'
                                    : delivery.status === 'In Route for Pick Up'
                                      ? 'info'
                                      : 'default'
                            }
                          />
                        </Box>

                        {/* Delivery Date */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Delivery Date:{' '}
                          {new Date(delivery.deliveryDate).toLocaleString()}
                        </Typography>

                        {/* Address */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Address: {delivery.address}
                        </Typography>

                        {/* Driver */}
                        {delivery.driver?.name && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={500}
                          >
                            Driver: {delivery.driver.name}
                          </Typography>
                        )}

                        {/* Vehicle */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Vehicle: {delivery.year} {delivery.make}{' '}
                          {delivery.model} {delivery.trim} - {delivery.color}
                        </Typography>

                        {/* COD Info */}
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

                        {/* Lease Return */}
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

                        {/* View Button */}
                        <Button
                          variant="contained"
                          fullWidth
                          size="small"
                          sx={{ mt: 2, fontWeight: 600 }}
                          onClick={() => handleOpenEdit(delivery)}
                        >
                          View Details
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

            {/* Pagination */}
            <Box display="flex" justifyContent="center">
              <Pagination
                count={Math.ceil(totalDeliveries / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
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
