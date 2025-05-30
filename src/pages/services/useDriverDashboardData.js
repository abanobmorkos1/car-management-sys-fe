import { useState, useEffect, useCallback } from 'react';
import {
  fetchTodayDeliveries,
  fetchDriverStatus,
  requestClockIn,
  clockOut,
  fetchDriverUploads,
  fetchWeeklyEarnings,
  fetchWeeklyBreakdown
} from '../services/driverDashboardService';

const useDriverDashboardData = (user, navigate) => {
  const [showGallery, setShowGallery] = useState(false);
  const [counts, setCounts] = useState({ review: 0, customer: 0 });
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [filter, setFilter] = useState('assigned');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [secondsWorked, setSecondsWorked] = useState(0);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockInStatus, setClockInStatus] = useState(null);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [lastSessionEarnings, setLastSessionEarnings] = useState(null);
  const [clockRequestPending, setClockRequestPending] = useState(false);
  const [submittingClockIn, setSubmittingClockIn] = useState(false);

  const loadInitialData = useCallback(async () => {
    if (!user || !user._id) return;

    try {
      const [deliveries, status, uploads, earnings, breakdown] = await Promise.all([
        fetchTodayDeliveries(),
        fetchDriverStatus(),
        fetchDriverUploads(),
        fetchWeeklyEarnings(),
        fetchWeeklyBreakdown()
      ]);

      setAllDeliveries(Array.isArray(deliveries) ? deliveries : []);
      setIsClockedIn(status.isClockedIn);
      setClockInTime(status.clockIn ? new Date(status.clockIn) : null);
      setClockInStatus(status);

      setCounts({
        review: uploads.filter(u => u.type === 'review').length,
        customer: uploads.filter(u => u.type === 'customer').length
      });

      setTotalHours(Number(earnings.totalHours || 0));
      setWeeklyEarnings(earnings.totalEarnings ?? earnings.total ?? 0);
      setDailyBreakdown(Array.isArray(breakdown) ? breakdown : []);
    } catch (err) {
      console.error('❌ Failed to load driver dashboard data:', err.message);
    }
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

const handleClockInOut = async () => {
  try {
    if (isClockedIn) {
      // CLOCKING OUT
      setIsClockedIn(false);
      setClockInTime(null);
      setSecondsWorked(0);
      setClockInStatus(null);

      const result = await clockOut();
      if (result?.earnings !== undefined) {
        setLastSessionEarnings(result.earnings);
      }
    } else {
      // CLOCKING IN
      setClockRequestPending(true);

      // Immediately reflect pending status in UI
      setClockInStatus({ status: 'pending' });
      setIsClockedIn(true); // Assume success for UI behavior

      await requestClockIn(); // Send clock-in request
      setLastSessionEarnings(null);

      // Fetch backend-confirmed status (could still be pending or approved)
      const statusAfterRequest = await fetchDriverStatus();
      setClockInStatus(statusAfterRequest);
    }

    setClockRequestPending(false);
    await loadInitialData(); // refresh UI
  } catch (err) {
    console.error('Clock in/out error:', err.message);
    setClockRequestPending(false);
  }
};

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/delivery/status/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (newStatus === 'Delivered') {
        navigate(`/driver/cod/from-delivery/${id}`);
      }

      await loadInitialData(); // ✅ Refresh deliveries after status change
    } catch (err) {
      console.error('❌ Failed to update status:', err.message);
    }
  };

  // Realtime worked seconds
  useEffect(() => {
    let interval;
    if (isClockedIn && clockInTime) {
      const parsedTime = new Date(clockInTime);
      if (!isNaN(parsedTime)) {
        interval = setInterval(() => {
          const now = new Date();
          const diff = Math.floor((now - parsedTime) / 1000);
          setSecondsWorked(diff);
        }, 1000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClockedIn, clockInTime]);

  const filteredDeliveries = (allDeliveries || []).filter(del => {
    if (filter === 'assigned') {
      const driverId = typeof del.driver === 'string' ? del.driver : del.driver?._id;
      return driverId?.toString() === user?._id?.toString();
    }
    return true;
  });

  return {
    showGallery,
    setShowGallery,
    counts,
    filter,
    setFilter,
    isClockedIn,
    setIsClockedIn,
    clockInStatus,
    setClockInStatus,
    clockInTime,
    setClockInTime,
    secondsWorked,
    totalHours,
    weeklyEarnings,
    deliveries: filteredDeliveries,
    dailyBreakdown,
    handleClockInOut,
    handleStatusChange,
    lastSessionEarnings,
    clockRequestPending,
    submittingClockIn,
    refreshData: loadInitialData
  };
};

export default useDriverDashboardData;
