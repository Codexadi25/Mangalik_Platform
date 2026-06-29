import { useEffect, useState } from "react";
import { Box, Typography, Switch } from "@mui/material";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";

const Vendors = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/vendors").then(({ data }) => { setRows(data.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const toggleActive = async (id, isActive) => {
    await api.patch(`/vendors/${id}/status`, { isActive });
    load();
  };

  const columns = [
    { field: "businessName", headerName: "Vendor", flex: 1 },
    { field: "commissionPercent", headerName: "Commission %", width: 140 },
    {
      field: "isActive",
      headerName: "Active",
      width: 120,
      renderCell: (params) => (
        <Switch checked={params.value} onChange={(e) => toggleActive(params.row._id, e.target.checked)} />
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Vendors</Typography>
      <DataTable rows={rows} columns={columns} loading={loading} />
    </Box>
  );
};

export default Vendors;
