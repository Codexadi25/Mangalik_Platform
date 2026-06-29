import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, TextField, Grid, Button, RadioGroup, FormControlLabel, Radio, Box } from "@mui/material";
import { toast } from "react-toastify";
import api from "../services/api";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState({ fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const placeOrder = async () => {
    try {
      const { data } = await api.post("/orders/checkout", { shippingAddress: address, paymentMethod });

      if (paymentMethod === "cod") {
        toast.success("Order placed successfully!");
        navigate("/orders");
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
          navigate("/orders");
        },
        theme: { color: "#FF6F1E" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed.");
    }
  };

  return (
    <Container sx={{ py: 5, maxWidth: 600 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Checkout</Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}><TextField fullWidth label="Full Name" name="fullName" onChange={handleChange} /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Phone" name="phone" onChange={handleChange} /></Grid>
        <Grid item xs={12}><TextField fullWidth label="Address Line" name="line1" onChange={handleChange} /></Grid>
        <Grid item xs={6}><TextField fullWidth label="City" name="city" onChange={handleChange} /></Grid>
        <Grid item xs={6}><TextField fullWidth label="State" name="state" onChange={handleChange} /></Grid>
        <Grid item xs={6}><TextField fullWidth label="Pincode" name="pincode" onChange={handleChange} /></Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography fontWeight={600}>Payment Method</Typography>
        <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <FormControlLabel value="razorpay" control={<Radio />} label="Pay Online (Cards / UPI / Netbanking)" />
          <FormControlLabel value="cod" control={<Radio />} label="Cash on Delivery" />
        </RadioGroup>
      </Box>

      <Button variant="contained" size="large" fullWidth sx={{ mt: 3 }} onClick={placeOrder}>
        Place Order
      </Button>
    </Container>
  );
};

export default CheckoutPage;
