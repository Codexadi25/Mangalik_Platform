import { useEffect, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";

const Orders = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/staff/manager/orders").then(({ data }) => {
      setRows(data.data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { field: "orderNumber", headerName: "Order #", width: 180 },
    { field: "total", headerName: "Total (₹)", width: 120 },
    { field: "paymentMethod", headerName: "Payment", width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => <Chip label={params.value} size="small" color="primary" />,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Orders</Typography>
      <DataTable rows={rows} columns={columns} loading={loading} />
    </Box>
  );
};

export default Orders;
