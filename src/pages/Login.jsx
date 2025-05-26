import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Container, Box, Paper, Typography, TextField, Button, Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const api = process.env.REACT_APP_API_URL;

const Login = () => {
  const { login } = useContext(AuthContext); // ✅ login fetches session
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackType, setSnackType] = useState('success');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${api}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
      credentials: 'include'
    });

    const data = await res.json();

    if (!res.ok) {
      setSnackMsg(data.message || 'Login failed');
      setSnackType('error');
      setSnackOpen(true);
      return;
    }

    // ✅ Pass user object to context
    login(data.user);

    setSnackMsg('Login successful! Redirecting...');
    setSnackType('success');
    setSnackOpen(true);

    // ✅ Route based on session role
    switch (data.user?.role) {
      case 'Driver': navigate('/driver/dashboard'); break;
      case 'Sales': navigate('/sales/dashboard'); break;
      case 'Owner': navigate('/owner/dashboard'); break;
      case 'Management': navigate('/management/dashboard'); break;
      default: navigate('/'); break;
    }

  } catch (err) {
    console.error('🔥 Login error:', err);
    setSnackMsg('Server error. Please try again.');
    setSnackType('error');
    setSnackOpen(true);
  }
};


  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2
    }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
          <Typography variant="h5" textAlign="center" gutterBottom>Login</Typography>
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, py: 1.5 }}>
              Sign In
            </Button>
          </form>
          <Button fullWidth variant="text" onClick={() => navigate('/register')} sx={{ mt: 2 }}>
            Don’t have an account? Register
          </Button>
        </Paper>
      </Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackOpen(false)} severity={snackType} variant="filled">
          {snackMsg}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Login;
