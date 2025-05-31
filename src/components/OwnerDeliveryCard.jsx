import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack
} from '@mui/material';

const getProgressStatus = (delivery) => {
  if (!delivery.driver) return 'Pending';
  if (delivery.status === 'Delivered' || delivery.codCollected) return 'Delivered';
  return 'Assigned';
};

const getProgressColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'default';
    case 'Assigned':
      return 'info';
    case 'Delivered':
      return 'success';
    default:
      return 'default';
  }
};

const OwnerDeliveryCard = ({ delivery }) => {
  const progress = getProgressStatus(delivery);
  const driverName = delivery.driver?.name || delivery.driver?.email || 'Unassigned';
  const carInfo = [delivery.year, delivery.make, delivery.model, delivery.trim, delivery.color]
    .filter(Boolean)
    .join(' ');

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        // bgcolor: progress === 'Delivered' ? '#e8f5e9' : 'white',
        mb: 2
      }}
    >
      <CardContent>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            Delivery ID: {delivery._id?.slice(-6) || 'Unknown'}
          </Typography>
          <Chip label={progress} color={getProgressColor(progress)} />
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Delivery Details */}
        <Grid container spacing={2} sx={{ fontSize: '0.95rem', lineHeight: 2.2 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
            <Typography>{delivery.phoneNumber || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Address</Typography>
            <Typography>{delivery.address || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Salesperson</Typography>
            <Typography>{delivery.salesperson?.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Driver</Typography>
            <Typography>{driverName}</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">Delivery Date</Typography>
            <Typography>
              {delivery.deliveryDate
                ? new Date(delivery.deliveryDate).toLocaleString()
                : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">COD</Typography>
            <Typography>
              ${delivery.codAmount ?? 0}{' '}
              {delivery.codCollected ? `(${delivery.codMethod})` : '(Pending)'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Car Info</Typography>
            <Typography>{carInfo || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OwnerDeliveryCard;