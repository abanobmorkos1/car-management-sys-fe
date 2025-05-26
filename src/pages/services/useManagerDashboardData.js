import { useState, useEffect, useCallback } from 'react';
import {
  fetchTodayDeliveries,
  fetchDrivers,
  fetchClockSessions,
  assignDriverToDelivery,
  approveClockIn,
  rejectClockIn
} from '../services/managerDeliveryService';

const useManagerDashboardData = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [clockSessions, setClockSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDriverId, setSelectedDriverId] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const [deliveryData, driverData, clockData] = await Promise.all([
        fetchTodayDeliveries(),
        fetchDrivers(),
        fetchClockSessions(selectedDate)
      ]);
      setDeliveries(deliveryData);
      setDrivers(driverData);
      setClockSessions(clockData);
    } catch (error) {
      console.error('❌ Failed to load manager dashboard data:', error);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignDriver = async (deliveryId, driverId) => {
    await assignDriverToDelivery(deliveryId, driverId);
    await loadData();
  };

  const handleApproveClockIn = async (sessionId) => {
    await approveClockIn(sessionId);
    await loadData();
  };

  const handleRejectClockIn = async (sessionId) => {
    await rejectClockIn(sessionId);
    await loadData();
  };

  return {
    deliveries,
    drivers,
    clockSessions,
    selectedDate,
    setSelectedDate,
    selectedDriverId,
    setSelectedDriverId,
    handleAssignDriver,
    handleApproveClockIn,
    handleRejectClockIn
  };
};

export default useManagerDashboardData;
