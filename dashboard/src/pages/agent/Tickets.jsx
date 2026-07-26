import { useEffect, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";

const Tickets = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/staff/agent/tickets").then(({ data }) => setRows(data.data)); }, []);
  const columns = [
    { field: "ticketNumber", headerName: "Ticket #", width: 160 },
    { field: "subject", headerName: "Subject", flex: 1 },
    { field: "status", headerName: "Status", width: 130, renderCell: (p) => <Chip label={p.value} size="small" /> },
    { field: "priority", headerName: "Priority", width: 110 },
  ];
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Support Tickets</Typography>
      <DataTable rows={rows} columns={columns} />
    </Box>
  );
};
export default Tickets;
