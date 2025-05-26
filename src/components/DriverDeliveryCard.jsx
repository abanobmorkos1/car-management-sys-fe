import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  useTheme,
  Divider,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotesIcon from '@mui/icons-material/Notes';

const DriverDeliveryCard = ({ delivery, onStatusChange, onAssignDriver, userId, availableDrivers }) => {
  const theme = useTheme();

const isAssigned =
  (typeof delivery.driver === 'string' && delivery.driver === userId) ||
  (typeof delivery.driver === 'object' && delivery.driver?._id === userId);

  const handleStatusChange = (e) => {
    onStatusChange(delivery._id, e.target.value);
  };

  const handleAssignDriver = async (e) => {
  const newDriverId = e.target.value;
  try {
    await onAssignDriver(delivery._id, newDriverId);
  } catch (err) {
    console.error('❌ Failed to assign driver:', err.message);
  }
};

  return (
    <Box
      p={2}
      border="1px solid #e0e0e0"
      borderRadius={2}
      bgcolor={theme.palette.background.paper}
      boxShadow={2}
    >
      <Typography fontWeight="bold" fontSize="1.1rem" mb={1} color="primary.main">
        {delivery.customerName}
      </Typography>

      <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
        <PhoneIcon fontSize="small" /> {delivery.phoneNumber}
      </Typography>
      <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
        <LocationOnIcon fontSize="small" /> {delivery.address}
      </Typography>
      <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
        <AccessTimeIcon fontSize="small" /> {new Date(delivery.deliveryDate).toLocaleString()}
      </Typography>
      <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
        <LocalAtmIcon fontSize="small" />
        ${delivery.codAmount} {delivery.codCollected ? `(via ${delivery.codMethod})` : '(Pending)'}
      </Typography>
      <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
        <DirectionsCarIcon fontSize="small" />
        {delivery.year} {delivery.make} {delivery.model} {delivery.trim} - {delivery.color}
      </Typography>
      {delivery.notes && (
        <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
          <NotesIcon fontSize="small" /> {delivery.notes}
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {isAssigned ? (
        <>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Status
          </Typography>
          <Select
            size="small"
            fullWidth
            value={delivery.status}
            onChange={handleStatusChange}
          >
            <MenuItem value="In Route for Pick Up">In route for pick up</MenuItem>
            <MenuItem value="Waiting for Paperwork">Waiting for paperwork</MenuItem>
            <MenuItem value="Heading to Customer">Heading to customer</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
          </Select>

          {delivery.status !== 'Delivered' && (
            <Button
              fullWidth
              sx={{ mt: 1 }}
              variant="contained"
              color="success"
              onClick={() => onStatusChange(delivery._id, 'Delivered')}
            >
              Mark as Delivered
            </Button>
          )}
        </>
      ) : availableDrivers ? (
        <>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Assign Driver
          </Typography>
          <Select
            size="small"
            fullWidth
            value={typeof delivery.driver === 'object' ? delivery.driver._id : delivery.driver || ''}
            onChange={handleAssignDriver}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {availableDrivers.map((d) => (
              <MenuItem key={d._id} value={d._id}>
                {d.name}
              </MenuItem>
            ))}
            <MenuItem value={userId}>Assign Myself</MenuItem>
          </Select>
        </>
      ) : (
        <Typography color="error" mt={1}>
          You are not assigned to this delivery.
        </Typography>
      )}
    </Box>
  );
};

// Ensure this component receives `userId` and `availableDrivers` props correctly from parent layout
export default DriverDeliveryCard;
