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
      p={2}
      border="1px solid #e0e0e0"
      borderRadius={2}
      bgcolor={theme.palette.background.paper}
      boxShadow={2}
    >
      <Typography fontWeight="bold" fontSize="1.1rem" mb={1} color="primary.main">
        {delivery.customerName || 'Unnamed Customer'}
      </Typography>

      {delivery.phoneNumber && (
        <Typography variant="body2" color="blue" display="flex" alignItems="center" gap={1}>
          <PhoneIcon fontSize="small" /> {delivery.phoneNumber}
        </Typography>
      )}
      <Typography variant="body2" color="blue" display="flex" alignItems="center" gap={1}>
        <LocationOnIcon fontSize="small" /> {delivery.address}
      </Typography>
      <Typography variant="body2" color="blue" display="flex" alignItems="center" gap={1}>
        <AccessTimeIcon fontSize="small" /> {new Date(delivery.deliveryDate).toLocaleString()}
      </Typography>
      <Typography variant="body2" color="blue" display="flex" alignItems="center" gap={1}>
        <LocalAtmIcon fontSize="small" />
        ${delivery.codAmount} {delivery.codCollected ? `(via ${delivery.codMethod})` : '(Pending)'}
      </Typography>
      <Typography variant="body2" color="blue" display="flex" alignItems="center" gap={1}>
        <DirectionsCarIcon fontSize="small" />
        {delivery.year} {delivery.make} {delivery.model} {delivery.trim} - {delivery.color}
      </Typography>
      {delivery.notes && (
        <Typography variant="body2" color="blue" display="flex" alignItems="center" gap={1}>
          <NotesIcon fontSize="small" /> {delivery.notes}
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="body2" fontWeight="bold" gutterBottom>
        Assign Driver
      </Typography>
      <Select
        size="small"
        fullWidth
        value={assignedDriver}
        onChange={(e) => handleAssign(e.target.value)}
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
          <Typography variant="body2" fontWeight="bold" mt={2} gutterBottom>
            Update Status
          </Typography>
          <Select
            size="small"
            fullWidth
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <MenuItem value="In Route for Pick Up">In route for pick up</MenuItem>
            <MenuItem value="Waiting for Paperwork">Waiting for paperwork</MenuItem>
            <MenuItem value="Heading to Customer">Heading to customer</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </Select>
        </>
      )}
    </Box>
  );
};

export default ManagerDeliveryCard;
