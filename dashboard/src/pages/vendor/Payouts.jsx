import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Payouts = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={800}>Vendor Payouts</Typography>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary" mb={2}>
          Payouts & Earnings
        </Typography>
        <Typography variant="body1">
          Your total earnings, pending clearances, and settled payments will appear here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Payouts;
