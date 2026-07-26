import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";

const Commissions = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/sales-partners/me/commissions").then(({ data }) => setRows(data.data)); }, []);
  const columns = [
    { field: "orderNumber", headerName: "Order #", width: 180 },
    { field: "commissionAmount", headerName: "Commission (₹)", width: 160 },
    { field: "status", headerName: "Order Status", width: 150 },
  ];
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Commissions</Typography>
      <DataTable rows={rows} columns={columns} />
    </Box>
  );
};
export default Commissions;
