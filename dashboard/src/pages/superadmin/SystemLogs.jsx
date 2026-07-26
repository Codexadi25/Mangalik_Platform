import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  Select,
  MenuItem,
  Stack,
  Card,
  CardContent,
  Collapse,
  CircularProgress,
  Chip,
  Divider
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useHeader } from "../../context/HeaderContext";

const SystemLogs = () => {
  const { setHeaderData } = useHeader();
  const [logs, setLogs] = useState([]);
  const [filterType, setFilterType] = useState("errors"); // default to "errors" like screenshot
  const [limit, setLimit] = useState(15); // default to 15 Logs like screenshot
  const [loading, setLoading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/superadmin/system-logs", {
        params: { filterType, limit }
      });
      setLogs(data.data || []);
    } catch (err) {
      toast.error("Failed to load system logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHeaderData({
      title: "System Logs",
      subtitle: "Review application execution logs, exceptions, and latency metadata.",
      actionComponent: (
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Level Filter */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ bgcolor: "#fff", borderRadius: 2 }}
            >
              <MenuItem value="all">All Logs</MenuItem>
              <MenuItem value="errors">Errors Only</MenuItem>
            </Select>
          </FormControl>

          {/* Limit Filter */}
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <Select
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              sx={{ bgcolor: "#fff", borderRadius: 2 }}
            >
              <MenuItem value={15}>15 Logs</MenuItem>
              <MenuItem value={50}>50 Logs</MenuItem>
              <MenuItem value={100}>100 Logs</MenuItem>
            </Select>
          </FormControl>

          {/* Refresh Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={fetchLogs}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            sx={{
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              py: 1
            }}
          >
            REFRESH LOGS
          </Button>
        </Stack>
      )
    });
    return () => setHeaderData({ title: "", subtitle: "", actionComponent: null });
  }, [filterType, limit, loading]);

  useEffect(() => {
    fetchLogs();
  }, [filterType, limit]);

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getLogTitle = (log) => {
    if (log.meta?.statusCode) {
      return `HTTP ${log.meta.statusCode}: ${log.message}`;
    }
    return log.message;
  };

  return (
    <Box sx={{ p: 1 }}>
      {loading && logs.length === 0 ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      ) : logs.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: "center", borderRadius: 3, color: "text.secondary" }}>
          No system log entries found matching the active filters.
        </Paper>
      ) : (
        <Stack spacing={2}>
          {logs.map((log) => {
            const isExpanded = expandedLogId === log._id;
            const isError = log.level.toLowerCase() === "error";

            return (
              <Card
                key={log._id}
                sx={{
                  borderLeft: isError ? "4px solid #ef4444" : "4px solid #3b82f6",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.01)",
                  borderRadius: 2,
                  border: "1px solid rgba(0,0,0,0.04)"
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      {/* Badge Tags */}
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <Chip
                          label={log.level.toUpperCase()}
                          size="small"
                          color={isError ? "error" : "primary"}
                          sx={{ fontWeight: 800, height: 20, fontSize: "0.68rem", borderRadius: 1 }}
                        />
                        {isError && (
                          <Chip
                            label="high"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              height: 20,
                              fontSize: "0.68rem",
                              borderRadius: 1,
                              bgcolor: "#fef2f2",
                              color: "#ef4444"
                            }}
                          />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {new Date(log.timestamp || log.createdAt).toLocaleString()}
                        </Typography>
                      </Stack>

                      {/* Main Message Title */}
                      <Typography variant="body2" fontWeight={700} color="#1e293b" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {getLogTitle(log)}
                      </Typography>
                    </Box>

                    {/* Show/Hide Details Button */}
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => toggleExpand(log._id)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        borderRadius: 1.5,
                        py: 0.5,
                        px: 2,
                        bgcolor: "#2563eb",
                        "&:hover": { bgcolor: "#1d4ed8" }
                      }}
                    >
                      {isExpanded ? "Hide Details" : "Show Details"}
                    </Button>
                  </Box>

                  {/* Expanded Content Details */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ mt: 2 }}>
                    <Divider sx={{ my: 1.5 }} />
                    <Box display="flex" flexDirection="column" gap={1.25} sx={{ pl: 1 }}>
                      <Box>
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block">
                          Description:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                          {log.message}
                        </Typography>
                      </Box>

                      {log.meta?.action && (
                        <Box>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block">
                            Action:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                            {log.meta.action}
                          </Typography>
                        </Box>
                      )}

                      {log.meta?.statusCode && (
                        <Box>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block">
                            Status Code:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                            {log.meta.statusCode}
                          </Typography>
                        </Box>
                      )}

                      {log.meta?.responseTime && (
                        <Box>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block">
                            Response Time:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                            {log.meta.responseTime}
                          </Typography>
                        </Box>
                      )}

                      {log.meta?.ip && (
                        <Box>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block">
                            IP:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                            {log.meta.ip}
                          </Typography>
                        </Box>
                      )}

                      {log.meta?.userAgent && (
                        <Box>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block">
                            User Agent:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "text.primary" }}>
                            {log.meta.userAgent}
                          </Typography>
                        </Box>
                      )}

                      {log.meta?.stack && (
                        <Box>
                          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Stack Trace:
                          </Typography>
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "#f8fafc",
                              borderRadius: 2,
                              borderLeft: "3px solid #ef4444",
                              fontFamily: "monospace",
                              fontSize: "0.78rem",
                              lineHeight: 1.6,
                              overflowX: "auto",
                              whiteSpace: "pre-wrap",
                              color: "#ef4444"
                            }}
                          >
                            {log.meta.stack}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default SystemLogs;
