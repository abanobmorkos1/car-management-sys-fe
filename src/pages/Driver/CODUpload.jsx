import React, { useState, useEffect } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Box, Grid, MenuItem,
  CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const api = process.env.REACT_APP_API_URL;

const uploadToS3 = async (file, category, customerName) => {
  const res = await fetch(`${api}/api/s3/generate-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      uploadCategory: category,
      meta: { customerName }
    })
  });

  const { uploadUrl, key } = await res.json();

  await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  });

  return key;
};

const NewCOD = ({ prefill = null, fromDelivery = false }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: '', phoneNumber: '', address: '', amount: '',
    method: 'None', salesperson: '', driver: '', delivery: '',
    car: { year: '', make: '', model: '', trim: '', color: '' }
  });

  const [salespeople, setSalespeople] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [contractPicture, setContractPicture] = useState(null);
  const [checkPicture, setCheckPicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (prefill) {
      setForm({
        customerName: prefill.customerName || '',
        phoneNumber: prefill.phoneNumber || '',
        address: prefill.address || '',
        amount: prefill.amount || prefill.codAmount || 0,
        method: prefill.method || prefill.codMethod || 'None',
        salesperson: prefill.salesperson?._id || prefill.salesperson || '',
        driver: prefill.driver?._id || prefill.driver || '',
        delivery: prefill._id || '',
        car: {
          year: prefill.car?.year || prefill.year || '',
          make: prefill.car?.make || prefill.make || '',
          model: prefill.car?.model || prefill.model || '',
          trim: prefill.car?.trim || prefill.trim || '',
          color: prefill.car?.color || prefill.color || ''
        }
      });
    }
  }, [prefill]);

  useEffect(() => {
    if (!fromDelivery) {
      const fetchUsers = async () => {
        const [salesRes, driverRes] = await Promise.all([
          fetch(`${api}/api/users/salespeople`, { credentials: 'include' }),
          fetch(`${api}/api/users/drivers`, { credentials: 'include' })
        ]);

        if (salesRes.ok) setSalespeople(await salesRes.json());
        if (driverRes.ok) setDrivers(await driverRes.json());
      };
      fetchUsers();
    }
  }, [fromDelivery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev =>
      name in prev.car
        ? { ...prev, car: { ...prev.car, [name]: value } }
        : { ...prev, [name]: value }
    );
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

  try {
    if (!contractPicture) throw new Error('Contract picture is required');

    const contractKey = await uploadToS3(contractPicture, 'cod', form.customerName);
    const checkKey = form.method === 'Check' && checkPicture
      ? await uploadToS3(checkPicture, 'cod', form.customerName)
      : null;

    const res = await fetch(`${api}/cod/newcod`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: form.customerName,
        phoneNumber: form.phoneNumber,
        address: form.address,
        amount: Number(form.amount || 0),
        method: form.method,
        contractKey,
        checkKey,
        salesperson: form.salesperson,
        driver: form.driver,
        delivery: form.delivery,
        car: form.car
      })
    });

    const data = await res.json();
if (res.ok) {
  setSuccess('COD created successfully!');

  // ✅ Update delivery to reflect COD collection
  if (form.delivery) {
    await fetch(`${api}/api/delivery/cod-info/${form.delivery}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codCollected: true,
        codMethod: form.method,
        status: 'Delivered'
      })
    });

    // ✅ Fetch delivery info to check if lease return is expected
    const deliveryRes = await fetch(`${api}/api/delivery/${form.delivery}`, {
      credentials: 'include',
    });

    if (deliveryRes.ok) {
      const deliveryData = await deliveryRes.json();
      if (deliveryData?.leaseReturn?.willReturn) {
        return navigate(`/driver/lease-return/from-delivery/${form.delivery}`);
      }
    }
  }

  // No lease return → go to all CODs
  setTimeout(() => navigate('/allcods'), 2000);
} else {
      throw new Error(data.message || 'Failed to create COD');
    }
  } catch (err) {
    console.error('❌ COD submission error:', err);
    setError(err.message || 'Server error');
  } finally {
    setLoading(false);
  }
};
  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" mb={3} align="center">Create New COD</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                fullWidth
                name="customerName"
                label="Customer Name"
                value={form.customerName}
                onChange={handleChange}
                margin="normal"
                required
                disabled={fromDelivery && !!form.customerName}
              />

              <TextField
                fullWidth
                name="phoneNumber"
                label="Phone Number"
                value={form.phoneNumber}
                onChange={handleChange}
                margin="normal"
                required
                disabled={fromDelivery && !!form.phoneNumber}
              />

              <TextField
                fullWidth
                name="address"
                label="Address"
                value={form.address}
                onChange={handleChange}
                margin="normal"
                required
                disabled={fromDelivery && !!form.address}
              />

          <TextField fullWidth name="amount" label="Amount (0 if none)" type="number" value={form.amount} onChange={handleChange} margin="normal" />
          <TextField fullWidth select name="method" label="Payment Method" value={form.method} onChange={handleChange} margin="normal">
            {['None', 'Cash', 'Zelle', 'Check'].map(method => (
              <MenuItem key={method} value={method}>{method}</MenuItem>
            ))}
          </TextField>

          {!fromDelivery && (
            <>
              <TextField fullWidth select name="salesperson" label="Salesperson" value={form.salesperson} onChange={handleChange} margin="normal" required>
                {salespeople.map(sp => <MenuItem key={sp._id} value={sp._id}>{sp.name}</MenuItem>)}
              </TextField>
              <TextField fullWidth select name="driver" label="Driver" value={form.driver} onChange={handleChange} margin="normal" required>
                {drivers.map(d => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
              </TextField>
            </>
          )}

          <Typography variant="h6" mt={3} mb={1}>Car Info</Typography>
          <Grid container spacing={2}>
          {['year', 'make', 'model', 'trim', 'color'].map(field => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                fullWidth
                name={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form.car[field]}
                onChange={handleChange}
                disabled={fromDelivery && !!form.car[field]}
              />
            </Grid>
          ))}
          </Grid>

          <Box mt={3}>
            <Typography variant="body1">Upload Contract Picture *</Typography>
            <input type="file" required onChange={(e) => setContractPicture(e.target.files[0])} />
          </Box>

          {form.method === 'Check' && (
            <Box mt={2}>
              <Typography>Upload Check Picture</Typography>
              <input type="file" onChange={(e) => setCheckPicture(e.target.files[0])} />
            </Box>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create COD'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewCOD;