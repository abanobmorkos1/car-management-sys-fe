// components/ClockSessionItem.jsx
import { Box, Typography, Grid } from '@mui/material';

const ClockSessionItem = ({ driver, weeklyTotal }) => {
  return (
    <Box
      mb={3}
      p={3}
      border="1px solid #e0e0e0"
      borderRadius={2}
      bgcolor="#ffffff"
    >
      <Typography
        fontWeight="bold"
        color="primary"
        fontSize="1.2rem"
        mb={1}
      >
        {driver.driver?.name || 'Unknown Driver'}
      </Typography>

      <Grid container spacing={2} mb={1}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Today’s Hours:
          </Typography>
          <Typography variant="body1">
            {(driver.totalHours ?? 0).toFixed(2)} hrs
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Weekly Hours:
          </Typography>
          <Typography variant="body1">
            {(weeklyTotal?.total ?? 0).toFixed(2)} hrs
          </Typography>
        </Grid>
      </Grid>

      {Array.isArray(driver.sessions) && driver.sessions.length > 0 ? (
        driver.sessions.map((sesh, idx) => {
          const clockIn = new Date(sesh.clockIn).toLocaleTimeString();
          const clockOut = sesh.clockOut
            ? new Date(sesh.clockOut).toLocaleTimeString()
            : null;

          const duration = sesh.clockOut
            ? ((new Date(sesh.clockOut) - new Date(sesh.clockIn)) / 3600000).toFixed(2)
            : null;

          return (
            <Typography
              key={idx}
              variant="body2"
              color="text.secondary"
              mt={0.5}
            >
              ⏱ {clockIn} – {clockOut ? `${clockOut} (${duration} hrs)` : 'In progress'}
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
