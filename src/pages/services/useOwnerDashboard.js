import { useEffect, useState } from 'react';
import {
  fetchDeliveriesByDate,
  fetchClockSessionsByDate,
  fetchPendingClockInRequests,
  handleClockApproval,
} from './ownerDashboardService';
const api = process.env.REACT_APP_API_URL;
const useOwnerDashboardData = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [clockSessions, setClockSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

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
    console.log('im called');
    await fetchCODChartData(startDate, endDate);
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
  const fetchCODChartData = async (dateFrom = startDate, dateTo = endDate) => {
    setChartLoading(true);
    try {
      const from = new Date(
        dateFrom.getFullYear(),
        dateFrom.getMonth(),
        dateFrom.getDate()
      );
      const to = new Date(
        dateTo.getFullYear(),
        dateTo.getMonth(),
        dateTo.getDate()
      );
      to.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        start: from.toISOString(),
        end: to.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const res = await fetch(`${api}/api/delivery/cod-chart-data?${params}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      const data = await res.json();
      setChartData(data);
    } catch (err) {
      console.error('Error fetching COD chart data:', err);
      setChartData(null);
    } finally {
      setChartLoading(false);
    }
  };
  useEffect(() => {
    const today = new Date();
    fetchDeliveriesByRange(today, today);
  }, []);

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
    chartData,
    chartLoading,
  };
};

export default useOwnerDashboardData;
