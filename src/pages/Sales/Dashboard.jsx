import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { AuthContext } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar'; // ✅ Import Topbar


const api = process.env.API_URL
const SalesDashboard = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/delivery/deliveries`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setDeliveries(data);
      } catch (err) {
        console.error('Failed to fetch deliveries', err);
      }
    };

    fetchDeliveries();
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

  const barData = Object.keys(deliveriesPerDay).map(date => ({ date, deliveries: deliveriesPerDay[date] }));
  const pieData = Object.keys(paymentMethods).map(method => ({ name: method, value: paymentMethods[method] }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <>
      <Topbar /> {/* ✅ Topbar added */}
      <Container sx={{ mt: 5 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Salesperson Dashboard
        </Typography>

        <Grid container spacing={4}>
          {/* Bar Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>Deliveries Per Day</Typography>
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

          {/* Pie Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>Payment Methods</Typography>
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

        {/* Button to Create New Delivery */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/delivery/new')}>
            Create New Delivery
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default SalesDashboard;
