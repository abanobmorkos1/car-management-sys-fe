import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const api = process.env.REACT_APP_API_URL;

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackType, setSnackType] = useState('success');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`https://car-management-sys-fe.vercel.app/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseError) {
        console.error('❌ Login JSON Parse Error:', parseError);
      }

      if (!res.ok) {
        setSnackMsg(data.message || 'Login failed');
        setSnackType('error');
        setSnackOpen(true);
        return;
      }

      setSnackMsg('Login successful! Redirecting...');
      setSnackType('success');
      setSnackOpen(true);
      login(data.token, data.role);

      switch (data.role) {
        case 'Driver':
          navigate('/driver/dashboard');
          break;
        case 'Sales':
          navigate('/sales/dashboard');
          break;
        case 'Owner':
          navigate('/driver/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 3 }}>
          <Typography variant="h5" textAlign="center" gutterBottom>
            Login
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
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
              autoComplete="current-password"
              margin="normal"
              required
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, py: 1.5 }}>
              Sign In
            </Button>
          </form>

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/register')}
            sx={{ mt: 2 }}
          >
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
        <MuiAlert
          onClose={() => setSnackOpen(false)}
          severity={snackType}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {snackMsg}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Login;
