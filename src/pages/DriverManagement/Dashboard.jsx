import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useOwnerDashboardData from '../services/useOwnerDashboard';
import ManagerDashboardLayout from '../../components/ManagerDashboardLayout';

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [drivers, setDrivers] = useState([]);
  const [showGallery, setShowGallery] = useState(false);

  const {
    deliveries = [],
    updateDeliveriesByRange,
  } = useOwnerDashboardData();

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/drivers`, {
          credentials: 'include'
        });
        const data = await res.json();
        setDrivers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching drivers:', err);
      }
    };
    fetchDrivers();
  }, []);

  return (
  <ManagerDashboardLayout
    user={user}
    deliveries={deliveries}
    drivers={drivers}
    onAssignDriver={updateDeliveriesByRange}
    handleStatusChange={() => {}}
    showGallery={showGallery}
    setShowGallery={setShowGallery}
    triggerInitialBonusFetch={true}
  />
  );
};

export default ManagerDashboard;
