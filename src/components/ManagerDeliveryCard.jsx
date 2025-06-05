import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  MenuItem,
  Select,
  useTheme,
  Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotesIcon from '@mui/icons-material/Notes';
import { useNavigate } from 'react-router-dom';

const api = process.env.REACT_APP_API_URL;

const ManagerDeliveryCard = ({ delivery, drivers = [], user, onAssignDriver }) => {
  const [assignedDriver, setAssignedDriver] = useState('');
  const [status, setStatus] = useState(delivery?.status || '');
  const [showLeaseDetails, setShowLeaseDetails] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (delivery?.driver) {
      const driverId = typeof delivery.driver === 'object' ? delivery.driver._id : delivery.driver;
      setAssignedDriver(driverId?.toString());
    }
  }, [delivery]);

  const handleAssign = async (driverId) => {
    try {
      await fetch(`${api}/api/delivery/assign-driver/${delivery._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ driverId }),
      });
      setAssignedDriver(driverId);
      onAssignDriver();
    } catch (err) {
      console.error('Error assigning driver:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`${api}/api/delivery/status/${delivery._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data?.redirect) {
        navigate(data.redirect);
      } else {
        setStatus(newStatus);
        onAssignDriver();
      }
    } catch (err) {
      console.error('Error updating delivery status:', err);
    }
  };

  const isSelfAssigned = user?.role === 'Management' && assignedDriver === user?._id;
  const isManager = user?.role === 'Manager';
  const canUpdateStatus = isSelfAssigned || isManager;

  return (
<Box
  p={3}
  border="1px solid #e0e0e0"
  borderRadius={3}
  bgcolor={theme.palette.background.paper}
  boxShadow={3}
  sx={{
    transition: '0.3s',
    '&:hover': { boxShadow: 6 }
  }}
>
  <Typography fontWeight={700} fontSize="1.2rem" color="primary.main" mb={0.5}>
    {delivery.customerName || 'Unnamed Customer'}
  </Typography>

  {/* Lease Return Tag + Toggle */}
  {delivery.leaseReturn ? (
    delivery.leaseReturn.willReturn ? (
      <>
        <Box
          onClick={() => setShowLeaseDetails(prev => !prev)}
          sx={{
            display: 'inline-block',
            backgroundColor: '#FFE0B2',
            color: '#BF360C',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            mb: 1,
            cursor: 'pointer',
            transition: '0.2s',
            '&:hover': { backgroundColor: '#FFCC80' }
          }}
        >
          🚗 Lease Return Scheduled (Click to {showLeaseDetails ? 'Hide' : 'View'})
        </Box>

        {showLeaseDetails && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            <DirectionsCarIcon fontSize="small" sx={{ mr: 0.5 }} />
            {delivery.leaseReturn.carYear} {delivery.leaseReturn.carMake} {delivery.leaseReturn.carModel}
          </Typography>
        )}
      </>
    ) : (
      <Box
        sx={{
          display: 'inline-block',
          backgroundColor: '#f0f0f0',
          color: '#555',
          px: 2,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          fontWeight: 600,
          mb: 1
        }}
      >
        🚫 No Lease Return
      </Box>
    )
  ) : null}

  <Box display="flex" flexDirection="column" gap={1} mt={1} mb={2}>
    {delivery.phoneNumber && (
      <Typography variant="body2" display="flex" alignItems="center" color="text.secondary">
        <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
        {delivery.phoneNumber}
      </Typography>
    )}
    <Typography variant="body2" display="flex" alignItems="center" color="text.secondary">
      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
      {delivery.address}
    </Typography>
    <Typography variant="body2" display="flex" alignItems="center" color="text.secondary">
      <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
      {new Date(delivery.deliveryDate).toLocaleString()}
    </Typography>
    <Typography variant="body2" display="flex" alignItems="center" color="text.secondary">
      <LocalAtmIcon fontSize="small" sx={{ mr: 1 }} />
      ${delivery.codAmount} {delivery.codCollected ? `(via ${delivery.codMethod})` : '(Pending)'}
    </Typography>
    <Typography variant="body2" display="flex" alignItems="center" color="text.secondary">
      <DirectionsCarIcon fontSize="small" sx={{ mr: 1 }} />
      {delivery.year} {delivery.make} {delivery.model} {delivery.trim} - {delivery.color}
    </Typography>
    {delivery.notes && (
      <Typography variant="body2" display="flex" alignItems="center" color="text.secondary">
        <NotesIcon fontSize="small" sx={{ mr: 1 }} />
        {delivery.notes}
      </Typography>
    )}
  </Box>

  <Divider sx={{ my: 2 }} />

  <Typography variant="body2" fontWeight={600} gutterBottom>
    Assign Driver
  </Typography>
  <Select
    size="small"
    fullWidth
    value={assignedDriver}
    onChange={(e) => handleAssign(e.target.value)}
    sx={{ backgroundColor: '#fff' }}
  >
    {user && (
      <MenuItem value={user._id}>Assign Myself ({user.name})</MenuItem>
    )}
    {drivers.map((d) => (
      <MenuItem key={d._id} value={d._id.toString()}>
        {d.name}
      </MenuItem>
    ))}
  </Select>

  {canUpdateStatus && (
    <>
      <Typography variant="body2" fontWeight={600} mt={2} gutterBottom>
        Update Status
      </Typography>
      <Select
        size="small"
        fullWidth
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        sx={{ backgroundColor: '#fff' }}
      >
        <MenuItem value="In Route for Pick Up">In Route for Pick Up</MenuItem>
        <MenuItem value="Waiting for Paperwork">Waiting for Paperwork</MenuItem>
        <MenuItem value="Heading to Customer">Heading to Customer</MenuItem>
        <MenuItem value="Delivered">Delivered</MenuItem>
      </Select>
    </>
  )}
</Box>

  );
};

export default ManagerDeliveryCard;
