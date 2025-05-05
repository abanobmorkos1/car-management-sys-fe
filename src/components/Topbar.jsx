import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // ✅ correct import

const Topbar = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  let userName = '';

  if (token) {
    try {
      const decoded = jwtDecode(token); // ✅ USE jwtDecode not jwt_decode
      userName = decoded.name || 'User'; 
    } catch (err) {
      console.error('Error decoding token:', err);
    }
  }

  const handleLogout = () => {
    logout(); 
    navigate('/'); 
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6">
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
