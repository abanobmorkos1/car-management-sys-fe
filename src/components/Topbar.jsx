import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Topbar = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  let userName = '';
  try {
    if (token) {
      const decoded = jwtDecode(token);
      userName = decoded.name || 'User';
    }
  } catch (err) {
    console.error('Error decoding token:', err);
  }

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to login or homepage
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Welcome, {userName}
        </Typography>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
