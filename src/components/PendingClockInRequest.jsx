// components/PendingClockInRequest.jsx

import { Box, Typography, Button, Grid, Divider } from '@mui/material';

const PendingClockInRequest = ({ request, onApprove, onReject }) => {
  const driverName = request.driver?.name || 'Unnamed Driver';
  const clockInTime = new Date(request.clockIn).toLocaleString();

  return (
    <Box
      mb={2}
      p={3}
      border="1px solid #e0e0e0"
      borderRadius={2}
      bgcolor="#fff"
    >
      <Typography variant="subtitle1" fontWeight="bold" color="primary">
        {driverName}
      </Typography>

      <Typography variant="body2" color="text.secondary" mt={0.5}>
        Requested Clock-In: {clockInTime}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={() => onApprove(request._id)}
          >
            Approve
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={() => onReject(request._id)}
          >
            Reject
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PendingClockInRequest;
