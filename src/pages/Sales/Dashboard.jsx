import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Button,
  CircularProgress, Dialog, Box, Paper, Stack
} from '@mui/material';
import Topbar from '../../components/Topbar';
import EditDeliveryForm from './EditDeliveryForm';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const api = process.env.REACT_APP_API_URL;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SalesDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${api}/api/delivery/deliveries`, {
          credentials: 'include'
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
    fetchDeliveries();
  }, []);

  const handleOpenEdit = (delivery) => {
    setSelectedDelivery(delivery);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setSelectedDelivery(null);
  };

  const handleDeliveryUpdated = (updatedDelivery) => {
    setDeliveries(prev =>
      prev.map(d => (d._id === updatedDelivery._id ? updatedDelivery : d))
    );
    handleCloseEdit();
  };

  const deliveriesPerDay = deliveries.reduce((acc, d) => {
    const date = new Date(d.deliveryDate).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const paymentMethods = deliveries.reduce((acc, d) => {
    if (d.codMethod) acc[d.codMethod] = (acc[d.codMethod] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(deliveriesPerDay).map(([date, count]) => ({
    date,
    deliveries: count
  }));

  const pieData = Object.entries(paymentMethods).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <>
      <Topbar />
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🚚 Sales Dashboard
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={10}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={5}>
            {/* Deliveries Grid */}
            <Grid container spacing={3}>
              {deliveries.map((delivery) => (
                <Grid item xs={12} sm={6} md={4} key={delivery._id}>
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {delivery.customerName || 'Unnamed Customer'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {delivery.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        📅 {new Date(delivery.deliveryDate).toLocaleString()}
                      </Typography>

                      {delivery.driver && (
                        <Box>
                          <Typography variant="body2">Driver: {delivery.driver.name}</Typography>
                          <Typography variant="body2">📞 {delivery.driver.phoneNumber}</Typography>
                        </Box>
                      )}

                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={() => handleOpenEdit(delivery)}
                      >
                        Edit
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    📊 Deliveries Per Day
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="deliveries" fill="#3f51b5" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    💵 COD Methods
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        )}

        {/* ✏️ Edit Dialog */}
        <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
          {selectedDelivery && (
            <EditDeliveryForm
              delivery={selectedDelivery}
              onClose={handleCloseEdit}
              onSuccess={handleDeliveryUpdated}
            />
          )}
        </Dialog>
      </Container>
    </>
  );
};

export default SalesDashboard;
