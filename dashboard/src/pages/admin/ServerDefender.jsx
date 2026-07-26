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
  Stack,
  Divider,
  Checkbox,
  FormControl,
  Select,
  MenuItem
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GppBadIcon from "@mui/icons-material/GppBad";
import GppGoodIcon from "@mui/icons-material/GppGood";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useHeader } from "../../context/HeaderContext";

const ServerDefender = () => {
  const { setHeaderData } = useHeader();
  const [records, setRecords] = useState([]);
  const [attackLogs, setAttackLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [attackPage, setAttackPage] = useState(0);
  const [attackRowsPerPage, setAttackRowsPerPage] = useState(10); // default to 10 logs per page

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(records.map(r => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedIds.length === 0) return;
    try {
      await api.post("/defender/status/bulk", { ids: selectedIds, status });
      toast.success(`Successfully updated ${selectedIds.length} records.`);
      setSelectedIds([]);
      fetchRecords();
    } catch (err) {
      toast.error("Failed to perform bulk status update.");
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const [resDefender, resAttacks] = await Promise.all([
        api.get("/defender", { params: { q: search } }),
        api.get("/defender/attack-logs")
      ]);
      setRecords(resDefender.data.data || []);
      setAttackLogs(resAttacks.data.data || []);
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

  // Chart data formatting
  const getChartData = () => {
    const countsByTime = {};
    
    // Sort all timestamps to display a chronological line
    attackLogs
      .filter(log => log.timestamp && log.ip !== "-")
      .forEach(log => {
        const date = new Date(log.timestamp);
        // Format as HH:MM
        const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
        countsByTime[timeStr] = (countsByTime[timeStr] || 0) + 1;
      });

    const formattedData = Object.keys(countsByTime)
      .sort()
      .map(time => ({ time, incidents: countsByTime[time] }));

    if (formattedData.length === 0) {
      return [
        { time: "00:00", incidents: 0 },
        { time: "06:00", incidents: 0 },
        { time: "12:00", incidents: 0 },
        { time: "18:00", incidents: 0 },
        { time: "24:00", incidents: 0 }
      ];
    }
    
    // Pad chart data if too few points for aesthetic graph line
    if (formattedData.length === 1) {
      return [{ time: "Start", incidents: 0 }, ...formattedData, { time: "End", incidents: 0 }];
    }

    return formattedData;
  };

  return (
    <Box sx={{ p: 1 }}>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: "5px solid #d32f2f", bgcolor: "background.paper", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <GppBadIcon sx={{ fontSize: 40, color: "error.main" }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">Blocked Clients</Typography>
                  <Typography variant="h4" fontWeight={800}>{blockedCount}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: "5px solid #2e7d32", bgcolor: "background.paper", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <GppGoodIcon sx={{ fontSize: 40, color: "success.main" }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">Whitelisted Clients</Typography>
                  <Typography variant="h4" fontWeight={800}>{whitelistedCount}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: "5px solid #ed6c02", bgcolor: "background.paper", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 40, color: "warning.main" }} />
                <Box>
                  <Typography color="text.secondary" variant="body2">Active Grace Cooldowns</Typography>
                  <Typography variant="h4" fontWeight={800}>{graceCount}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Incident Chart Section */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
        <Box display="flex" alignItems="center" gap={1} mb={2.5}>
          <SecurityIcon color="primary" sx={{ fontSize: 24 }} />
          <Typography variant="h6" fontWeight={800} color="text.primary">
            Security Incident Trend (Requests Blocked / Suspicious Logs)
          </Typography>
        </Box>
        <Box sx={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <AreaChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#d32f2f" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: "0.75rem", fontWeight: 600 }} />
              <YAxis stroke="#64748b" style={{ fontSize: "0.75rem", fontWeight: 600 }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "8px", 
                  border: "1px solid rgba(0,0,0,0.08)", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)" 
                }} 
              />
              <Area type="monotone" dataKey="incidents" name="Incidents" stroke="#d32f2f" strokeWidth={3} fillOpacity={1} fill="url(#colorIncidents)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Active Rules / Defender Records Table */}
      <Paper sx={{ mb: 4, borderRadius: 3, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
        <Box sx={{ p: 2.5, bg: "background.paper", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="text.primary">
              Active Blocked / Whitelisted Devices
            </Typography>
            <Typography variant="caption" color="text.secondary">
              IP and MAC records dynamically generated from system rate-limiting rules.
            </Typography>
          </Box>
          {selectedIds.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mr: 1 }}>
                {selectedIds.length} selected
              </Typography>
              <Button size="small" variant="contained" color="success" onClick={() => handleBulkStatusChange("whitelisted")} sx={{ fontWeight: 700, textTransform: "none" }}>
                Bulk Whitelist
              </Button>
              <Button size="small" variant="contained" color="error" onClick={() => handleBulkStatusChange("blocked")} sx={{ fontWeight: 700, textTransform: "none" }}>
                Bulk Block
              </Button>
              <Button size="small" variant="contained" color="primary" onClick={() => handleBulkStatusChange("active")} sx={{ fontWeight: 700, textTransform: "none" }}>
                Bulk Reset
              </Button>
            </Stack>
          )}
        </Box>
        <Divider />
        <TableContainer>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: "rgba(0,0,0,0.01)" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedIds.length > 0 && selectedIds.length < records.length}
                      checked={records.length > 0 && selectedIds.length === records.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Client IP & MAC</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Connected Accounts</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Violations</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Grace Count</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cooldown Ends</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No active security records or rule deviations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((row) => (
                    <TableRow key={row._id} hover selected={selectedIds.includes(row._id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(row._id)}
                          onChange={() => handleSelectOne(row._id)}
                        />
                      </TableCell>
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
                          sx={{ fontWeight: 700, fontSize: "0.7rem" }}
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
      </Paper>

      {/* Security & Attack Logs Section */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={800} color="text.primary">
            Security & Attack Logs
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Log parsed incidents from combined.log files detailing suspicious requests.
          </Typography>
        </Box>
        <Divider />
        <TableContainer>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ bgcolor: "rgba(0,0,0,0.01)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Attack Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action Taken</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attackLogs.length === 0 || attackLogs[0]?.ip === "-" ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No attacks or suspicious activity logged recently.
                    </TableCell>
                  </TableRow>
                ) : (
                  attackLogs
                    .slice(attackPage * attackRowsPerPage, (attackPage + 1) * attackRowsPerPage)
                    .map((log, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontWeight: 600, color: "primary.dark" }}>
                          {log.ip}
                        </TableCell>
                        <TableCell>{log.type}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={log.action} 
                            color="error" 
                            size="small" 
                            sx={{ fontWeight: 700, fontSize: "0.7rem" }} 
                          />
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Attack Logs Pagination controls */}
        {attackLogs.length > 0 && attackLogs[0]?.ip !== "-" && (
          <>
            <Divider />
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">Logs per page:</Typography>
                <FormControl size="small" sx={{ minWidth: 70 }}>
                  <Select
                    value={attackRowsPerPage}
                    onChange={(e) => { setAttackRowsPerPage(Number(e.target.value)); setAttackPage(0); }}
                    sx={{ height: 30, fontSize: "0.75rem", borderRadius: 2 }}
                  >
                    <MenuItem value={10}>10 Logs</MenuItem>
                    <MenuItem value={20}>20 Logs</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  Page {attackPage + 1} of {Math.ceil(attackLogs.length / attackRowsPerPage) || 1}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={attackPage === 0}
                  onClick={() => setAttackPage(prev => prev - 1)}
                  sx={{ minWidth: 32, py: 0.25, fontWeight: "bold" }}
                >
                  &lt;
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={attackPage >= Math.ceil(attackLogs.length / attackRowsPerPage) - 1}
                  onClick={() => setAttackPage(prev => prev + 1)}
                  sx={{ minWidth: 32, py: 0.25, fontWeight: "bold" }}
                >
                  &gt;
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Paper>

    </Box>
  );
};

export default ServerDefender;
