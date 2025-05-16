import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import {
  Container, Paper, TextField, Button, Typography, Box, Grid, MenuItem, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const uploadToS3 = async (file, category, token, customerName) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/s3/generate-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      uploadCategory: category,
      meta: { customerName }
    })
  });
  const { uploadUrl, key } = await res.json();
  await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  return key;
};

const NewCOD = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: '', phoneNumber: '', address: '', amount: '',
    method: 'None', salesperson: '', driver: '', car: { year: '', make: '', model: '' }
  });
  const [salespeople, setSalespeople] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [contractPicture, setContractPicture] = useState(null);
  const [checkPicture, setCheckPicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const [salesRes, driverRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/users/salespeople`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.REACT_APP_API_URL}/api/users/drivers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setSalespeople(await salesRes.json());
      setDrivers(await driverRes.json());
    };
    fetchUsers();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in form.car) {
      setForm(prev => ({ ...prev, car: { ...prev.car, [name]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let contractKey = null;
      let checkKey = null;
      if (contractPicture) {
        contractKey = await uploadToS3(contractPicture, 'cod', token, form.customerName);
      }
      if (form.method === 'Check' && checkPicture) {
        checkKey = await uploadToS3(checkPicture, 'cod', token, form.customerName);
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/cod/newcod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, contractKey, checkKey })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('COD created successfully!');
        setTimeout(() => navigate('/allcods'), 2000);
      } else {
        setError(data.message || 'Failed to create COD');
      }
    } catch (err) {
      console.error('COD submission error:', err);
      setError('Server error');
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
          <TextField fullWidth name="customerName" label="Customer Name" value={form.customerName} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="phoneNumber" label="Phone Number" value={form.phoneNumber} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="address" label="Address" value={form.address} onChange={handleChange} margin="normal" required />
          <TextField fullWidth name="amount" label="Amount (0 if none)" type="number" value={form.amount} onChange={handleChange} margin="normal" />

          <TextField fullWidth select name="method" label="Payment Method" value={form.method} onChange={handleChange} margin="normal">
            <MenuItem value="None">None</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Zelle">Zelle</MenuItem>
            <MenuItem value="Check">Check</MenuItem>
          </TextField>

          <TextField fullWidth select name="salesperson" label="Salesperson" value={form.salesperson} onChange={handleChange} margin="normal" required>
            {salespeople.map(sp => (
              <MenuItem key={sp._id} value={sp._id}>{sp.name}</MenuItem>
            ))}
          </TextField>

          <TextField fullWidth select name="driver" label="Driver" value={form.driver} onChange={handleChange} margin="normal" required>
            {drivers.map(d => (
              <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
            ))}
          </TextField>

          <Typography variant="h6" mt={3} mb={1}>Car Info</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField fullWidth name="year" label="Year" value={form.car.year} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField fullWidth name="make" label="Make" value={form.car.make} onChange={handleChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth name="model" label="Model" value={form.car.model} onChange={handleChange} /></Grid>
          </Grid>

          <Box mt={3}><Typography variant="body1">Upload Contract Picture *</Typography>
            <input type="file" onChange={(e) => setContractPicture(e.target.files[0])} required />
          </Box>

          {form.method === 'Check' && (
            <Box mt={2}><Typography>Upload Check Picture</Typography>
              <input type="file" onChange={(e) => setCheckPicture(e.target.files[0])} />
            </Box>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create COD'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewCOD;