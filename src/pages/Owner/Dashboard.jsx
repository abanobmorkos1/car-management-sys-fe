// pages/OwnerDashboard.jsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import useOwnerDashboardData from '../services/useOwnerDashboard';
import OwnerDashboardLayout from '../../components/OwnerDashboardLayout';

const OwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [page, setPage] = useState(1);

  const {
    deliveries = [],
    totalDeliveries = 0,
    clockSessions = [],
    pendingRequests = [],
    selectedDate,
    loading,
    updateDateAndFetchSessions,
    fetchDeliveriesByRange,
    approveOrRejectClock,
    setSelectedDate,
    chartLoading = false,
    chartData,
  } = useOwnerDashboardData();

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchDeliveriesByRange(startDate, endDate, value);
  };

  const handleDateRangeChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setPage(1);
    fetchDeliveriesByRange(newStartDate, newEndDate, 1);
  };

  return (
    <OwnerDashboardLayout
      user={user}
      navigate={navigate}
      deliveries={deliveries}
      totalDeliveries={totalDeliveries}
      clockSessions={clockSessions}
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      page={page}
      loading={loading}
      updateDateAndFetchSessions={updateDateAndFetchSessions}
      pendingRequests={pendingRequests}
      onApprove={(id) => approveOrRejectClock(id, true)}
      onReject={(id) => approveOrRejectClock(id, false)}
      setSelectedDate={setSelectedDate}
      onDateRangeChange={handleDateRangeChange}
      onPageChange={handlePageChange}
      chartData={chartData}
      chartLoading={chartLoading}
    />
  );
};

export default OwnerDashboard;
