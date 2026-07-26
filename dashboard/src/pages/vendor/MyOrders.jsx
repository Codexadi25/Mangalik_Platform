import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";

const MyOrders = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/vendors/me/orders").then(({ data }) => setRows(data.data)); }, []);
  const columns = [
    { field: "orderNumber", headerName: "Order #", width: 180 },
    { field: "status", headerName: "Status", width: 150 },
    { field: "total", headerName: "Total (₹)", width: 120 },
  ];
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>My Orders</Typography>
      <DataTable rows={rows} columns={columns} />
    </Box>
  );
};
export default MyOrders;
