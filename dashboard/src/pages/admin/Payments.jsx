import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Payments = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={800}>Payments & Transactions</Typography>
      </Box>

      <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary" mb={2}>
          Payment Gateway Logs
        </Typography>
        <Typography variant="body1">
          A detailed view of all Razorpay transactions, refunds, and settlements will appear here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Payments;
