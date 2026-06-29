import { useEffect, useState } from "react";
import { Box, Typography, Switch } from "@mui/material";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";

const UserManagement = () => {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/users").then(({ data }) => setRows(data.data));
  useEffect(() => { load(); }, []);

  const toggleSuspend = async (id, isSuspended) => {
    await api.patch(`/superadmin/users/${id}/suspend`, { isSuspended });
    load();
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", width: 140 },
    {
      field: "isSuspended",
      headerName: "Suspended",
      width: 130,
      renderCell: (p) => <Switch checked={!!p.value} onChange={(e) => toggleSuspend(p.row._id, e.target.checked)} />,
    },
  ];
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>User & Role Management</Typography>
      <DataTable rows={rows} columns={columns} />
    </Box>
  );
};
export default UserManagement;
