import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";

const AuditLogs = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/superadmin/audit-logs").then(({ data }) => setRows(data.data)); }, []);
  const columns = [
    { field: "action", headerName: "Action", width: 220 },
    { field: "actorRole", headerName: "Actor Role", width: 140 },
    { field: "targetType", headerName: "Target", width: 140 },
    { field: "createdAt", headerName: "Timestamp", flex: 1 },
  ];
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Audit Logs</Typography>
      <DataTable rows={rows} columns={columns} />
    </Box>
  );
};
export default AuditLogs;
