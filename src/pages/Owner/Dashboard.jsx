// pages/OwnerDashboard.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import useOwnerDashboardData from '../services/useOwnerDashboard';
import OwnerDashboardLayout from '../../components/OwnerDashboardLayout';

const OwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    deliveries = [],
    clockSessions = [],
    pendingRequests = [],
    selectedDate,
    updateDateAndFetchSessions,
    updateDeliveriesByRange,
    approveOrRejectClock
  } = useOwnerDashboardData();

  return (
<OwnerDashboardLayout
  user={user}
  navigate={navigate}
  deliveries={deliveries}
  clockSessions={clockSessions}
  pendingRequests={pendingRequests}
  selectedDate={selectedDate}
  updateDateAndFetchSessions={updateDateAndFetchSessions}
  updateDeliveriesByRange={updateDeliveriesByRange}
  onApprove={(id) => approveOrRejectClock(id, true)}
  onReject={(id) => approveOrRejectClock(id, false)} // ✅ FIXED!
/>
);
};

export default OwnerDashboard;