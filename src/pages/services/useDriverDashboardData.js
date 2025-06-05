import { useState, useEffect, useCallback } from 'react';
import {
  fetchTodayDeliveries,
  fetchDriverStatus,
  requestClockIn,
  clockOut,
  fetchWeeklyEarnings,
  fetchWeeklyBreakdown
} from '../services/driverDashboardService';

const useDriverDashboardData = (user, navigate) => {
  const [showGallery, setShowGallery] = useState(false);
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [filter, setFilter] = useState('all');

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockInStatus, setClockInStatus] = useState(null); // whole object (pending/approved/rejected)
  const [secondsWorked, setSecondsWorked] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const [weeklyEarnings, setWeeklyEarnings] = useState({
    baseEarnings: 0,
    bonus: 0,
    totalEarnings: 0,
    reviewPhotos: 0,
    customerPhotos: 0,
    totalHours: 0
  });
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [lastSessionEarnings, setLastSessionEarnings] = useState(null);
  const [submittingClockIn, setSubmittingClockIn] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      const [deliveries, status, earnings, breakdown] = await Promise.all([
        fetchTodayDeliveries(),
        fetchDriverStatus(),
        fetchWeeklyEarnings(),
        fetchWeeklyBreakdown()
      ]);

      setAllDeliveries(Array.isArray(deliveries) ? deliveries : []);
      setIsClockedIn(status?.isClockedIn || false);
      setClockInTime(status?.clockIn ? new Date(status.clockIn) : null);
      setClockInStatus(status); // save full object
      setWeeklyEarnings(earnings || {});
      setTotalHours(parseFloat(earnings?.totalHours || 0));
      setDailyBreakdown(Array.isArray(breakdown) ? breakdown : []);
    } catch (err) {
      console.error('🔴 Error loading driver dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    if (user?._id) {
      loadInitialData();
    }
  }, [user?._id, loadInitialData]);

  useEffect(() => {
    let interval;
    if (isClockedIn && clockInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - clockInTime) / 1000);
        setSecondsWorked(diff);
      }, 1000);
    } else {
      console.log('⛔ Timer NOT started:', { isClockedIn, clockInTime });
    }
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

const handleClockInOut = async () => {
  setSubmittingClockIn(true);
  try {
    if (isClockedIn) {
      console.log('🔘 Attempting clock-out...');
      const res = await clockOut();
      console.log('✅ Clocked out:', res);
      await loadInitialData(); // safe to load immediately on clock-out
    } else {
      console.log('🔘 Requesting clock-in...');
      const res = await requestClockIn();
      console.log('🕒 Clock-in requested:', res);
      
      // Show pending status immediately in UI
      setClockInStatus({ status: 'pending' });
      setIsClockedIn(true); // so the UI starts the timer if needed
      setClockInTime(new Date());

      // Delay fetching fresh data from backend to avoid overwrite
      setTimeout(() => {
        loadInitialData();
      }, 3000); // give backend 3 seconds to update
    }
  } catch (err) {
    console.error('❌ Error in clock-in/out logic:', err);
  } finally {
    setSubmittingClockIn(false);
  }
};


const handleStatusChange = async (deliveryId, newStatus) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/delivery/update-status/${deliveryId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();
    console.log('✅ Status updated:', data);

    if (data?.redirect) {
      navigate(data.redirect);
    } else {
      const updatedDeliveries = await fetchTodayDeliveries();
      setAllDeliveries(Array.isArray(updatedDeliveries) ? updatedDeliveries : []);
    }
  } catch (err) {
    console.error('❌ Failed to update delivery status:', err);
  }
};

  const filteredDeliveries = allDeliveries.filter(del =>
    filter === 'assigned'
      ? del.driver === user?._id || del.driver?._id === user?._id
      : true
  );

  return {
    showGallery,
    setShowGallery,
    deliveries: filteredDeliveries,
    filter,
    setFilter,
    isClockedIn,
    totalHours,
    secondsWorked,
    clockInStatus,
    weeklyEarnings,
    dailyBreakdown,
    handleClockInOut,
    handleStatusChange,
    lastSessionEarnings,
    submittingClockIn
  };
};

export default useDriverDashboardData;
