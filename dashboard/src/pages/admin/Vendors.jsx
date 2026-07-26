import { useEffect, useState, useRef } from "react";
import { 
  Box, 
  Typography, 
  Switch, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  IconButton,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Menu
} from "@mui/material";
import { useHeader } from "../../context/HeaderContext";
import AddIcon from "@mui/icons-material/Add";
import BadgeIcon from '@mui/icons-material/Badge';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from "../../components/widgets/DataTable";
import VendorCard from "../vendor/VendorCard";
import api from "../../services/api";
import { toast } from "react-toastify";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Vendors = () => {
  const { setHeaderData } = useHeader();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", businessName: "", gstNumber: "", membershipPlan: "Silver", referralCode: "", password: "" });
  
  const [viewCardVendor, setViewCardVendor] = useState(null);
  const cardFrontRef = useRef(null);
  const cardBackRef = useRef(null);
  const downloadWrapperRef = useRef(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  // Edit / Modify Vendor Details State
  const [editingVendor, setEditingVendor] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    gstNumber: "",
    commissionPercent: 10,
    membershipPlan: "Silver",
    referralCode: ""
  });

  // Link Coupon State
  const [linkingVendor, setLinkingVendor] = useState(null);
  const [couponCodeToLink, setCouponCodeToLink] = useState("");

  // Performance Analytics State
  const [performanceVendor, setPerformanceVendor] = useState(null);
  const [basisFilter, setBasisFilter] = useState("monthly");
  const [performanceData, setPerformanceData] = useState(null);

  const load = () => api.get("/vendors").then(({ data }) => { setRows(data.data); setLoading(false); });
  
  useEffect(() => {
    setHeaderData({
      title: "Vendors",
      actionComponent: (
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setIsFormOpen(true)} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
          Onboard Vendor
        </Button>
      )
    });
    return () => setHeaderData({ title: "", subtitle: "", searchPlaceholder: "", searchValue: "", onSearchChange: null, actionComponent: null });
  }, []);

  useEffect(() => { load(); }, []);

  const toggleActive = async (id, isActive) => {
    await api.patch(`/vendors/${id}/status`, { isActive });
    load();
  };

  const handleOnboardSubmit = async () => {
    try {
      await api.post("/vendors/onboard", formData);
      toast.success("Vendor successfully onboarded!");
      setIsFormOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to onboard vendor");
    }
  };

  // Modify Vendor Details Submit
  const handleEditSubmit = async () => {
    try {
      await api.patch(`/vendors/${editingVendor._id}/details`, editFormData);
      toast.success("Vendor details successfully modified!");
      setEditingVendor(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to modify vendor");
    }
  };

  // Link Coupon Code Submit
  const handleLinkCouponSubmit = async () => {
    try {
      await api.post(`/vendors/${linkingVendor._id}/link-coupon`, { couponCode: couponCodeToLink });
      toast.success(`Coupon ${couponCodeToLink} successfully linked to vendor!`);
      setLinkingVendor(null);
      setCouponCodeToLink("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to link coupon");
    }
  };

  // Fetch Vendor Performance Data
  const fetchPerformance = async (vendorId, basis) => {
    try {
      const { data } = await api.get(`/vendors/${vendorId}/performance`, { params: { basis } });
      setPerformanceData(data.data);
    } catch (err) {
      toast.error("Failed to load performance metrics");
    }
  };

  const handleDeleteVendor = async (vendor) => {
    if (window.confirm(`Are you sure you want to delete vendor "${vendor.businessName}"?`)) {
      try {
        await api.delete(`/vendors/${vendor._id}`);
        toast.success("Vendor deleted successfully!");
        load();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete vendor");
      }
    }
  };

  useEffect(() => {
    if (performanceVendor) {
      fetchPerformance(performanceVendor._id, basisFilter);
    }
  }, [performanceVendor, basisFilter]);

  // Export Combined Card as JPEG or PDF side-by-side
  const handleExportCard = async (format) => {
    setExportAnchorEl(null);
    if (!downloadWrapperRef.current) return;
    
    // Briefly force side-by-side display block to capture it correctly
    const originalStyle = downloadWrapperRef.current.style.cssText;
    downloadWrapperRef.current.style.cssText = "display: flex !important; flex-direction: row !important; gap: 20px !important; width: 900px !important; background: #ffffff !important; padding: 20px !important;";
    
    try {
      const canvas = await html2canvas(downloadWrapperRef.current, { 
        useCORS: true, 
        backgroundColor: "#ffffff",
        scale: 2 // High resolution
      });
      
      const fileName = `vendor-card-${viewCardVendor.businessName.replace(/\s+/g, '-')}`;
      
      if (format === "jpeg") {
        const link = document.createElement("a");
        link.download = `${fileName}.jpeg`;
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click();
        toast.success("Card exported as JPEG successfully!");
      } else if (format === "pdf") {
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, "JPEG", 10, 10, pdfWidth - 20, pdfHeight - 20);
        pdf.save(`${fileName}.pdf`);
        toast.success("Card exported as PDF successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to export card.");
    } finally {
      downloadWrapperRef.current.style.cssText = originalStyle;
    }
  };

  // Top Summaries Calculation
  const totalNetSales = rows.reduce((sum, r) => sum + (r.netSalesGenerated || 0), 0);
  const totalOutstanding = rows.reduce((sum, r) => sum + (r.outstandingCommission || 0), 0);
  const totalClaimed = rows.reduce((sum, r) => sum + (r.claimedCommission || 0), 0);

  const columns = [
    { field: "businessName", headerName: "Vendor / Business", flex: 1 },
    { field: "commissionPercent", headerName: "Commission %", width: 120 },
    { field: "referralCode", headerName: "Referral Code", width: 130 },
    { 
      field: "netSalesGenerated", 
      headerName: "Net Sales", 
      width: 130, 
      renderCell: (params) => `₹${(params.value || 0).toLocaleString()}` 
    },
    { 
      field: "outstandingCommission", 
      headerName: "Outstanding Comm.", 
      width: 140, 
      renderCell: (params) => `₹${(params.value || 0).toLocaleString()}` 
    },
    { 
      field: "claimedCommission", 
      headerName: "Claimed Comm.", 
      width: 130, 
      renderCell: (params) => `₹${(params.value || 0).toLocaleString()}` 
    },
    {
      field: "isActive",
      headerName: "Active",
      width: 90,
      renderCell: (params) => (
        <Switch checked={params.value} onChange={(e) => toggleActive(params.row._id, e.target.checked)} />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 530,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<BadgeIcon />} 
            onClick={() => setViewCardVendor(params.row)}
          >
            ID Card
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            color="secondary" 
            startIcon={<EditIcon />} 
            onClick={() => {
              setEditingVendor(params.row);
              setEditFormData({
                name: params.row.user?.name || "",
                email: params.row.user?.email || "",
                phone: params.row.user?.phone || "",
                businessName: params.row.businessName || "",
                gstNumber: params.row.gstNumber || "",
                commissionPercent: params.row.commissionPercent || 10,
                membershipPlan: params.row.membershipPlan || "Silver",
                referralCode: params.row.referralCode || ""
              });
            }}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            color="primary" 
            startIcon={<LinkIcon />} 
            onClick={() => {
              setLinkingVendor(params.row);
              setCouponCodeToLink("");
            }}
          >
            Link Coupon
          </Button>
          <Button 
            size="small" 
            variant="contained" 
            color="success" 
            startIcon={<AssessmentIcon />} 
            onClick={() => {
              setPerformanceVendor(params.row);
              setPerformanceData(null);
            }}
          >
            Performance
          </Button>
          <Button 
            size="small" 
            variant="contained" 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={() => handleDeleteVendor(params.row)}
          >
            Delete
          </Button>
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ p: 1 }}>
      
      {/* Financial Metrics Row at the Top */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Net Sales Generated", val: totalNetSales, color: "primary.main" },
          { label: "Outstanding Commission", val: totalOutstanding, color: "warning.main" },
          { label: "Claimed Commission", val: totalClaimed, color: "success.main" }
        ].map((card, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} uppercase display="block">
                  {card.label}
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: card.color, mt: 0.5 }}>
                  ₹{card.val.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <DataTable rows={rows} columns={columns} loading={loading} />

      {/* Onboard Form Modal */}
      <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Onboard New Vendor</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth margin="dense" label="Owner Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Owner Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Owner Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Business Name" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="GST Number" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Temporary Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Membership Tier" select value={formData.membershipPlan} onChange={e => setFormData({...formData, membershipPlan: e.target.value})} size="small">
            {['Silver', 'Gold', 'Platinum', 'Blaze'].map(plan => <MenuItem key={plan} value={plan}>{plan}</MenuItem>)}
          </TextField>
          <TextField fullWidth margin="dense" label="Custom Referral Code (Optional)" placeholder="e.g. VEND-CUSTOM1" value={formData.referralCode} onChange={e => setFormData({...formData, referralCode: e.target.value})} size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleOnboardSubmit}>Create Vendor</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Details Form Modal */}
      <Dialog open={Boolean(editingVendor)} onClose={() => setEditingVendor(null)} fullWidth maxWidth="sm">
        <DialogTitle>Modify Vendor Details</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth margin="dense" label="Owner Name" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Owner Email" type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Owner Phone" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Business Name" value={editFormData.businessName} onChange={e => setEditFormData({...editFormData, businessName: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="GST Number" value={editFormData.gstNumber} onChange={e => setEditFormData({...editFormData, gstNumber: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Commission Rate (%)" type="number" value={editFormData.commissionPercent} onChange={e => setEditFormData({...editFormData, commissionPercent: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Membership Plan" select value={editFormData.membershipPlan} onChange={e => setEditFormData({...editFormData, membershipPlan: e.target.value})} size="small">
            {['Silver', 'Gold', 'Platinum', 'Blaze'].map(plan => <MenuItem key={plan} value={plan}>{plan}</MenuItem>)}
          </TextField>
          <TextField fullWidth margin="dense" label="Custom Referral Code" value={editFormData.referralCode} onChange={e => setEditFormData({...editFormData, referralCode: e.target.value})} size="small" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingVendor(null)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleEditSubmit}>Save Modifications</Button>
        </DialogActions>
      </Dialog>

      {/* Link Coupon Modal */}
      <Dialog open={Boolean(linkingVendor)} onClose={() => setLinkingVendor(null)} fullWidth maxWidth="xs">
        <DialogTitle>Link Coupon to Vendor</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            Enter the promo code to link directly with <strong>{linkingVendor?.businessName}</strong>. 
            When customers use this code, commissions will be attributed to this vendor.
          </Typography>
          <TextField 
            fullWidth 
            label="Promo Coupon Code" 
            placeholder="e.g. SAVE10"
            value={couponCodeToLink} 
            onChange={e => setCouponCodeToLink(e.target.value.toUpperCase())}
            size="small" 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkingVendor(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleLinkCouponSubmit}>Link Coupon</Button>
        </DialogActions>
      </Dialog>

      {/* View Card Modal */}
      <Dialog open={Boolean(viewCardVendor)} onClose={() => setViewCardVendor(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Vendor ID Card
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />} 
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
            >
              Download Card
            </Button>
            <Menu 
              anchorEl={exportAnchorEl} 
              open={Boolean(exportAnchorEl)} 
              onClose={() => setExportAnchorEl(null)}
            >
              <MenuItem onClick={() => handleExportCard("jpeg")}>Download JPEG (Side-by-Side)</MenuItem>
              <MenuItem onClick={() => handleExportCard("pdf")}>Download PDF (Side-by-Side)</MenuItem>
            </Menu>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "#f5f5f5" }}>
          {viewCardVendor && (
            <Box 
              ref={downloadWrapperRef} 
              sx={{ 
                p: 2, 
                display: "flex", 
                flexDirection: { xs: "column", md: "row" }, 
                gap: 3, 
                justifyContent: "center" 
              }}
            >
              {/* Force front/back representations rendered simultaneously side-by-side */}
              <Box sx={{ width: { xs: "100%", md: "48%" } }}>
                <Typography variant="caption" sx={{ mb: 1, display: "block", textAlign: "center", fontWeight: 700 }} color="text.secondary">
                  FRONT SIDE (Left)
                </Typography>
                <Box sx={{ pointerEvents: "none" }}>
                  <VendorCard vendor={viewCardVendor} forceSide="front" />
                </Box>
              </Box>
              
              <Box sx={{ width: { xs: "100%", md: "48%" } }}>
                <Typography variant="caption" sx={{ mb: 1, display: "block", textAlign: "center", fontWeight: 700 }} color="text.secondary">
                  BACK SIDE (Right)
                </Typography>
                <Box sx={{ pointerEvents: "none" }}>
                  <VendorCard vendor={viewCardVendor} forceSide="back" />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Performance Analytics Tracking Modal */}
      <Dialog open={Boolean(performanceVendor)} onClose={() => setPerformanceVendor(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>{performanceVendor?.businessName} — Performance Analytics</Typography>
            <Typography variant="caption" color="text.secondary">Referral Code: {performanceVendor?.referralCode}</Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>View Basis</InputLabel>
            <Select 
              value={basisFilter} 
              label="View Basis" 
              onChange={e => setBasisFilter(e.target.value)}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="semiannually">Semi-Annually</MenuItem>
              <MenuItem value="annually">Annually</MenuItem>
            </Select>
          </FormControl>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {performanceData ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Performance Summary ({basisFilter.toUpperCase()})</Typography>
              </Grid>
              {[
                { label: "Net Users Joined (Referrals)", val: performanceData.netUsersJoined, color: "#1976d2" },
                { label: "Orders Placed", val: performanceData.ordersPlaced, color: "#2e7d32" },
                { label: "Successful Deliveries", val: performanceData.successfulDeliveries, color: "#4caf50" },
                { label: "Complaints (Returns/Repl.)", val: performanceData.ordersWithComplaints, color: "#ed6c02" },
                { label: "Order Cancellations", val: performanceData.orderCancellation, color: "#d32f2f" },
                { label: "Net Sales Generated", val: `₹${performanceData.netSalesGenerated.toLocaleString()}`, color: "#000" },
                { label: "Outstanding Commission", val: `₹${performanceData.netOutstandingCommission.toLocaleString()}`, color: "#9c27b0" },
                { label: "Received Commission", val: `₹${performanceData.receivedCommission.toLocaleString()}`, color: "#0288d1" }
              ].map((card, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" noWrap>
                        {card.label}
                      </Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ color: card.color, mt: 0.5 }}>
                        {card.val}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, mt: 1 }}>Refer a Vendor & Earn Details</Typography>
                <Paper sx={{ p: 2, bgcolor: "rgba(25, 118, 210, 0.04)", border: "1px dashed #1976d2" }}>
                  <Typography variant="body2">
                    Share referral link or code: <strong>{performanceVendor?.referralCode}</strong>.
                    Onboarding additional vendors qualifies {performanceVendor?.businessName} for premium tier upgrades and bonuses.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography color="text.secondary">Loading performance metrics...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPerformanceVendor(null)}>Close Dashboard</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Vendors;
