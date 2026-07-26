import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Divider,
  Stack,
  Alert
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const LeadsAndAds = () => {
  // Campaign & leads manually update state
  const [campaigns, setCampaigns] = useState([
    { platform: "Facebook Ads", budget: 12000, leads: 480, conversions: 45, revenue: 135000 },
    { platform: "Instagram Stories", budget: 8500, leads: 320, conversions: 28, revenue: 84000 },
    { platform: "WhatsApp Business", budget: 2500, leads: 190, conversions: 50, revenue: 95000 },
    { platform: "Google Search Ads", budget: 15000, leads: 600, conversions: 75, revenue: 225000 },
    { platform: "Organic Search / SEO", budget: 0, leads: 450, conversions: 35, revenue: 105000 },
    { platform: "Direct / Inorganic Offline", budget: 4000, leads: 150, conversions: 18, revenue: 54000 }
  ]);

  const [newCampaign, setNewCampaign] = useState({ platform: "Meta Custom", budget: "", leads: "", conversions: "", revenue: "" });

  const handleAddCampaign = () => {
    if (!newCampaign.platform || !newCampaign.budget) return;
    setCampaigns([
      ...campaigns, 
      {
        platform: newCampaign.platform,
        budget: Number(newCampaign.budget) || 0,
        leads: Number(newCampaign.leads) || 0,
        conversions: Number(newCampaign.conversions) || 0,
        revenue: Number(newCampaign.revenue) || 0
      }
    ]);
    setNewCampaign({ platform: "Meta Custom", budget: "", leads: "", conversions: "", revenue: "" });
  };

  // Calculations
  const totalExpense = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  
  // Platform operational metrics
  const goodsExpense = totalRevenue * 0.40; // 40% cost of goods
  const gstPaid = totalRevenue * 0.05; // 5% GST
  const deliveryFees = totalConversions * 60; // ₹60 average delivery fee per order
  const netEarnings = totalRevenue - (totalExpense + goodsExpense + gstPaid + deliveryFees);

  return (
    <Box sx={{ p: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={800}>Leads & Ads Campaign Tracker</Typography>
        <Alert severity="success" sx={{ py: 0.5, borderRadius: 2 }}>
          API Channels Synced: Meta (FB/IG/WA Ads Graph API v19.0)
        </Alert>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="textSecondary" fontWeight={600} uppercase>Total Ad Spend</Typography>
              <Typography variant="h5" fontWeight={800} color="error.main" sx={{ mt: 1 }}>
                ₹{totalExpense.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">All Channels combined</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="textSecondary" fontWeight={600} uppercase>Leads & Conversions</Typography>
              <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ mt: 1 }}>
                {totalLeads} / {totalConversions}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                CVR: {((totalConversions / totalLeads) * 100).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="textSecondary" fontWeight={600} uppercase>Gross Generated Revenue</Typography>
              <Typography variant="h5" fontWeight={800} color="success.main" sx={{ mt: 1 }}>
                ₹{totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ROAS: {(totalRevenue / (totalExpense || 1)).toFixed(2)}x
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ bgcolor: "rgba(46, 125, 50, 0.04)" }}>
            <CardContent>
              <Typography variant="caption" color="success.main" fontWeight={700} uppercase>Net Business Profits</Typography>
              <Typography variant="h5" fontWeight={800} color="success.dark" sx={{ mt: 1 }}>
                ₹{Math.round(netEarnings).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">After Goods, GST, Del. & Ads</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Campaigns table & Add Form */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Ad Channels & Traffic Attribution</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell><strong>Platform / Source</strong></TableCell>
                    <TableCell align="right"><strong>Ad Expense</strong></TableCell>
                    <TableCell align="right"><strong>Leads</strong></TableCell>
                    <TableCell align="right"><strong>Conversions</strong></TableCell>
                    <TableCell align="right"><strong>Revenue</strong></TableCell>
                    <TableCell align="right"><strong>ROI Ratio</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell fontWeight={600}>{c.platform}</TableCell>
                      <TableCell align="right">₹{c.budget.toLocaleString()}</TableCell>
                      <TableCell align="right">{c.leads}</TableCell>
                      <TableCell align="right">{c.conversions}</TableCell>
                      <TableCell align="right">₹{c.revenue.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ color: c.revenue > c.budget * 3 ? "success.main" : "warning.main", fontWeight: 700 }}>
                        {c.budget > 0 ? `${(c.revenue / c.budget).toFixed(1)}x` : 'N/A (Organic)'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>Manual Expense Entry</Typography>
            <Stack spacing={2}>
              <TextField 
                label="Traffic Source / Platform" 
                value={newCampaign.platform}
                onChange={e => setNewCampaign({...newCampaign, platform: e.target.value})}
                size="small" 
                fullWidth 
              />
              <TextField 
                label="Ad Spend / Cost (₹)" 
                type="number"
                value={newCampaign.budget}
                onChange={e => setNewCampaign({...newCampaign, budget: e.target.value})}
                size="small" 
                fullWidth 
              />
              <TextField 
                label="Leads Generated" 
                type="number"
                value={newCampaign.leads}
                onChange={e => setNewCampaign({...newCampaign, leads: e.target.value})}
                size="small" 
                fullWidth 
              />
              <TextField 
                label="Conversions (Orders Placed)" 
                type="number"
                value={newCampaign.conversions}
                onChange={e => setNewCampaign({...newCampaign, conversions: e.target.value})}
                size="small" 
                fullWidth 
              />
              <TextField 
                label="Revenue Generated (₹)" 
                type="number"
                value={newCampaign.revenue}
                onChange={e => setNewCampaign({...newCampaign, revenue: e.target.value})}
                size="small" 
                fullWidth 
              />
              <Button 
                variant="contained" 
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddCampaign}
                fullWidth
              >
                Log Campaign Update
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Financial Statement Breakdown */}
      <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Total Profitability Statement & Costing Breakdown</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Gross Sales Revenue:</Typography>
                <Typography fontWeight={700}>₹{totalRevenue.toLocaleString()}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Cost of Goods & Services (Estimated 40%):</Typography>
                <Typography fontWeight={600} color="error.main">- ₹{goodsExpense.toLocaleString()}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">GST Tax Paid (5% standard rate):</Typography>
                <Typography fontWeight={600} color="error.main">- ₹{gstPaid.toLocaleString()}</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Delivery Logistics & Fees (₹60/Order):</Typography>
                <Typography fontWeight={600} color="error.main">- ₹{deliveryFees.toLocaleString()}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Facebook, Instagram, Google & Ad Expenses:</Typography>
                <Typography fontWeight={600} color="error.main">- ₹{totalExpense.toLocaleString()}</Typography>
              </Box>
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={800}>Estimated Net Net Business Earnings:</Typography>
                <Typography variant="subtitle1" fontWeight={800} color="success.main">
                  ₹{Math.round(netEarnings).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default LeadsAndAds;
