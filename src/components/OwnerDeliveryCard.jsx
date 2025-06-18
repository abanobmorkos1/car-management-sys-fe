import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
  Grid,
} from '@mui/material';

const statusColorMap = {
  Delivered: 'success',
  'Heading to Customer': 'info',
  'Waiting for Paperwork': 'warning',
  'In Route for Pick Up': 'default',
  Pending: 'default',
};

const OwnerDeliveryCard = ({ delivery }) => {
  if (!delivery) return null;

  const statusColor = statusColorMap[delivery.status] || 'primary';

  return (
    <Card
      elevation={4}
      sx={{
        borderRadius: 4,
        mb: 3,
        px: 2,
        py: 2,
        cursor: 'pointer',
        transition: '0.3s',
        '&:hover': { boxShadow: 6 },
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6" fontWeight={600} color="primary">
            {delivery.customerName || 'Unnamed Customer'}
          </Typography>
          <Chip
            label={delivery.status || 'No Status'}
            color={statusColor}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Delivery Info
              </Typography>
              <Typography variant="body2">
                <strong>Address:</strong> {delivery.address}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong>{' '}
                {new Date(delivery.deliveryDate).toLocaleString()}
              </Typography>
              {delivery.driver?.name && (
                <Typography variant="body2">
                  <strong>Driver:</strong> {delivery.driver.name}
                </Typography>
              )}
              {delivery.salesperson?.name && (
                <Typography variant="body2">
                  <strong>Sales:</strong> {delivery.salesperson.name}
                </Typography>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Vehicle Info
              </Typography>
              <Typography variant="body2">
                <strong>Vehicle:</strong> {delivery.year} {delivery.make}{' '}
                {delivery.model} {delivery.trim} — {delivery.color}
              </Typography>
              <Typography variant="body2">
                <strong>VIN:</strong> {delivery.vin}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                COD Info
              </Typography>
              <Typography variant="body2">
                <strong>COD Amount:</strong> ${delivery.codAmount || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Collected:</strong>{' '}
                {delivery.codCollected ? 'Yes' : 'No'}
              </Typography>
              {delivery.codCollected && delivery.codMethod && (
                <Typography variant="body2">
                  <strong>Payment Method:</strong> {delivery.codMethod}
                </Typography>
              )}
            </Stack>
          </Grid>

          {delivery.leaseReturn?.willReturn && (
            <Grid item xs={12}>
              <Chip
                label="Lease Return Expected"
                color="warning"
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OwnerDeliveryCard;
