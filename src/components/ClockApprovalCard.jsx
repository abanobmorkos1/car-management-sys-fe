// components/ClockApprovalCard.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  CircularProgress
} from '@mui/material';

const ClockApprovalCard = ({ request, onApprove, onReject, loading = false }) => {
  const { _id, driver, clockIn, date } = request;

  return (
    <Card elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          {driver?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Date: {date}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Requested at: {new Date(clockIn).toLocaleTimeString()}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => onApprove(_id)}
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Approve'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onReject(_id)}
            fullWidth
            disabled={loading}
          >
            Reject
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ClockApprovalCard;
