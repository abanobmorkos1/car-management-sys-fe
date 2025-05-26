import { useEffect, useState } from 'react';
import {
  fetchDeliveriesByDate,
  fetchClockSessionsByDate,
  fetchPendingClockInRequests,
  handleClockApproval
} from './ownerDashboardService';

const useOwnerDashboardData = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [clockSessions, setClockSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const loadInitialData = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      try {
        const [deliveryData, clockData, pendingData] = await Promise.all([
          fetchDeliveriesByDate(today, today),
          fetchClockSessionsByDate(today),
          fetchPendingClockInRequests()
        ]);

        console.log('📦 Deliveries:', deliveryData);
        console.log('🕒 Clock Sessions:', clockData);
        console.log('📝 Pending Requests:', pendingData);

        setDeliveries(Array.isArray(deliveryData) ? deliveryData : []);
        setClockSessions(Array.isArray(clockData) ? clockData : []);
        setPendingRequests(Array.isArray(pendingData) ? pendingData : []);
      } catch (err) {
        console.error('❌ Error loading dashboard data:', err);
      }
    };

    loadInitialData();
  }, []);

  const approveOrRejectClock = async (id, approve = true) => {
    try {
      await handleClockApproval(id, approve);
      const updated = await fetchPendingClockInRequests();
      setPendingRequests(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error(`❌ Error during ${approve ? 'approval' : 'rejection'}:`, err);
    }
  };

  const updateDateAndFetchSessions = async (date) => {
    setSelectedDate(date);
    try {
      const sessions = await fetchClockSessionsByDate(date);
      setClockSessions(Array.isArray(sessions) ? sessions : []);
    } catch (err) {
      console.error('❌ Error fetching sessions for selected date:', err);
    }
  };

  const updateDeliveriesByRange = async (start, end) => {
    try {
      const data = await fetchDeliveriesByDate(start, end);
      setDeliveries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error fetching deliveries by date range:', err);
    }
  };

  return {
    deliveries,
    clockSessions,
    pendingRequests,
    selectedDate,
    updateDateAndFetchSessions,
    updateDeliveriesByRange,
    approveOrRejectClock
  };
};

export default useOwnerDashboardData;
