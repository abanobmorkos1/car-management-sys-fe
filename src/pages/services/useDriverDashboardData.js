import { useState, useEffect, useCallback } from 'react';
import {
  fetchTodayDeliveries,
  fetchDriverStatus,
  requestClockIn,
  clockOut,
  fetchWeeklyEarnings,
  fetchWeeklyBreakdown,
  fetchDeliveriesByDateRange,
} from '../services/driverDashboardService';

const useDriverDashboardData = (user, navigate) => {
  const [counts, setCounts] = useState({ assigned: 0, total: 0 });
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
    totalHours: 0,
  });
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [lastSessionEarnings, setLastSessionEarnings] = useState(null);
  const [submittingClockIn, setSubmittingClockIn] = useState(false);

  // Add pagination and date filtering state
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  const loadInitialData = useCallback(async () => {
    try {
      const [deliveries, status, earnings, breakdown] = await Promise.all([
        fetchTodayDeliveries(),
        fetchDriverStatus(),
        fetchWeeklyEarnings(),
        fetchWeeklyBreakdown(),
      ]);
      setCounts({
        assigned: deliveries.assigned,
        total: deliveries.total,
      });
      setAllDeliveries(deliveries.deliveries);

      setIsClockedIn(status?.isClockedIn && status.status === 'approved');
      setClockInTime(
        status?.clockIn && status?.isClockedIn && status.status === 'approved'
          ? new Date(status.clockIn)
          : null
      );
      setClockInStatus(status); // save full object
      setWeeklyEarnings(earnings || {});
      setTotalHours(parseFloat(earnings?.totalHours || 0));
      setDailyBreakdown(Array.isArray(breakdown) ? breakdown : []);
    } catch (err) {
      console.error('🔴 Error loading driver dashboard data:', err);
    }
  }, []);

  // Add function to fetch deliveries by date range with pagination
  const fetchDeliveriesByDate = useCallback(
    async (start, end, pageNum = 1, filter) => {
      setLoading(true);
      try {
        const data = await fetchDeliveriesByDateRange(
          start,
          end,
          pageNum,
          itemsPerPage,
          filter
        );
        setAllDeliveries(data.deliveries);
        setCounts({
          assigned: data.assigned,
          total: data.total,
        });
        setTotalPages(
          Math.ceil(
            (filter === 'assigned' ? data.assigned : data.total || 0) /
              itemsPerPage
          )
        );
      } catch (err) {
        console.error('🔴 Error fetching deliveries by date:', err);
        setAllDeliveries([]);
        setCounts({ assigned: 0, total: 0 });
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [user?._id, itemsPerPage]
  );

  useEffect(() => {
    if (user?._id) {
      loadInitialData();
    }
  }, [user?._id, loadInitialData]);

  // Fetch deliveries when date range or page changes
  useEffect(() => {
    if (user?._id && (startDate || endDate)) {
      fetchDeliveriesByDate(startDate, endDate, page, filter);
    }
  }, [user?._id, startDate, endDate, page, fetchDeliveriesByDate, filter]);

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
        const res = await clockOut();
        await loadInitialData(); // safe to load immediately on clock-out
      } else {
        await requestClockIn();

        // Show pending status immediately in UI
        setClockInStatus({ status: 'pending' });
        setIsClockedIn(true); // so the UI starts the timer if needed
        setClockInTime(new Date());

        loadInitialData();
      }
    } catch (err) {
      console.error('❌ Error in clock-in/out logic:', err);
    } finally {
      setSubmittingClockIn(false);
    }
  };

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/delivery/update-status/${deliveryId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      console.log('✅ Status updated:', data);

      if (data?.redirect) {
        navigate(data.redirect);
      } else {
        const updatedDeliveries = await fetchTodayDeliveries();
        setAllDeliveries(
          Array.isArray(updatedDeliveries) ? updatedDeliveries : []
        );
      }
    } catch (err) {
      console.error('❌ Failed to update delivery status:', err);
    }
  };

  const handleDateChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setPage(1); // Reset to first page when dates change
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    setPage(1);
  }, [filter]);

  return {
    showGallery,
    setShowGallery,
    deliveries: allDeliveries,
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
    submittingClockIn,
    counts,
    // Add new return values
    startDate,
    endDate,
    page,
    totalPages,
    loading,
    onDateChange: handleDateChange,
    onPageChange: handlePageChange,
  };
};

export default useDriverDashboardData;
