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
  const [filter, setFilter] = useState('assigned');
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

  const loadInitialData = useCallback(async () => {
    const [deliveries, status, earnings, breakdown] = await Promise.all([
      fetchTodayDeliveries(),
      fetchDriverStatus(),
      fetchWeeklyEarnings(),
      fetchWeeklyBreakdown()
    ]);

    setAllDeliveries(Array.isArray(deliveries) ? deliveries : []);
    setClockInStatus(status);
    setWeeklyEarnings(earnings || {});
    setTotalHours(parseFloat(earnings?.totalHours || 0));
    setDailyBreakdown(Array.isArray(breakdown) ? breakdown : []);

    if (Array.isArray(breakdown)) {
      const review = breakdown.reduce((sum, day) => sum + (day.reviewPhotos || 0), 0);
      const customer = breakdown.reduce((sum, day) => sum + (day.customerPhotos || 0), 0);
      setBonusCounts({ review, customer });
    }

    if (status?.isClockedIn && status?.clockIn) {
      const clockInDate = new Date(status.clockIn);
      const now = new Date();
      setClockInTime(clockInDate);
      setSecondsWorked(Math.floor((now - clockInDate) / 1000));
    }

    setIsClockedIn(status?.isClockedIn || false);
    setClockRequestPending(status?.status === 'pending');
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

  const handleStatusChange = () => {
    loadInitialData();
  };

  // ✅ This filters today's deliveries either to assigned or all
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
