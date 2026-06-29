import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  Container, Typography, TextField, Grid, Button, Box, Stack, Divider, Paper, CardActionArea 
} from "@mui/material";
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import MoneyOutlinedIcon from '@mui/icons-material/MoneyOutlined';
import { toast } from "react-toastify";
import api from "../services/api";
import { fetchCart } from "../redux/slices/cartSlice";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);
  
  const [address, setAddress] = useState({ fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    try {
      const subtotal = items.reduce((sum, i) => sum + (i.product?.basePrice || 0) * i.quantity, 0);
      const { data } = await api.post("/coupons/validate", { code: promoCode, orderValue: subtotal });
      setAppliedCoupon(data.data);
      toast.success("Promo code applied!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid promo code.");
      setAppliedCoupon(null);
    }
  };

  const placeOrder = async () => {
    try {
      const { data } = await api.post("/orders/checkout", { 
        shippingAddress: address, 
        paymentMethod,
        couponCode: appliedCoupon?.code
      });

      if (paymentMethod === "cod") {
        toast.success("Order placed successfully!");
        navigate("/account?tab=orders"); // Route to new account dashboard
        return;
      }

      const options = {
        key: data.data.razorpayKeyId,
        amount: data.data.order.total * 100,
        currency: "INR",
        name: "Mangalik",
        order_id: data.data.razorpayOrderId,
        handler: async (response) => {
          await api.post("/orders/verify-payment", {
            orderId: data.data.order._id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success("Payment successful! Order confirmed.");
          navigate("/account?tab=orders");
        },
        theme: { color: "#FF6F1E" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed.");
    }
  };

  const subtotal = items.reduce((sum, i) => sum + (i.product?.basePrice || 0) * i.quantity, 0);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shippingFee = discountedSubtotal > 999 ? 0 : 79;
  const gstAmount = Math.round(discountedSubtotal * 0.05);
  const total = discountedSubtotal + shippingFee + gstAmount;

  if (items.length === 0) {
    return (
      <Container sx={{ py: 5, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate("/products")}>Go Shopping</Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: { xs: 3, md: 5 }, maxWidth: "lg" }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ textAlign: { xs: 'center', md: 'left' } }}>
        Checkout
      </Typography>

      <Grid container spacing={4} sx={{ mt: { xs: 0, md: 1 } }}>
        {/* Left Side: Forms */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, border: "1px solid", borderColor: "divider", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <LocalShippingOutlinedIcon sx={{ color: "primary.main", mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Shipping Address</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField fullWidth label="Full Name" name="fullName" onChange={handleChange} variant="outlined" /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Phone Number" name="phone" onChange={handleChange} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Flat, House no., Building, Company" name="line1" onChange={handleChange} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="City" name="city" onChange={handleChange} /></Grid>
              <Grid item xs={6}><TextField fullWidth label="State" name="state" onChange={handleChange} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Pincode" name="pincode" onChange={handleChange} /></Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <PaymentOutlinedIcon sx={{ color: "primary.main", mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>Payment Method</Typography>
            </Box>
            <Stack spacing={2}>
              <CardActionArea 
                onClick={() => setPaymentMethod("razorpay")}
                sx={{ 
                  p: 2, borderRadius: 2, border: "2px solid", 
                  borderColor: paymentMethod === "razorpay" ? "primary.main" : "divider",
                  bgcolor: paymentMethod === "razorpay" ? "primary.light" : "transparent",
                  transition: "all 0.2s"
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CreditCardOutlinedIcon sx={{ color: paymentMethod === "razorpay" ? "primary.main" : "text.secondary", mr: 2 }} />
                  <Box>
                    <Typography fontWeight={600}>Pay Online</Typography>
                    <Typography variant="body2" color="text.secondary">Cards, UPI, Netbanking, Wallets</Typography>
                  </Box>
                </Box>
              </CardActionArea>
              <CardActionArea 
                onClick={() => setPaymentMethod("cod")}
                sx={{ 
                  p: 2, borderRadius: 2, border: "2px solid", 
                  borderColor: paymentMethod === "cod" ? "primary.main" : "divider",
                  bgcolor: paymentMethod === "cod" ? "primary.light" : "transparent",
                  transition: "all 0.2s"
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MoneyOutlinedIcon sx={{ color: paymentMethod === "cod" ? "primary.main" : "text.secondary", mr: 2 }} />
                  <Box>
                    <Typography fontWeight={600}>Cash on Delivery</Typography>
                    <Typography variant="body2" color="text.secondary">Pay via Cash or UPI at your doorstep</Typography>
                  </Box>
                </Box>
              </CardActionArea>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Side: Order Summary */}
        <Grid item xs={12} md={5}>
          <Box sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, bgcolor: "background.paper", boxShadow: "0 8px 32px rgba(0,0,0,0.06)", position: { md: "sticky" }, top: { md: 100 } }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Order Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2} sx={{ mb: 3, maxHeight: 300, overflowY: "auto" }}>
              {items.map(item => (
                <Box key={item.product._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box component="img" src={item.product.images?.[0]?.url || "https://placehold.co/100"} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: "cover", mr: 2 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>{item.product.title}</Typography>
                      <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>₹{item.product.basePrice * item.quantity}</Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", mb: 3 }}>
              <TextField 
                size="small" 
                fullWidth 
                placeholder="Promo Code" 
                value={promoCode} 
                onChange={(e) => setPromoCode(e.target.value)} 
                disabled={!!appliedCoupon}
                sx={{ mr: 1 }}
              />
              <Button variant="outlined" onClick={applyPromoCode} disabled={!!appliedCoupon}>
                Apply
              </Button>
            </Box>

            <Stack spacing={1} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={600}>₹{subtotal}</Typography>
              </Box>
              {appliedCoupon && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="success.main" fontWeight={600}>Discount ({appliedCoupon.code})</Typography>
                  <Typography color="success.main" fontWeight={600}>-₹{discount}</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography fontWeight={600}>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Tax (GST)</Typography>
                <Typography fontWeight={600}>₹{gstAmount}</Typography>
              </Box>
            </Stack>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>Total to Pay</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">₹{total}</Typography>
            </Box>

            <Button variant="contained" size="large" fullWidth onClick={placeOrder} sx={{ borderRadius: 2, py: 1.5, fontWeight: 700, fontSize: "1.1rem", background: "linear-gradient(90deg, #FF6F1E 0%, #FF9A44 100%)", boxShadow: "0 4px 14px rgba(255, 111, 30, 0.4)" }}>
              Place Order
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
