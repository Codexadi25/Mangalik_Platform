import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";

const Catalog = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products", { params: { limit: 100 } }).then(({ data }) => {
      setRows(data.data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { field: "title", headerName: "Product", flex: 1 },
    { field: "basePrice", headerName: "Price (₹)", width: 120 },
    { field: "stock", headerName: "Stock", width: 100 },
    { field: "isActive", headerName: "Active", width: 100, type: "boolean" },
    { field: "isApprovedByAdmin", headerName: "Approved", width: 110, type: "boolean" },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>Catalog</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Add Product</Button>
      </Box>
      <DataTable rows={rows} columns={columns} loading={loading} />
    </Box>
  );
};

export default Catalog;
