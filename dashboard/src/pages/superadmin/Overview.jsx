import { Box, Typography, Grid, Paper } from "@mui/material";

const StatCard = ({ label, value }) => (
  <Paper sx={{ p: 3 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="h4" fontWeight={800}>{value}</Typography>
  </Paper>
);

const Overview = () => (
  <Box>
    <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Business Overview</Typography>
    <Grid container spacing={2}>
      <Grid item xs={6} md={3}><StatCard label="Orders Today" value="--" /></Grid>
      <Grid item xs={6} md={3}><StatCard label="Revenue Today" value="₹--" /></Grid>
      <Grid item xs={6} md={3}><StatCard label="Active Products" value="--" /></Grid>
      <Grid item xs={6} md={3}><StatCard label="Pending Tickets" value="--" /></Grid>
    </Grid>
  </Box>
);

export default Overview;
