// components/ClockSessionItem.jsx
import { Box, Typography, Grid } from '@mui/material';
import { format } from 'date-fns';

const ClockSessionItem = ({
  driver,
  sessions,
  totalHours,
  weeklyTotalHours,
  todaysDate,
  weekRange,
}) => {
  return (
    <Box
      mb={3}
      p={3}
      border="1px solid #e0e0e0"
      borderRadius={2}
      bgcolor="#ffffff"
    >
      <Typography fontWeight="bold" color="primary" fontSize="1.2rem" mb={1}>
        {driver?.name || 'Unknown Driver'}
      </Typography>

      <Grid container spacing={2} mb={1}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Today’s Hours ({format(new Date(todaysDate), 'MMM dd')}):
          </Typography>
          <Typography variant="body1">
            {(Number(totalHours) || 0).toFixed(2)} hrs
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Weekly Hours (Starting from{' '}
            {weekRange ? `${format(new Date(weekRange), 'MMM dd')}` : 'N/A'}):
          </Typography>
          <Typography variant="body1">
            {(Number(weeklyTotalHours) || 0).toFixed(2)} hrs
          </Typography>
        </Grid>
      </Grid>

      {Array.isArray(sessions) && sessions.length > 0 ? (
        sessions.map((sesh, idx) => {
          const clockIn = new Date(sesh.clockIn).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          const clockOut = sesh.clockOut
            ? new Date(sesh.clockOut).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            : null;

          const duration = sesh.clockOut
            ? (
                (new Date(sesh.clockOut) - new Date(sesh.clockIn)) /
                3600000
              ).toFixed(2)
            : null;
          const dayMonth = new Date(sesh.clockIn).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          return (
            <Typography
              key={idx}
              variant="body2"
              color="text.secondary"
              mt={0.5}
            >
              ⏱{dayMonth}, {clockIn} –{' '}
              {clockOut
                ? `${dayMonth}, ${clockOut} (${duration} hrs)`
                : 'In progress'}
            </Typography>
          );
        })
      ) : (
        <Typography variant="body2" color="text.secondary">
          No sessions recorded today.
        </Typography>
      )}
    </Box>
  );
};

export default ClockSessionItem;
