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

  const loadInitialData = useCallback(async () => {
    try {
      const [deliveries, status, uploads, earnings, breakdown] = await Promise.all([
        fetchTodayDeliveries(),
        fetchDriverStatus(),
        fetchDriverUploads(),
        fetchWeeklyEarnings(),
        fetchWeeklyBreakdown()
      ]);
      console.log('📊 Weekly Earnings Response:', earnings);
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
  }, []);

  const handleClockInOut = async () => {
  try {
    if (isClockedIn) {
      // Clocking out
      setIsClockedIn(false);
      setClockInTime(null);
      setSecondsWorked(0);
      setClockInStatus(null);
      const result = await clockOut();
      if (result?.earnings !== undefined) {
        setLastSessionEarnings(result.earnings);
      }
    } else {
      // Requesting clock-in
      setClockRequestPending(true); // Make button gray
      await requestClockIn();       // This sets clockInStatus to 'pending'
      setLastSessionEarnings(null);
    }

    await loadInitialData();

    // Recheck if rejected
    if (clockInStatus?.status === 'rejected') {
      setClockRequestPending(false); // Allow retry
    } else {
      setClockRequestPending(false); // Button active again after response
    }
  } catch (err) {
    console.error('Clock in/out error:', err.message);
    setClockRequestPending(false); // Reset in case of error
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
      await loadInitialData();
      if (newStatus === 'Delivered') {
        navigate(`/driver/cod/from-delivery/${id}`);
      }
    } catch (err) {
      console.error('❌ Failed to update status:', err.message);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadInitialData();
    }
  }, [user?._id, loadInitialData]);

  useEffect(() => {
    if (!user?._id) return;
    const interval = setInterval(() => {
      console.log('🔄 Polling dashboard refresh...');
      loadInitialData();
    }, 5000);
    return () => clearInterval(interval);
  }, [user?._id, loadInitialData]);

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
    if (interval) {
      clearInterval(interval);
      console.log('⏱️ Timer cleared');
    }
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
    loadInitialData,
    lastSessionEarnings,

  };
};

export default useDriverDashboardData;