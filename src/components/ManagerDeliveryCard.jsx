import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  MenuItem,
  Select,
  useTheme,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotesIcon from '@mui/icons-material/Notes';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const api = process.env.REACT_APP_API_URL;

const ManagerDeliveryCard = ({
  delivery,
  drivers = [],
  user,
  onAssignDriver,
}) => {
  const navigate = useNavigate();
  const [assignedDriver, setAssignedDriver] = useState('');
  const [status, setStatus] = useState(delivery?.status || '');

  useEffect(() => {
    if (delivery?.driver) {
      const driverId =
        typeof delivery.driver === 'object'
          ? delivery.driver._id
          : delivery.driver;
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
      await fetch(`${api}/api/delivery/update-status/${delivery._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      if (newStatus === 'Delivered') {
        navigate(`/driver/cod/from-delivery/${delivery._id}`);
      }
      onAssignDriver();
    } catch (err) {
      console.error('Error updating delivery status:', err);
    }
  };

  const isSelfAssigned =
    user?.role === 'Management' && assignedDriver === user?._id;
  const canUpdateStatus = isSelfAssigned || user?.role === 'Manager';

  return (
    <Box
      p={3}
      borderRadius={3}
      bgcolor="#fff"
      boxShadow={3}
      sx={{ transition: '0.3s', '&:hover': { boxShadow: 6 }, mb: 2 }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="h6" fontWeight={700} color="primary">
          {delivery.customerName || 'Unnamed Customer'}
        </Typography>
        <Chip
          label={status || 'Pending'}
          color={
            status === 'Delivered'
              ? 'success'
              : status === 'Heading to Customer'
                ? 'info'
                : status === 'Waiting for Paperwork'
                  ? 'warning'
                  : 'default'
          }
          size="small"
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Main Info */}
      <Stack spacing={1}>
        {delivery.leaseReturn?.willReturn && (
          <Chip
            label="Lease Return Scheduled"
            color="warning"
            size="small"
            sx={{ mb: 1 }}
          />
        )}
        <Typography variant="subtitle2" color="text.secondary">
          Contact & Schedule
        </Typography>
        {delivery.phoneNumber && (
          <Typography variant="body2">
            <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
            <strong>Phone:</strong> {delivery.phoneNumber}
          </Typography>
        )}
        <Typography variant="body2">
          <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
          <strong>Address:</strong> {delivery.address}
        </Typography>
        <Typography variant="body2">
          <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
          <strong>Delivery Date:</strong>{' '}
          {format(new Date(delivery.deliveryDate), 'MMM dd, yyyy hh:mm a')}{' '}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" mt={2}>
          Vehicle
        </Typography>
        <Typography variant="body2">
          <DirectionsCarIcon fontSize="small" sx={{ mr: 1 }} />
          <strong>Vehicle:</strong> {delivery.year} {delivery.make}{' '}
          {delivery.model} {delivery.trim} - {delivery.color}
        </Typography>

        {delivery.notes && (
          <Typography variant="body2">
            <NotesIcon fontSize="small" sx={{ mr: 1 }} />
            <strong>Notes:</strong> {delivery.notes}
          </Typography>
        )}

        <Typography variant="subtitle2" color="text.secondary" mt={2}>
          COD
        </Typography>
        <Typography variant="body2">
          <LocalAtmIcon fontSize="small" sx={{ mr: 1 }} />
          <strong>COD Amount:</strong> ${delivery.codAmount || 0}{' '}
          {delivery.codCollected ? (
            <Chip
              label={`Collected via ${delivery.codMethod}`}
              color="success"
              size="small"
              sx={{ ml: 1 }}
            />
          ) : (
            <Chip
              label="COD Pending"
              color="warning"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Driver Assignment */}
      <Typography fontWeight={600} variant="body2">
        Assign Driver
      </Typography>
      <Select
        size="small"
        fullWidth
        value={assignedDriver}
        onChange={(e) => handleAssign(e.target.value)}
        sx={{ mt: 0.5, backgroundColor: '#fff' }}
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

      {/* Status Update */}
      {canUpdateStatus && (
        <>
          <Typography fontWeight={600} variant="body2" mt={2}>
            Update Status
          </Typography>
          <Select
            size="small"
            fullWidth
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            sx={{ mt: 0.5, backgroundColor: '#fff' }}
          >
            <MenuItem value="In Route for Pick Up">
              In Route for Pick Up
            </MenuItem>
            <MenuItem value="Waiting for Paperwork">
              Waiting for Paperwork
            </MenuItem>
            <MenuItem value="Heading to Customer">Heading to Customer</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </Select>
        </>
      )}
    </Box>
  );
};

export default ManagerDeliveryCard;
