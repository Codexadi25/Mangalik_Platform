import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { 
  Container, Typography, Box, Stack, Button, IconButton, Divider, 
  Grid, Card, CardContent, CardMedia 
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { fetchCart } from "../redux/slices/cartSlice";
import api from "../services/api";

const CartPage = () => {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((s) => s.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const updateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    await api.post("/cart", { productId, quantity: newQty });
    dispatch(fetchCart());
  };

  const removeItem = async (productId) => {
    await api.delete(`/cart/item/${productId}`);
    dispatch(fetchCart());
  };

  const subtotal = items.reduce((sum, i) => sum + (i.product?.basePrice || 0) * i.quantity, 0);

  return (
    <Container sx={{ py: { xs: 3, md: 5 }, maxWidth: "lg" }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ textAlign: { xs: 'center', md: 'left' } }}>
        Your Cart
      </Typography>

      {!isLoading && items.length === 0 && (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <ShoppingCartOutlinedIcon sx={{ fontSize: 80, color: "text.secondary", opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Your cart is currently empty.
          </Typography>
          <Button component={RouterLink} to="/products" variant="contained" sx={{ mt: 3, borderRadius: 8, px: 4, py: 1.5, background: "linear-gradient(90deg, #FF6F1E 0%, #FF9A44 100%)" }}>
            Continue Shopping
          </Button>
        </Box>
      )}

      {items.length > 0 && (
        <Grid container spacing={4} sx={{ mt: { xs: 0, md: 2 } }}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {items.map((item) => (
                <Card key={item.product._id} elevation={0} sx={{ 
                  display: "flex", 
                  flexDirection: { xs: "row", sm: "row" }, 
                  border: "1px solid", 
                  borderColor: "divider", 
                  borderRadius: 3, 
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.05)" }
                }}>
                  <Box sx={{ width: { xs: 100, sm: 140 }, height: { xs: 100, sm: 140 }, flexShrink: 0, position: "relative" }}>
                    <CardMedia
                      component="img"
                      image={item.product.images?.[0]?.url || "https://placehold.co/400?text=No+Image"}
                      alt={item.product.title}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", p: { xs: 1.5, sm: 3 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, lineHeight: 1.2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                          {item.product.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1, sm: 2 } }}>
                          ₹{item.product.basePrice}
                        </Typography>
                      </Box>
                      <IconButton onClick={() => removeItem(item.product._id)} color="error" size="small" sx={{ bgcolor: "error.lighter" }}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: "auto" }}>
                      <Box sx={{ display: "flex", alignItems: "center", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                        <IconButton size="small" onClick={() => updateQuantity(item.product._id, item.quantity, -1)}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography fontWeight={600} sx={{ px: { xs: 1, sm: 2 } }}>{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQuantity(item.product._id, item.quantity, 1)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                        ₹{item.product.basePrice * item.quantity}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ 
              p: 3, 
              borderRadius: 3, 
              bgcolor: "background.paper", 
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              position: { md: "sticky" },
              top: { md: 100 }
            }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight={600}>₹{subtotal}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">Shipping Estimate</Typography>
                  <Typography fontWeight={600}>{subtotal > 999 ? 'Free' : '₹79'}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">Estimated Tax</Typography>
                  <Typography fontWeight={600}>₹{Math.round(subtotal * 0.05)}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" fontWeight={800}>Total</Typography>
                <Typography variant="h6" fontWeight={800} color="primary.main">
                  ₹{subtotal + (subtotal > 999 ? 0 : 79) + Math.round(subtotal * 0.05)}
                </Typography>
              </Box>
              <Button 
                component={RouterLink} 
                to="/checkout" 
                variant="contained" 
                size="large" 
                fullWidth 
                sx={{ 
                  borderRadius: 2, 
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  background: "linear-gradient(90deg, #FF6F1E 0%, #FF9A44 100%)",
                  boxShadow: "0 4px 14px rgba(255, 111, 30, 0.4)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(255, 111, 30, 0.6)"
                  }
                }}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CartPage;
