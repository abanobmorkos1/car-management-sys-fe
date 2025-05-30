import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DriverDashboardLayout from '../../components/DriverDashboardLayout';
import useDriverDashboardData from '../services/useDriverDashboardData';
import { CircularProgress, Box } from '@mui/material';

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
    clockRequestPending
  } = useDriverDashboardData(user, navigate);

  if (loading || !user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
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
      showGallery={showGallery}
      setShowGallery={setShowGallery}
      filter={filter}
      setFilter={setFilter}
      deliveries={deliveries}
      weeklyEarnings={weeklyEarnings}
      dailyBreakdown={dailyBreakdown}
      lastSessionEarnings={lastSessionEarnings}
      clockRequestPending={clockRequestPending}
      navigate={navigate}
    />
  );
};

export default DriverDashboard;