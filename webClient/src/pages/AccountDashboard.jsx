import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { 
  Container, Typography, Box, Grid, Tabs, Tab, Paper, Stack, Button, TextField, Divider, Chip
} from "@mui/material";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

import { fetchProfile, updateProfile } from "../redux/slices/userSlice";
import { fetchMyOrders } from "../redux/slices/orderSlice";

const TabPanel = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ py: 3, px: { xs: 1, md: 3 } }}>
    {value === index && children}
  </Box>
);

const AccountDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, wishlist } = useSelector((s) => s.user);
  const { orders } = useSelector((s) => s.order);
  const { items: cartItems } = useSelector((s) => s.cart);

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "overview";

  const tabIndexMap = { overview: 0, profile: 1, addresses: 2, wishlist: 3, orders: 4 };
  const [tabValue, setTabValue] = useState(tabIndexMap[initialTab] || 0);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const reverseMap = ["overview", "profile", "addresses", "wishlist", "orders"];
    navigate(`/account?tab=${reverseMap[newValue]}`, { replace: true });
  };

  const [editName, setEditName] = useState("");
  useEffect(() => {
    if (profile) setEditName(profile.name);
  }, [profile]);

  const handleUpdateProfile = () => {
    dispatch(updateProfile({ name: editName }));
  };

  if (!profile) return <Container sx={{ py: 5 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container sx={{ py: { xs: 3, md: 6 }, maxWidth: "lg" }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ textAlign: { xs: "center", md: "left" } }}>
        My Account
      </Typography>

      <Grid container spacing={4} sx={{ mt: 1 }}>
        {/* Mobile/Desktop Tabs Navigation */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
            <Tabs 
              orientation="vertical" 
              variant="scrollable" 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{ 
                "& .MuiTab-root": { alignItems: "flex-start", py: 2, px: 3, textTransform: "none", fontSize: "1rem", fontWeight: 600 },
                borderRight: 1, borderColor: "divider",
                // On mobile make it horizontal scrollable
                "@media (max-width: 900px)": {
                  orientation: "horizontal",
                  borderRight: 0,
                  borderBottom: 1,
                  "& .MuiTab-root": { py: 1.5, px: 2, alignItems: "center" }
                }
              }}
            >
              <Tab icon={<PersonOutlineIcon sx={{ mr: 1, mb: "0 !important" }} />} iconPosition="start" label="Overview" />
              <Tab icon={<PersonOutlineIcon sx={{ mr: 1, mb: "0 !important" }} />} iconPosition="start" label="Profile Details" />
              <Tab icon={<LocationOnOutlinedIcon sx={{ mr: 1, mb: "0 !important" }} />} iconPosition="start" label="Addresses" />
              <Tab icon={<FavoriteBorderOutlinedIcon sx={{ mr: 1, mb: "0 !important" }} />} iconPosition="start" label="Wishlist" />
              <Tab icon={<LocalMallOutlinedIcon sx={{ mr: 1, mb: "0 !important" }} />} iconPosition="start" label="Order History" />
            </Tabs>
          </Paper>
        </Grid>

        {/* Tab Content Panels */}
        <Grid item xs={12} md={9}>
          <Paper elevation={0} sx={{ minHeight: 400, borderRadius: 3, bgcolor: "transparent" }}>
            
            {/* Overview */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Welcome, {profile.name}</Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ p: 3, bgcolor: "primary.light", borderRadius: 3, textAlign: "center" }}>
                    <LocalMallOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" fontWeight={800} color="primary.main">{orders.length}</Typography>
                    <Typography variant="body2" fontWeight={600}>Total Orders</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box sx={{ p: 3, bgcolor: "#FCE4EC", borderRadius: 3, textAlign: "center" }}>
                    <FavoriteBorderOutlinedIcon sx={{ color: "#E91E63", fontSize: 40 }} />
                    <Typography variant="h4" fontWeight={800} sx={{ color: "#E91E63" }}>{wishlist.length}</Typography>
                    <Typography variant="body2" fontWeight={600}>Favorites</Typography>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Profile */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Profile Details</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={3} sx={{ maxWidth: 400 }}>
                <TextField label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <TextField label="Email" value={profile.email} disabled />
                <TextField label="Phone" value={profile.phone || ""} disabled />
                <Button variant="contained" onClick={handleUpdateProfile} sx={{ py: 1.5, borderRadius: 2 }}>Save Changes</Button>
              </Stack>
            </TabPanel>

            {/* Addresses */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Manage Addresses</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2}>
                {(profile.addresses || []).map((addr, idx) => (
                  <Paper key={idx} elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                    <Typography fontWeight={700} gutterBottom>{addr.fullName} <Chip size="small" label={addr.label} sx={{ ml: 1 }} /></Typography>
                    <Typography variant="body2" color="text.secondary">{addr.line1}, {addr.line2}</Typography>
                    <Typography variant="body2" color="text.secondary">{addr.city}, {addr.state} - {addr.pincode}</Typography>
                    <Typography variant="body2" color="text.secondary">Phone: {addr.phone}</Typography>
                  </Paper>
                ))}
                {(!profile.addresses || profile.addresses.length === 0) && (
                  <Typography color="text.secondary">No addresses saved yet.</Typography>
                )}
                <Button variant="outlined" sx={{ alignSelf: "flex-start", mt: 2 }}>+ Add New Address</Button>
              </Stack>
            </TabPanel>

            {/* Wishlist */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" fontWeight={700} gutterBottom>My Wishlist</Typography>
              <Divider sx={{ mb: 3 }} />
              {wishlist.length === 0 && <Typography color="text.secondary">Your wishlist is empty.</Typography>}
              <Grid container spacing={3}>
                {/* Wishlist items render logic here when populated */}
              </Grid>
            </TabPanel>

            {/* Order History */}
            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Order History</Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={3}>
                {orders.map((o) => (
                  <Paper key={o._id} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
                    <Box sx={{ bgcolor: "grey.50", p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid", borderColor: "divider", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">ORDER PLACED</Typography>
                        <Typography variant="body2" fontWeight={600}>{new Date(o.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">TOTAL</Typography>
                        <Typography variant="body2" fontWeight={600}>₹{o.total}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">ORDER #</Typography>
                        <Typography variant="body2" fontWeight={600}>{o.orderNumber}</Typography>
                      </Box>
                      <Button component={RouterLink} to={`/orders/${o._id}`} variant="text" size="small" sx={{ fontWeight: 700 }}>
                        View Details
                      </Button>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        {o.items.slice(0,3).map(item => (
                          <Box key={item.product} component="img" src={item.image || "https://placehold.co/100"} sx={{ width: 60, height: 60, borderRadius: 1, objectFit: "cover", border: "1px solid", borderColor: "divider" }} />
                        ))}
                      </Stack>
                      <Chip label={o.status.replace("_", " ").toUpperCase()} color={o.status === 'delivered' ? 'success' : 'primary'} size="small" sx={{ fontWeight: 700 }} />
                    </Box>
                  </Paper>
                ))}
                {orders.length === 0 && <Typography color="text.secondary">You haven't placed any orders yet.</Typography>}
              </Stack>
            </TabPanel>

          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccountDashboard;
