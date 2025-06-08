// Updated SalesDashboard.jsx to include driver assignment, lease return visibility, status refresh, and responsive layout

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
  MenuItem,
  Chip,
  Pagination,
  Grid,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import Topbar from '../../components/Topbar';
import EditDeliveryForm from './EditDeliveryForm';
import NewDeliveryForm from './CreateDelivery';

const api = process.env.REACT_APP_API_URL;
const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f'];
const itemsPerPage = 4;

const SalesDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      to.setHours(23, 59, 59, 999);
      const res = await fetch(
        `${api}/api/delivery/deliveries?start=${from.toISOString()}&end=${to.toISOString()}`,
        {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        }
      );
      const data = await res.json();
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch deliveries', err);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    const now = new Date();
    const normalize = (date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const isSameDay = (d1, d2) =>
      normalize(d1).getTime() === normalize(d2).getTime();

    const filtered = deliveries.filter((d) => {
      const date = new Date(d.deliveryDate);
      switch (filter) {
        case 'today':
          return isSameDay(date, now);
        case 'week': {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return date >= weekAgo && date <= now;
        }
        case 'month': {
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          return date >= monthAgo && date <= now;
        }
        default:
          return true;
      }
    });
    setFilteredDeliveries(filtered);
    setPage(1);
  }, [filter, deliveries]);

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

  const paginatedDeliveries = filteredDeliveries.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Topbar />
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
          Sales Dashboard
        </Typography>

        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="right"
          gap={2}
          mb={3}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => setCreateOpen(true)}
          >
            ➕ Create Delivery
          </Button>
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
        ) : (
          <Stack spacing={4}>
            <Grid container spacing={3}>
              {paginatedDeliveries.map((delivery) => (
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
                          delivery.codCollected ? 'success.main' : 'error.main'
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
              ))}
            </Grid>

            {/* Pagination */}
            <Box display="flex" justifyContent="center">
              <Pagination
                count={Math.ceil(filteredDeliveries.length / itemsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
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
