import { useEffect, useState } from "react";
import { Container, Typography, Box, Chip, Stack } from "@mui/material";
import api from "../services/api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/my").then(({ data }) => setOrders(data.data));
  }, []);

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>My Orders</Typography>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {orders.map((o) => (
          <Box key={o._id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={600}>{o.orderNumber}</Typography>
              <Chip label={o.status} color="primary" size="small" />
            </Stack>
            <Typography variant="body2" color="text.secondary">Total: ₹{o.total}</Typography>
          </Box>
        ))}
        {orders.length === 0 && <Typography color="text.secondary">No orders yet.</Typography>}
      </Stack>
    </Container>
  );
};

export default MyOrders;
