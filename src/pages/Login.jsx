import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Container, Box, Paper, Typography, TextField, Button, Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackType, setSnackType] = useState('success');

  useEffect(() => {
    if (user?.role) {
      switch (user.role) {
        case 'Driver': navigate('/driver/dashboard'); break;
        case 'Sales': navigate('/sales/dashboard'); break;
        case 'Owner': navigate('/owner/dashboard'); break;
        case 'Management': navigate('/management/dashboard'); break;
        default: navigate('/');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      email: form.email.trim().toLowerCase(),
      password: form.password
    };

    const result = await login(payload);

    if (result.success) {
      setSnackMsg('Login successful! Redirecting...');
      setSnackType('success');
    } else {
      setSnackMsg(result.message || 'Login failed');
      setSnackType('error');
    }

    setSnackOpen(true);
    setLoading(false);
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
              autoFocus
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, py: 1.5 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
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
