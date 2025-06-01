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
import { useNavigate } from 'react-router-dom';

const DriverDeliveryCard = ({ delivery, onStatusChange, onAssignDriver, userId, availableDrivers }) => {
  const theme = useTheme();
  const navigate = useNavigate();

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
      bgcolor={delivery.status === 'Delivered' ? '#f3f4f6' : theme.palette.background.paper}
      boxShadow={2}
      sx={{ opacity: delivery.status === 'Delivered' ? 0.6 : 1 }}
    >
      <Typography fontWeight="bold" fontSize="1.1rem" mb={1} color="primary.main">
        {delivery.customerName}
      </Typography>

      {/* ✅ Show completed badge for all roles */}
      {delivery.status === 'Delivered' && (
        <Typography variant="body2" color="success.main" fontWeight="bold" mb={1}>
          ✅ Delivery Completed
        </Typography>
      )}

      <Typography variant="body2" color="blue" display="flex" alignItems="center" gap={1}>
        <PhoneIcon fontSize="small" /> {delivery.phoneNumber}
      </Typography>
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

      {/* ✅ Show controls if assigned */}
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

          {delivery.status === 'Delivered' && (
            <Button
              fullWidth
              sx={{ mt: 1 }}
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/driver/cod/from-delivery/${delivery._id}`)}
            >
              Upload COD
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

export default DriverDeliveryCard;
