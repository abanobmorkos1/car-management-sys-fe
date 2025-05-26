import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import DriverDashboardLayout from '../../components/DriverDashboardLayout';
import useDriverDashboardData from '../services/useDriverDashboardData';

const DriverDashboard = () => {
  const { userName, user } = useContext(AuthContext);
  const navigate = useNavigate();

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
    lastSessionEarnings
  } = useDriverDashboardData(user, navigate);

  if (!user) return <div>Loading...</div>;

  return (
    <DriverDashboardLayout
      userName={userName}
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
      navigate={navigate}
    />
  );
};

export default DriverDashboard;
