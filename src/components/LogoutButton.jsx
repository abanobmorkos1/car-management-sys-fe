// src/components/LogoutButton.jsx

import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();               // Clears token/user from context and localStorage
    navigate('/login');     // Redirects to login page
  };

  return (
    <Button onClick={handleLogout} color="error" variant="outlined" fullWidth>
      Logout
    </Button>
  );
};

export default LogoutButton;
