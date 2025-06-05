// Updated SalesDashboard.jsx to include driver assignment, lease return visibility, status refresh, and responsive layout

import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Button,
  CircularProgress, Dialog, Box, Paper, Stack, TextField, MenuItem, Chip, Pagination, Grid
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Topbar from '../../components/Topbar';
import EditDeliveryForm from './EditDeliveryForm';
import NewDeliveryForm from './CreateDelivery';

const api = process.env.REACT_APP_API_URL;
const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f'];
const itemsPerPage = 5;

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
      const res = await fetch(`${api}/api/delivery/deliveries`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
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
    const normalize = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const isSameDay = (d1, d2) => normalize(d1).getTime() === normalize(d2).getTime();

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
    setDeliveries((prev) => prev.map((d) => (d._id === updatedDelivery._id ? updatedDelivery : d)));
    setEditOpen(false);
  };

  const deliveriesPerDay = filteredDeliveries.reduce((acc, d) => {
    const date = new Date(d.deliveryDate).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const paymentMethods = filteredDeliveries.reduce((acc, d) => {
    if (d.codMethod) acc[d.codMethod] = (acc[d.codMethod] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(deliveriesPerDay).map(([date, count]) => ({ date, deliveries: count }));
  const pieData = Object.entries(paymentMethods).map(([name, value]) => ({ name, value }));

  const paginatedDeliveries = filteredDeliveries.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <>
      <Topbar />
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom align="center">🚚 Sales Dashboard</Typography>

        <Box display="flex" flexWrap="wrap" justifyContent="space-between" gap={2} mb={3}>
          <Button variant="contained" color="primary" onClick={() => setCreateOpen(true)}>
            ➕ Create Delivery
          </Button>
          <TextField
            select
            label="Filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size="small"
            sx={{ width: { xs: '100%', sm: 180 } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
          </TextField>
          <Button onClick={fetchDeliveries} variant="outlined" color="secondary">
            🔄 Refresh Deliveries
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>
        ) : (
          <Stack spacing={5}>
            <Grid container spacing={2}>
              {paginatedDeliveries.map((delivery) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={delivery._id}>
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {delivery.customerName || 'Unnamed Customer'}
                        </Typography>
                        <Chip label={delivery.status || 'No Status'} color="primary" size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">📍 {delivery.address}</Typography>
                      <Typography variant="body2" color="text.secondary">📅 {new Date(delivery.deliveryDate).toLocaleString()}</Typography>
                      {delivery.driver?.name && (
                        <Typography variant="body2" color="text.secondary">👤 Driver: {delivery.driver.name}</Typography>
                      )}
                      {delivery.leaseReturn?.willReturn ? (
                        <Chip label="Lease Return" size="small" color="warning" sx={{ mt: 1 }} />
                      ) : (
                        <Chip label="No Lease Return" size="small" color="default" sx={{ mt: 1 }} />
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        🚗 {delivery.year} {delivery.make} {delivery.model} {delivery.trim} - {delivery.color}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        💵 ${delivery.codAmount} {delivery.codCollected ? `(via ${delivery.codMethod})` : '(Pending)'}
                      </Typography>
                      <Button variant="outlined" size="small" sx={{ mt: 2 }} fullWidth onClick={() => handleOpenEdit(delivery)}>
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box display="flex" justifyContent="center">
              <Pagination
                count={Math.ceil(filteredDeliveries.length / itemsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>

            <Box display="flex" flexWrap="wrap" gap={4}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>📊 Deliveries Per Day</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="deliveries" fill="#3f51b5" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, flex: 1, minWidth: 300 }}>
                <Typography variant="h6" gutterBottom>💵 COD Methods</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Box>
          </Stack>
        )}

        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          {selectedDelivery && (
            <EditDeliveryForm
              delivery={selectedDelivery}
              onClose={() => setEditOpen(false)}
              onSuccess={handleDeliveryUpdated}
            />
          )}
        </Dialog>

        <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
          <NewDeliveryForm
            onClose={() => setCreateOpen(false)}
            onSuccess={(newDelivery) => {
              setDeliveries((prev) => [...prev, newDelivery]);
              setCreateOpen(false);
            }}
          />
        </Dialog>
      </Container>
    </>
  );
};

export default SalesDashboard;
