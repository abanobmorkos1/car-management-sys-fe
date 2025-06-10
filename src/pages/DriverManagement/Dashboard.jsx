import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import ManagerDashboardLayout from '../../components/ManagerDashboardLayout';
import useOwnerDashboardData from '../services/useOwnerDashboard';

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [drivers, setDrivers] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const { pendingRequests = [], approveOrRejectClock } =
    useOwnerDashboardData();
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/drivers`,
          {
            credentials: 'include',
          }
        );
        const data = await res.json();
        setDrivers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching drivers:', err);
      }
    };
    fetchDrivers();
  }, []);

  const handleAssignDriver = async () => {
    // Refresh drivers list after assignment
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/drivers`,
        {
          credentials: 'include',
        }
      );
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error refreshing drivers:', err);
    }
  };

  return (
    <ManagerDashboardLayout
      user={user}
      drivers={drivers}
      onAssignDriver={handleAssignDriver}
      handleStatusChange={() => {}}
      showGallery={showGallery}
      setShowGallery={setShowGallery}
      triggerInitialBonusFetch={true}
      pendingRequests={pendingRequests}
      onApprove={(id) => approveOrRejectClock(id, true)}
      onReject={(id) => approveOrRejectClock(id, false)}
    />
  );
};

export default ManagerDashboard;
