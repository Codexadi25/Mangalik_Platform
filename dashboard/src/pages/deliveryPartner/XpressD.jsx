import React from 'react';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const activeDeliveries = [
  { id: 'ORD-8059', address: '123 Main St, Koramangala', status: 'Picked Up', eta: '10 mins' },
  { id: 'ORD-8060', address: '456 Tech Park, HSR Layout', status: 'Assigned', eta: '25 mins' }
];

const XpressD = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={800}>XpressD (Logistics Dashboard)</Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, backgroundColor: 'primary.light', borderRadius: 2, color: 'primary.contrastText' }}>
              <LocalShippingIcon />
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Active Deliveries</Typography>
              <Typography variant="h5" fontWeight="bold">2</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, backgroundColor: 'success.light', borderRadius: 2, color: 'success.contrastText' }}>
              <AssignmentTurnedInIcon />
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Completed Today</Typography>
              <Typography variant="h5" fontWeight="bold">14</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, backgroundColor: 'warning.light', borderRadius: 2, color: 'warning.contrastText' }}>
              <AccountBalanceWalletIcon />
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">Earnings Today</Typography>
              <Typography variant="h5" fontWeight="bold">₹ 850</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" mb={2}>Active Assignments</Typography>
      <Grid container spacing={2}>
        {activeDeliveries.map(delivery => (
          <Grid item xs={12} md={6} key={delivery.id}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">{delivery.id}</Typography>
                <Chip size="small" label={delivery.status} color={delivery.status === 'Picked Up' ? 'info' : 'default'} />
              </Box>
              <Typography variant="body2" color="textSecondary" mb={2}>
                Destination: {delivery.address}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="error">ETA: {delivery.eta}</Typography>
                <Typography variant="body2" sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'primary.main' }}>
                  View Route
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default XpressD;
