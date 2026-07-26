import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";

const MyCatalog = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/products", { params: { limit: 100 } }).then(({ data }) => setRows(data.data)); }, []);
  const columns = [
    { field: "title", headerName: "Product", flex: 1 },
    { field: "basePrice", headerName: "Price (₹)", width: 120 },
    { field: "stock", headerName: "Stock", width: 100 },
    { field: "isApprovedByAdmin", headerName: "Approved", width: 120, type: "boolean" },
  ];
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>My Catalog</Typography>
      <DataTable rows={rows} columns={columns} />
    </Box>
  );
};
export default MyCatalog;
