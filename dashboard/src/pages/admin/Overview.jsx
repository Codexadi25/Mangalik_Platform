import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Divider,
  Stack
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import api from "../../services/api";
import { toast } from "react-toastify";

const COLORS = ['#1877F2', '#E1306C', '#DB4437', '#25D366'];

const StatCard = ({ label, value, color }) => (
  <Paper sx={{ p: 2, borderLeft: `4px solid ${color}` }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="h5" fontWeight={800}>{value}</Typography>
  </Paper>
);

const Overview = () => {
  const [data, setData] = useState({
    usersCount: 0, pendingOrders: 0, activeTickets: 0, overallSales: 0, salesChartData: [], segmentData: [], unprocessedOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [partnerName, setPartnerName] = useState("Shadowfax");
  const [trackingId, setTrackingId] = useState("");

  const fetchData = async () => {
    try {
      const res = await api.get("/superadmin/overview");
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load overview data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus, extraData = {}) => {
    try {
      const payload = { status: newStatus, ...extraData };
      const { data } = await api.put(`/orders/${orderId}/status`, payload);
      toast.success(`Order status successfully updated to ${newStatus}`);
      fetchData();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order status.");
    }
  };

  const handleOrderClick = async (order) => {
    try {
      const { data } = await api.get(`/orders/${order._id}`);
      setSelectedOrder(data.data);
      if (data.data?.shipment) {
        setPartnerName(data.data.shipment.deliveryPartnerName || "Shadowfax");
        setTrackingId(data.data.shipment.trackingId || "");
      } else {
        setPartnerName("Shadowfax");
        setTrackingId("");
      }
    } catch (e) {
      setSelectedOrder(order);
    }
  };

  const trackingSteps = ["placed", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];
  const getStepIndex = (status) => trackingSteps.indexOf(status);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={800}>Revenue OS (Operations Dashboard)</Typography>
        <TextField
          placeholder="Lifeline Search..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300, bgcolor: 'background.paper', borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Top Stats */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Total Platform Users" value={data.usersCount.toLocaleString()} color="#3b82f6" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Overall Sales" value={`₹ ${(data.overallSales / 1000).toFixed(1)}k`} color="#10b981" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Pending Orders" value={data.pendingOrders.toLocaleString()} color="#f59e0b" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard label="Active Tickets" value={data.activeTickets.toLocaleString()} color="#ef4444" /></Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} mb={2}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Sales Over Time</Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.salesChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="organic" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="inorganic" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Segments Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Inorganic Sources</Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.segmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Requiring Action */}
      <Card sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Orders Requiring Action (Placed / Confirmed)
        </Typography>
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Update Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!data.unprocessedOrders || data.unprocessedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 2, color: "text.secondary" }}>
                    No pending/unprocessed orders found.
                  </TableCell>
                </TableRow>
              ) : (
                data.unprocessedOrders.map((order) => (
                  <TableRow 
                    key={order._id} 
                    hover 
                    onClick={() => handleOrderClick(order)}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell fontWeight={600} style={{ color: "#E33C24", fontWeight: "bold" }}>{order.orderNumber}</TableCell>
                    <TableCell>
                      {order.user?.name || "Guest"}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {order.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>₹ {order.total}</TableCell>
                    <TableCell>
                      <Chip label={(order.paymentStatus || "").toUpperCase()} size="small" color={order.paymentStatus === "paid" ? "success" : "warning"} />
                    </TableCell>
                    <TableCell>
                      <Chip label={(order.status || "").toUpperCase()} size="small" color={order.status === "confirmed" ? "primary" : "default"} />
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Select
                        size="small"
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        sx={{ minWidth: 130 }}
                      >
                        <MenuItem value="placed">Placed</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="packed">Packed</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Order Processing Dialog Box */}
      <Dialog 
        open={Boolean(selectedOrder)} 
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, padding: 1 }
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ fontWeight: 800, fontSize: "1.3rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Order Fulfillment Wizard</span>
              <Chip 
                label={(selectedOrder.status || "").toUpperCase()} 
                color={selectedOrder.status === "delivered" ? "success" : selectedOrder.status === "cancelled" ? "error" : "warning"}
                variant="filled"
                sx={{ fontWeight: "bold" }}
              />
            </DialogTitle>
            <DialogContent dividers>
              {/* Stepper progress */}
              <Box sx={{ width: '100%', py: 2, mb: 3 }}>
                <Stepper activeStep={getStepIndex(selectedOrder.status)} alternativeLabel>
                  {trackingSteps.map((label) => (
                    <Step key={label}>
                      <StepLabel sx={{ textTransform: "capitalize" }}>
                        {label === "placed" ? "placed" : label.replace(/_/g, " ")}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom>Order Details</Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: "#f8fafc" }}>
                    <Stack spacing={1}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Order ID:</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedOrder.orderNumber}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Customer Name:</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Contact Phone:</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedOrder.shippingAddress?.phone || "-"}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Shipping Address:</Typography>
                        <Typography variant="body2" sx={{ textAlign: "right", maxWidth: "200px" }}>
                          {selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Grand Total:</Typography>
                        <Typography variant="body2" fontWeight={800} color="primary.main">₹ {selectedOrder.total}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          fullWidth
                          onClick={() => window.open(`/orders/${selectedOrder._id}/print?type=invoice`, "_blank")}
                          sx={{ textTransform: "none", fontSize: 11, fontWeight: 700 }}
                        >
                          🖨️ Print Invoice
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          size="small"
                          fullWidth
                          onClick={() => window.open(`/orders/${selectedOrder._id}/print?type=bill`, "_blank")}
                          sx={{ textTransform: "none", fontSize: 11, fontWeight: 700 }}
                        >
                          📄 Print Bill
                        </Button>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom>Workflow Tasks & Actions</Typography>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, minHeight: "150px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    
                    {/* Action Step 1: Placed -> Confirm/Cancel */}
                    {selectedOrder.status === "placed" && (
                      <Box>
                        <Typography variant="body2" mb={2}>
                          Please review the order items and accept to proceed, or reject the order.
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                          <InputLabel>Rejection Reason (If rejecting)</InputLabel>
                          <Select
                            label="Rejection Reason (If rejecting)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          >
                            <option value="" disabled style={{ padding: "8px" }}>Select Reason</option>
                            <option value="Out of Stock" style={{ padding: "8px" }}>Out of Stock</option>
                            <option value="Invalid Address" style={{ padding: "8px" }}>Invalid Address</option>
                            <option value="Delivery Unserviceable" style={{ padding: "8px" }}>Delivery Unserviceable</option>
                            <option value="Ritual Item Constraint" style={{ padding: "8px" }}>Ritual Item Constraint</option>
                          </Select>
                        </FormControl>
                        <Stack direction="row" spacing={2}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            fullWidth
                            onClick={() => handleUpdateOrderStatus(selectedOrder._id, "confirmed")}
                          >
                            Accept Order
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            fullWidth
                            disabled={!rejectionReason}
                            onClick={() => handleUpdateOrderStatus(selectedOrder._id, "cancelled", { rejectionReason })}
                          >
                            Reject Order
                          </Button>
                        </Stack>
                      </Box>
                    )}

                    {/* Action Step 2: Confirmed -> Processing */}
                    {selectedOrder.status === "confirmed" && (
                      <Box>
                        <Typography variant="body2" mb={2}>
                          <strong>Next Step: Processing</strong>
                          <br />
                          Check item inventory internally. System will mark invoices & bills as ready.
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="warning" 
                          fullWidth
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "processing")}
                        >
                          Start Processing Order
                        </Button>
                      </Box>
                    )}

                    {/* Action Step 3: Processing -> Packed */}
                    {selectedOrder.status === "processing" && (
                      <Box>
                        <Typography variant="body2" mb={2}>
                          <strong>Next Step: Packing & Labeling</strong>
                          <br />
                          Specify tracking options below to compile the shipping parcel.
                        </Typography>
                        
                        <Grid container spacing={1} mb={2}>
                          <Grid item xs={6}>
                            <TextField 
                              fullWidth 
                              size="small" 
                              label="Delivery Partner" 
                              value={partnerName}
                              onChange={(e) => setPartnerName(e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField 
                              fullWidth 
                              size="small" 
                              label="Tracking ID (Optional)" 
                              placeholder="Auto-Generated"
                              value={trackingId}
                              onChange={(e) => setTrackingId(e.target.value)}
                            />
                          </Grid>
                        </Grid>

                        <Button 
                          variant="contained" 
                          color="info" 
                          fullWidth
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "packed", {
                            deliveryPartnerName: partnerName,
                            trackingId: trackingId || undefined
                          })}
                        >
                          Mark as Packed & Alerts Dispatch
                        </Button>
                      </Box>
                    )}

                    {/* Action Step 4: Packed -> Shipped */}
                    {selectedOrder.status === "packed" && (
                      <Box>
                        <Typography variant="body2" mb={2}>
                          <strong>Next Step: Shipped (Delivery handover)</strong>
                          <br />
                          Attaches tracking details, creates shipment registry, and generates unique Shipment ID.
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mb: 2, bgcolor: "#eff6ff", p: 1, borderRadius: 1 }}>
                          ℹ️ Shipment partner: {selectedOrder.shipment?.deliveryPartnerName || partnerName || "Shadowfax"}
                          <br />
                          Tracking reference: {selectedOrder.shipment?.trackingId || "Auto-Pending"}
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="secondary" 
                          fullWidth
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "shipped")}
                        >
                          Mark as Shipped
                        </Button>
                      </Box>
                    )}

                    {/* Action Step 5: Shipped -> Out for Delivery */}
                    {selectedOrder.status === "shipped" && (
                      <Box>
                        <Typography variant="body2" mb={2}>
                          <strong>Next Step: Out for Delivery</strong>
                          <br />
                          Trigger courier pick-up. Marks the dispatch status as in-transit.
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          fullWidth
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "out_for_delivery")}
                        >
                          Dispatch: Out for Delivery
                        </Button>
                      </Box>
                    )}

                    {/* Action Step 6: Out for Delivery -> Delivered */}
                    {selectedOrder.status === "out_for_delivery" && (
                      <Box>
                        <Typography variant="body2" mb={2}>
                          <strong>Next Step: Complete Order Delivery</strong>
                          <br />
                          Confirm delivery verification code. Releases customer invoice downloads.
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="success" 
                          fullWidth
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "delivered")}
                        >
                          Confirm Delivered
                        </Button>
                      </Box>
                    )}

                    {/* Terminal States */}
                    {(selectedOrder.status === "delivered" || selectedOrder.status === "cancelled") && (
                      <Box sx={{ textAlign: "center", py: 2 }}>
                        <Typography fontWeight={700} color={selectedOrder.status === "delivered" ? "success.main" : "error.main"}>
                          {selectedOrder.status === "delivered" ? "✅ Order Completed & Delivered" : "❌ Order Rejected & Cancelled"}
                        </Typography>
                        {selectedOrder.rejectionReason && (
                          <Typography variant="caption" display="block" mt={1}>
                            Rejection Reason: {selectedOrder.rejectionReason}
                          </Typography>
                        )}
                      </Box>
                    )}

                  </Paper>
                </Grid>
              </Grid>

              {/* Items List */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700} gutterBottom>Itemized Order Checklist</Typography>
                <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                      <th style={{ padding: "8px" }}>Item Description</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Qty</th>
                      <th style={{ padding: "8px", textAlign: "right" }}>Price</th>
                      <th style={{ padding: "8px", textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "8px", fontWeight: 600 }}>{item.title}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>{item.quantity}</td>
                        <td style={{ padding: "8px", textAlign: "right" }}>₹ {item.price}</td>
                        <td style={{ padding: "8px", textAlign: "right" }}>₹ {item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedOrder(null)} variant="outlined">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Overview;
