import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useManagerDashboardData from '.././services/useManagerDashboardData';
import ManagerDashboardLayout from '../../components/ManagerDashboardLayout';
import DriverDashboardLayout from '../../components/DriverDashboardLayout';
import useDriverDashboardData from '../services/useDriverDashboardData';
const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // Manager data hook
  const managerData = useManagerDashboardData();

  // Driver features hook (for when manager also drives/delivers)
  const driverData = useDriverDashboardData(user);

  if (!user) return <div>Loading...</div>;

  if (user.role === 'Management') {
    return (
      <>
        <ManagerDashboardLayout
          deliveries={managerData.deliveries}
          drivers={managerData.drivers}
          clockSessions={managerData.clockSessions}
          selectedDate={managerData.selectedDate}
          setSelectedDate={managerData.setSelectedDate}
          selectedDriverId={managerData.selectedDriverId}
          setSelectedDriverId={managerData.setSelectedDriverId}
          handleAssignDriver={managerData.handleAssignDriver}
          handleApproveClockIn={managerData.handleApproveClockIn}
          handleRejectClockIn={managerData.handleRejectClockIn}
           userId={user._id}
        />

        {/* Include driver interface section below */}
        <DriverDashboardLayout
          userName={user.name}
          user={user}
          isClockedIn={driverData.isClockedIn}
          clockInStatus={driverData.clockInStatus}
          handleClockInOut={driverData.handleClockInOut}
          handleStatusChange={driverData.handleStatusChange}
          secondsWorked={driverData.secondsWorked}
          totalHours={driverData.totalHours}
          counts={driverData.counts}
          showGallery={driverData.showGallery}
          setShowGallery={driverData.setShowGallery}
          filter={driverData.filter}
          setFilter={driverData.setFilter}
          deliveries={driverData.deliveries}
          weeklyEarnings={driverData.weeklyEarnings}
          dailyBreakdown={driverData.dailyBreakdown}
          lastSessionEarnings={driverData.lastSessionEarnings}
          navigate={() => {}}
        />
      </>
    );
  }

  return <div>Unauthorized</div>;
};

export default Dashboard;
