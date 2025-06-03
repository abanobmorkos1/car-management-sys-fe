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
  const [totalHours, setTotalHours] = useState(0);
  const [secondsWorked, setSecondsWorked] = useState(0);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockInStatus, setClockInStatus] = useState(null);
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
  const [clockRequestPending, setClockRequestPending] = useState(false);
  const [bonusCounts, setBonusCounts] = useState({ review: 0, customer: 0 });

const loadInitialData = async () => {
  try {
    const [deliveries, status, uploads, earnings, breakdown] = await Promise.all([
      fetchTodayDeliveries(),
      fetchDriverStatus(),
      fetchDriverUploads(),
      fetchWeeklyEarnings(),
      fetchWeeklyBreakdown()
    ]);

    setAllDeliveries(Array.isArray(deliveries) ? deliveries : []);
    setClockInStatus(status);
    setWeeklyEarnings(earnings || {});
    setTotalHours(parseFloat(earnings?.totalHours || 0));
    setDailyBreakdown(Array.isArray(breakdown) ? breakdown : []);
    setCounts(uploads);

    // 🔧 Clock-in status check (fixes stuck timer)
    if (status?.isClockedIn && status?.clockIn) {
      const clockInDate = new Date(status.clockIn);
      const now = new Date();
      setClockInTime(clockInDate);
      setSecondsWorked(Math.floor((now - clockInDate) / 1000));
      setIsClockedIn(true);
    } else {
      setClockInTime(null);
      setSecondsWorked(0);
      setIsClockedIn(false);
    }

  } catch (err) {
    console.error("🔴 Error loading initial driver data:", err);
  }
};

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
    }
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  const handleClockInOut = async () => {
    if (!isClockedIn) {
      const res = await requestClockIn();
      if (res?.status === 'pending') {
        setClockRequestPending(true);
      }
    } else {
      const result = await clockOut();
      if (result?.earnings) {
        setLastSessionEarnings(result.earnings);
      }
      setIsClockedIn(false);
      setClockInTime(null);
    }

    await loadInitialData();
  };

  const handleStatusChange = async () => {
    const updatedDeliveries = await fetchTodayDeliveries();
    setAllDeliveries(Array.isArray(updatedDeliveries) ? updatedDeliveries : []);
  };

  const filteredDeliveries = allDeliveries.filter(del =>
    filter === 'assigned'
      ? del.driver === user?._id || del.driver?._id === user?._id
      : true
  );

  return {
    showGallery,
    setShowGallery,
    allDeliveries,
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
    clockRequestPending,
    bonusCounts
  };
};

export default useDriverDashboardData;
