import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LogoutIcon from '@mui/icons-material/Logout';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNav = (path) => {
    navigate(path);
    setOpen(false);
  };

  const drawerItems = [
    {
      text: 'Lease Returns',
      path: '/driver/lease-returns',
      icon: <AssignmentReturnIcon />
    },
    {
      text: 'New Cars',
      path: '/cars',
      icon: <DirectionsCarIcon />
    },
    {
      text: 'CODs',
      path: '/allcods',
      icon: <Inventory2Icon />
    },
    {
      text: 'Logout',
      action: handleLogout,
      icon: <LogoutIcon />
    }
  ];

  return (
    <>
      <AppBar position="sticky" color="primary" sx={{ mb: 2 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold" color="inherit">
            Welcome, {user?.name || 'User'}
          </Typography>

          {isMobile ? (
            <IconButton color="inherit" onClick={() => setOpen(true)}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box display="flex" gap={1}>
              <Button color="inherit" startIcon={<AssignmentReturnIcon />} onClick={() => handleNav('/driver/lease-returns')}>
                Lease Returns
              </Button>
              <Button color="inherit" startIcon={<DirectionsCarIcon />} onClick={() => handleNav('/cars')}>
                New Cars
              </Button>
              <Button color="inherit" startIcon={<Inventory2Icon />} onClick={() => handleNav('/allcods')}>
                CODs
              </Button>
              <Button
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  color: '#fff',
                  backgroundColor: '#ef4444',
                  '&:hover': { backgroundColor: '#dc2626' }
                }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {drawerItems.map((item, idx) => (
              <ListItem key={idx} disablePadding>
                <ListItemButton
                  onClick={() => (item.action ? item.action() : handleNav(item.path))}
                  sx={item.text === 'Logout' ? {
                    color: 'white',
                    backgroundColor: '#ef4444',
                    '&:hover': { backgroundColor: '#dc2626' }
                  } : {}}
                >
                  <ListItemIcon sx={item.text === 'Logout' ? { color: 'white' } : {}}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Topbar;
