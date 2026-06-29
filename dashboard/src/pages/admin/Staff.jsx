import { useEffect, useState } from "react";
import { Box, Typography, MenuItem, Select } from "@mui/material";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";

const ROLES = ["manager", "agent", "deliveryPartner", "salesPartner", "vendor"];

const Staff = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/users").then(({ data }) => { setRows(data.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const changeRole = async (id, role) => {
    await api.patch(`/users/${id}/role`, { role });
    load();
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "role",
      headerName: "Role",
      width: 180,
      renderCell: (params) => (
        <Select size="small" value={params.value} onChange={(e) => changeRole(params.row._id, e.target.value)}>
          {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          <MenuItem value="user">user</MenuItem>
        </Select>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Staff Management</Typography>
      <DataTable rows={rows} columns={columns} loading={loading} />
    </Box>
  );
};

export default Staff;
