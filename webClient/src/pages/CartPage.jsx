import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { Container, Typography, Box, Stack, Button, IconButton, Divider } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { fetchCart } from "../redux/slices/cartSlice";
import api from "../services/api";

const CartPage = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const removeItem = async (productId) => {
    await api.delete(`/cart/item/${productId}`);
    dispatch(fetchCart());
  };

  const subtotal = items.reduce((sum, i) => sum + (i.product?.basePrice || 0) * i.quantity, 0);

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Your Cart</Typography>

      {items.length === 0 && <Typography color="text.secondary">Your cart is empty.</Typography>}

      <Stack spacing={2} sx={{ mt: 2 }}>
        {items.map((item) => (
          <Box key={item.product._id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
            <Box>
              <Typography fontWeight={600}>{item.product.title}</Typography>
              <Typography variant="body2" color="text.secondary">Qty: {item.quantity} × ₹{item.product.basePrice}</Typography>
            </Box>
            <IconButton onClick={() => removeItem(item.product._id)}><DeleteOutlineIcon /></IconButton>
          </Box>
        ))}
      </Stack>

      {items.length > 0 && (
        <Box sx={{ mt: 4, maxWidth: 360 }}>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>Subtotal</Typography>
            <Typography fontWeight={700}>₹{subtotal}</Typography>
          </Stack>
          <Button component={RouterLink} to="/checkout" variant="contained" fullWidth sx={{ mt: 2 }}>
            Proceed to Checkout
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CartPage;
