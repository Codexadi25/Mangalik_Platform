import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Stack
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GppBadIcon from "@mui/icons-material/GppBad";
import GppGoodIcon from "@mui/icons-material/GppGood";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useHeader } from "../../context/HeaderContext";

const ServerDefender = () => {
  const { setHeaderData } = useHeader();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/defender", { params: { q: search } });
      setRecords(data.data || []);
    } catch (err) {
      toast.error("Failed to load security records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHeaderData({
      title: "Server Defender",
      searchPlaceholder: "Search by IP, MAC, or accounts...",
      searchValue: search,
      onSearchChange: setSearch,
      actionComponent: (
        <Button variant="contained" color="primary" onClick={fetchRecords} disabled={loading} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
          Refresh
        </Button>
      )
    });
    return () => setHeaderData({ title: "", subtitle: "", searchPlaceholder: "", searchValue: "", onSearchChange: null, actionComponent: null });
  }, [search, loading]);

  useEffect(() => {
    fetchRecords();
  }, [search]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const { data } = await api.post("/defender/status", { id, status });
      toast.success(`Device status updated to ${status}.`);
      setRecords(records.map(r => r._id === id ? data.data : r));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  // Stats helpers
  const blockedCount = records.filter(r => r.status === "blocked").length;
  const whitelistedCount = records.filter(r => r.status === "whitelisted").length;
  const graceCount = records.filter(r => r.status === "grace").length;

  return (
    <Box sx={{ p: 1 }}>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: "5px solid #d32f2f", bgcolor: "background.paper" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <GppBadIcon sx={{ fontSize: 40, color: "error.main" }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">Blocked Clients</Typography>
                  <Typography variant="h4" fontWeight={700}>{blockedCount}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: "5px solid #2e7d32", bgcolor: "background.paper" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <GppGoodIcon sx={{ fontSize: 40, color: "success.main" }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">Whitelisted Clients</Typography>
                  <Typography variant="h4" fontWeight={700}>{whitelistedCount}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: "5px solid #ed6c02", bgcolor: "background.paper" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 40, color: "warning.main" }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">Active Grace Cooldowns</Typography>
                  <Typography variant="h4" fontWeight={700}>{graceCount}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Records Table */}
      <TableContainer component={Paper} elevation={1}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client IP & MAC</TableCell>
                <TableCell>Connected Accounts</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Violations</TableCell>
                <TableCell>Grace Count</TableCell>
                <TableCell>Cooldown Ends</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    No security violations or defender records found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{row.ip}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        MAC: {row.deviceMac}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {row.connectedAccounts && row.connectedAccounts.length > 0 ? (
                        row.connectedAccounts.map((acc, index) => (
                          <Chip key={index} label={acc} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">None</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status.toUpperCase()}
                        size="small"
                        color={
                          row.status === "blocked"
                            ? "error"
                            : row.status === "whitelisted"
                            ? "success"
                            : row.status === "grace"
                            ? "warning"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>{row.violationsCount}</TableCell>
                    <TableCell>{row.graceIncrements} / 3</TableCell>
                    <TableCell>
                      {row.graceUntil ? (
                        new Date(row.graceUntil).toLocaleTimeString()
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 180 }}>
                      <Typography variant="caption" noWrap>{row.reason || "N/A"}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {row.status !== "whitelisted" && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleUpdateStatus(row._id, "whitelisted")}
                          >
                            Whitelist
                          </Button>
                        )}
                        {row.status !== "blocked" && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleUpdateStatus(row._id, "blocked")}
                          >
                            Block
                          </Button>
                        )}
                        {(row.status === "blocked" || row.status === "whitelisted" || row.status === "grace") && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleUpdateStatus(row._id, "active")}
                          >
                            Reset
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default ServerDefender;
