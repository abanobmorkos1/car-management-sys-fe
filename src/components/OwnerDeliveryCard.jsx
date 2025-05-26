// components/OwnerDeliveryCard.jsx
import { Grid, Typography, Box } from '@mui/material';

const OwnerDeliveryCard = ({ delivery }) => {
  return (
    <Box>
      <Grid container spacing={2} sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
          <Typography>{delivery.phoneNumber}</Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" color="text.secondary">Address</Typography>
          <Typography>{delivery.address}</Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" color="text.secondary">Salesperson</Typography>
          <Typography>{delivery.salesperson?.name || 'N/A'}</Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" color="text.secondary">Driver</Typography>
          <Typography>{delivery.driver?.name || delivery.driver?.email || 'Unassigned'}</Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" color="text.secondary">Delivery Date</Typography>
          <Typography>{new Date(delivery.deliveryDate).toLocaleString()}</Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant="subtitle2" color="text.secondary">COD</Typography>
          <Typography>
            ${delivery.codAmount} {delivery.codCollected ? `(${delivery.codMethod})` : '(Pending)'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">Car Info</Typography>
          <Typography>
            {delivery.year} {delivery.make} {delivery.model} {delivery.trim} {delivery.color}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerDeliveryCard;
