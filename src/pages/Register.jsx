import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert, FormControl, InputLabel, MenuItem, Select, Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MuiAlert from '@mui/material/Alert';

const api = process.env.REACT_APP_API_URL;

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    role: '',
  });

  const [error, setError] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackType, setSnackType] = useState('success');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError('');
    setSnackOpen(false);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${api}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setSnackMsg(data.message || 'Registration failed');
        setSnackType('error');
        setSnackOpen(true);
        return;
      }

      setSnackMsg(data.message || 'Registration successful!');
      setSnackType('success');
      setSnackOpen(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setSnackMsg('Server error. Try again later.');
      setSnackType('error');
      setSnackOpen(true);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" mb={2}>Register</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} margin="normal" required />
            <TextField fullWidth label="Invite Code" name="inviteCode" value={form.inviteCode} onChange={handleChange} margin="normal" required />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={form.role} label="Role" onChange={handleChange}>
                <MenuItem value="Driver">Driver</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Owner">Owner</MenuItem>
                <MenuItem value="Management">Management</MenuItem>
              </Select>
            </FormControl>

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
              Register
            </Button>
          </form>
        </Paper>
      </Container>

      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert onClose={() => setSnackOpen(false)} severity={snackType} sx={{ width: '100%' }} elevation={6} variant="filled">
          {snackMsg}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Register;