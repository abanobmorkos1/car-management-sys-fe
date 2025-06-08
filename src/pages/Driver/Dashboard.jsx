import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DriverDashboardLayout from '../../components/DriverDashboardLayout';
import useDriverDashboardData from '../services/useDriverDashboardData';
import {
  CircularProgress,
  Box,
  Typography,
  Backdrop,
  Fade,
} from '@mui/material';

const DriverDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const {
    showGallery,
    setShowGallery,
    counts,
    deliveries,
    filter,
    setFilter,
    isClockedIn,
    totalHours,
    secondsWorked,
    clockInStatus,
    weeklyEarnings,
    dailyBreakdown,
    handleClockInOut,
    handleStatusChange,
    lastSessionEarnings,
    clockRequestPending,
    bonusCounts,
  } = useDriverDashboardData(user, navigate);

  if (loading || !user) {
    return (
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(8px)',
        }}
        open={true}
      >
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textAlign: 'center',
              p: 4,
            }}
          >
            {/* App Logo/Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 0.8,
                  },
                  '50%': {
                    transform: 'scale(1.05)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 0.8,
                  },
                },
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                🚗
              </Typography>
            </Box>

            {/* Loading Spinner */}
            <Box sx={{ position: 'relative' }}>
              <CircularProgress
                size={70}
                thickness={3}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }}
              />
              <CircularProgress
                size={70}
                thickness={3}
                variant="determinate"
                value={25}
                sx={{
                  color: '#fff',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                  animation: 'rotate 2s linear infinite',
                  '@keyframes rotate': {
                    '0%': {
                      transform: 'rotate(0deg)',
                    },
                    '100%': {
                      transform: 'rotate(360deg)',
                    },
                  },
                }}
              />
            </Box>

            {/* Loading Text */}
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                Driver Dashboard
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 400,
                  animation: 'fadeInOut 2s infinite',
                  '@keyframes fadeInOut': {
                    '0%': { opacity: 0.6 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0.6 },
                  },
                }}
              >
                Loading your workspace...
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Backdrop>
    );
  }

  return (
    <DriverDashboardLayout
      userName={user.name}
      user={user}
      isClockedIn={isClockedIn}
      clockInStatus={clockInStatus}
      handleClockInOut={handleClockInOut}
      handleStatusChange={handleStatusChange}
      secondsWorked={secondsWorked}
      totalHours={totalHours}
      counts={counts}
      filter={filter}
      setFilter={setFilter}
      deliveries={deliveries}
      weeklyEarnings={weeklyEarnings}
      dailyBreakdown={dailyBreakdown}
      lastSessionEarnings={lastSessionEarnings}
      clockRequestPending={clockRequestPending}
      navigate={navigate}
      showGallery={showGallery}
      setShowGallery={setShowGallery}
      triggerInitialBonusFetch={true}
      bonusCounts={bonusCounts}
    />
  );
};

export default DriverDashboard;
