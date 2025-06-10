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

const DriverDeliveryCard = ({ delivery, onStatusChange, userId }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const isAssigned =
    (typeof delivery.driver === 'string' && delivery.driver === userId) ||
    (typeof delivery.driver === 'object' && delivery.driver?._id === userId);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    await onStatusChange(delivery._id, newStatus);

    if (newStatus === 'Delivered') {
      navigate(`/driver/cod/from-delivery/${delivery._id}`);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        border: `2px solid #e0e0e0`,
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        boxShadow: 2,
        transition: 'all 0.3s ease',
        minHeight: '280px', // Add consistent minimum height
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Header section with consistent height */}
      <Box sx={{ minHeight: '60px', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="primary" mb={1}>
          {delivery.customerName || 'Customer'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Order #{delivery._id?.slice(-6)}
        </Typography>
      </Box>

      {/* Content section that grows to fill space */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Delivery details */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            color="blue"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <PhoneIcon fontSize="small" /> {delivery.phoneNumber}
          </Typography>
          <Typography
            variant="body2"
            color="blue"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <LocationOnIcon fontSize="small" /> {delivery.address}
          </Typography>
          <Typography
            variant="body2"
            color="blue"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <AccessTimeIcon fontSize="small" />{' '}
            {new Date(delivery.deliveryDate).toLocaleString()}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            color={delivery.codCollected ? 'success.main' : 'error.main'}
          >
            COD: ${delivery.codAmount}{' '}
            {delivery.codCollected
              ? `(via ${delivery.codMethod})`
              : '(Pending)'}
          </Typography>
          <Typography
            variant="body2"
            color="blue"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <DirectionsCarIcon fontSize="small" />
            {delivery.year} {delivery.make} {delivery.model} {delivery.trim} -{' '}
            {delivery.color}
          </Typography>
          {delivery.notes && (
            <Typography
              variant="body2"
              color="blue"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <NotesIcon fontSize="small" /> {delivery.notes}
            </Typography>
          )}
        </Box>

        {/* Status/Assignment section with consistent height */}
        <Box
          sx={{
            mt: 'auto',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {!isAssigned ? (
            <Typography
              variant="body2"
              sx={{
                color: 'error.main',
                fontWeight: 'bold',
                textAlign: 'center',
                width: '100%',
                p: 2,
                bgcolor: 'error.light',
                borderRadius: 1,
              }}
            >
              ⚠️ You are not assigned to this delivery
            </Typography>
          ) : (
            <Select
              value={delivery.status}
              onChange={handleStatusChange}
              size="small"
              fullWidth
              sx={{
                '& .MuiSelect-select': {
                  fontWeight: 'bold',
                  color:
                    delivery.status === 'delivered'
                      ? 'success.main'
                      : 'text.primary',
                },
              }}
            >
              <MenuItem value="In Route for Pick Up">
                In route for pick up
              </MenuItem>
              <MenuItem value="Waiting for Paperwork">
                Waiting for paperwork
              </MenuItem>
              <MenuItem value="Heading to Customer">
                Heading to customer
              </MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
            </Select>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DriverDeliveryCard;
