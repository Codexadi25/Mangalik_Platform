import { useEffect, useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import api from "../../services/api";

const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/staff/delivery/orders").then(({ data }) => setOrders(data.data));
  useEffect(() => { load(); }, []);

  const markDelivered = async (id) => {
    await api.patch(`/staff/delivery/orders/${id}/status`, { status: "delivered" });
    load();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Assigned Orders</Typography>
      <Stack spacing={2}>
        {orders.map((o) => (
          <Box key={o._id} sx={{ border: "1px solid #eee", borderRadius: 2, p: 2, display: "flex", justifyContent: "space-between" }}>
            <Typography>{o.orderNumber} — {o.status}</Typography>
            {o.status !== "delivered" && <Button size="small" variant="contained" onClick={() => markDelivered(o._id)}>Mark Delivered</Button>}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
export default DeliveryOrders;
