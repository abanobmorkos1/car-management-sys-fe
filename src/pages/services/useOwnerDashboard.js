import { useEffect, useState } from 'react';
import {
  fetchDeliveriesByDate,
  fetchClockSessionsByDate,
  fetchPendingClockInRequests,
  handleClockApproval,
} from './ownerDashboardService';

const useOwnerDashboardData = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [clockSessions, setClockSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [clockData, pendingData] = await Promise.all([
          fetchClockSessionsByDate(selectedDate),
          fetchPendingClockInRequests(),
        ]);

        setClockSessions(Array.isArray(clockData) ? clockData : []);
        setPendingRequests(Array.isArray(pendingData) ? pendingData : []);
      } catch (err) {
        console.error('❌ Error loading dashboard data:', err);
      }
    };

    loadInitialData();
  }, [selectedDate]);

  const approveOrRejectClock = async (id, approve = true) => {
    try {
      await handleClockApproval(id, approve);
      const updated = await fetchPendingClockInRequests();
      setPendingRequests(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error(
        `❌ Error during ${approve ? 'approval' : 'rejection'}:`,
        err
      );
    }
  };

  const updateDateAndFetchSessions = async (date) => {
    try {
      const sessions = await fetchClockSessionsByDate(date);
      setClockSessions(Array.isArray(sessions) ? sessions : []);
    } catch (err) {
      console.error('❌ Error fetching sessions for selected date:', err);
    }
  };

  const fetchDeliveriesByRange = async (startDate, endDate, pageNum = 1) => {
    setLoading(true);
    try {
      const data = await fetchDeliveriesByDate(startDate, endDate, pageNum);
      setDeliveries(Array.isArray(data.deliveries) ? data.deliveries : []);
      setTotalDeliveries(data.total || 0);
    } catch (err) {
      console.error('❌ Error fetching deliveries by date range:', err);
      setDeliveries([]);
      setTotalDeliveries(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    deliveries,
    totalDeliveries,
    clockSessions,
    pendingRequests,
    selectedDate,
    loading,
    updateDateAndFetchSessions,
    fetchDeliveriesByRange,
    approveOrRejectClock,
    setSelectedDate,
  };
};

export default useOwnerDashboardData;
