import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  Container, Typography, Box, Grid, Paper, Stack, Divider, Button, Stepper, Step, StepLabel, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { fetchOrderById, replaceOrder, clearCurrentOrder } from "../redux/slices/orderSlice";

const trackingSteps = ["Placed", "Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, isLoading } = useSelector((s) => s.order);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [replaceReason, setReplaceReason] = useState("");

  useEffect(() => {
    dispatch(fetchOrderById(id));
    return () => { dispatch(clearCurrentOrder()); };
  }, [dispatch, id]);

  const handleReplaceSubmit = () => {
    dispatch(replaceOrder({ id, reason: replaceReason }));
    setReplaceDialogOpen(false);
  };

  if (isLoading || !order) return <Container sx={{ py: 5 }}><Typography>Loading order...</Typography></Container>;

  // Determine active step
  const statusMap = {
    placed: 0, confirmed: 1, processing: 2, packed: 2, shipped: 3, out_for_delivery: 4, delivered: 5,
    cancelled: -1, returned: -1, replacement_requested: 5, replaced: 5
  };
  const activeStep = statusMap[order.status] || 0;

  return (
    <Container sx={{ py: { xs: 3, md: 5 }, maxWidth: "lg" }}>
      <Button component={RouterLink} to="/account?tab=orders" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
        Back to Orders
      </Button>
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Order Details</Typography>
          <Typography variant="body1" color="text.secondary">Order # {order.orderNumber} • Placed on {new Date(order.createdAt).toLocaleDateString()}</Typography>
        </Box>
        {order.status === "delivered" && (
          <Button variant="outlined" color="primary" onClick={() => setReplaceDialogOpen(true)}>
            Request Replacement
          </Button>
        )}
      </Box>

      {/* Tracking Tracker */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Track Package</Typography>
        <Box sx={{ width: '100%', overflowX: "auto", py: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ minWidth: 600 }}>
            {trackingSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        {(order.status === "replacement_requested" || order.status === "replaced") && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "warning.lighter", borderRadius: 2, display: "flex", alignItems: "center" }}>
            <CheckCircleOutlineIcon color="warning" sx={{ mr: 1 }} />
            <Typography fontWeight={600} color="warning.dark">
              {order.status === "replacement_requested" ? "Replacement has been requested and is under review." : "Order has been successfully replaced."}
            </Typography>
          </Box>
        )}
      </Paper>

      <Grid container spacing={4}>
        {/* Left Side: Items & What's in the Box */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>What's in the Box</Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={4}>
              {order.items.map((item, idx) => (
                <Box key={idx} sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3 }}>
                  <Box component="img" src={item.image || "https://placehold.co/150"} sx={{ width: { xs: "100%", sm: 150 }, height: 150, objectFit: "cover", borderRadius: 2, border: "1px solid", borderColor: "divider" }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700}>{item.title}</Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>Qty: {item.quantity} × ₹{item.price}</Typography>
                    
                    {item.addOns && item.addOns.length > 0 && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>Included Add-Ons:</Typography>
                        {item.addOns.map((addon, i) => (
                          <Typography key={i} variant="body2" color="text.secondary">• {addon.title} (Qty: {addon.quantity})</Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Typography variant="h6" fontWeight={700}>₹{item.price * item.quantity}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Right Side: Order Summary & Address */}
        <Grid item xs={12} md={4}>
          <Stack spacing={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Order Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography color="text.secondary">Item(s) Subtotal</Typography><Typography>₹{order.subtotal}</Typography></Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography color="text.secondary">Shipping</Typography><Typography>₹{order.shippingFee}</Typography></Box>
                {order.discount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography color="success.main">Discount ({order.couponCode})</Typography>
                    <Typography color="success.main">-₹{order.discount}</Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography color="text.secondary">Tax</Typography><Typography>₹{order.gstAmount}</Typography></Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" fontWeight={800}>Grand Total</Typography>
                <Typography variant="h6" fontWeight={800}>₹{order.total}</Typography>
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Shipping Address</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography fontWeight={600}>{order.shippingAddress?.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">{order.shippingAddress?.line1}</Typography>
              <Typography variant="body2" color="text.secondary">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</Typography>
              <Typography variant="body2" color="text.secondary">Phone: {order.shippingAddress?.phone}</Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={replaceDialogOpen} onClose={() => setReplaceDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Request Order Replacement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for the replacement. We will review your request and process it shortly.
          </Typography>
          <TextField 
            fullWidth 
            multiline 
            rows={4} 
            placeholder="E.g., Item was damaged during transit..."
            value={replaceReason}
            onChange={(e) => setReplaceReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setReplaceDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleReplaceSubmit} disabled={!replaceReason.trim()}>Submit Request</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetails;
