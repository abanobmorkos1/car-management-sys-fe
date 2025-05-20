import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, Button, Grid, Paper, Card, CardContent, Divider
} from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import { LocalShipping, AttachMoney, AddBox } from '@mui/icons-material';

const api = process.env.REACT_APP_API_URL;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SalesDashboard = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
  const fetchDeliveries = async () => {
    try {
      const res = await fetch(`${api}/api/delivery/deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setDeliveries(data);
      } else {
        console.error('Unexpected response:', data);
        setDeliveries([]); // fallback to empty array to avoid reduce crash
      }
    } catch (err) {
      console.error('Failed to fetch deliveries', err);
      setDeliveries([]); // again, fallback to empty array
    }
  };

  if (token) fetchDeliveries(); // only run if token exists
}, [token]);

  const deliveriesPerDay = deliveries.reduce((acc, d) => {
    const date = new Date(d.deliveryDate).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const paymentMethods = deliveries.reduce((acc, d) => {
    if (d.codMethod) acc[d.codMethod] = (acc[d.codMethod] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(deliveriesPerDay).map(([date, count]) => ({ date, deliveries: count }));
  const pieData = Object.entries(paymentMethods).map(([name, value]) => ({ name, value }));

  return (
    <>
      <Topbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          📈 Sales Dashboard
        </Typography>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, textAlign: 'center', boxShadow: 3 }}>
              <CardContent>
                <LocalShipping fontSize="large" color="primary" />
                <Typography variant="h6" mt={1}>Total Deliveries</Typography>
                <Typography variant="h4">{deliveries.length}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, textAlign: 'center', boxShadow: 3 }}>
              <CardContent>
                <AttachMoney fontSize="large" color="success" />
                <Typography variant="h6" mt={1}>Collected CODs</Typography>
                <Typography variant="h4">
                  {deliveries.filter(d => d.codCollected).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, textAlign: 'center', boxShadow: 3 }}>
              <CardContent>
                <AddBox fontSize="large" color="secondary" />
                <Typography variant="h6" mt={1}>Create Delivery</Typography>
                <Button variant="contained" onClick={() => navigate('/sales/post-delivery')} sx={{ mt: 1 }}>
                  New Delivery
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom>📅 Deliveries Per Day</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="deliveries" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom>💳 Payment Methods</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default SalesDashboard;
