import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Card,
  CardContent,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VendorCard from './VendorCard';
import api from '../../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';

const mockCommissions = [
  { id: 'ORD-001', amount: 500, commission: 50, date: '2026-07-10', status: 'Paid' },
  { id: 'ORD-002', amount: 1200, commission: 120, date: '2026-07-12', status: 'Pending' },
  { id: 'ORD-003', amount: 300, commission: 30, date: '2026-07-15', status: 'Pending' },
];

const SellerCentral = () => {
  const [vendor, setVendor] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  
  // Download wrapper container refs for side-by-side export
  const downloadWrapperRef = useRef(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({ businessName: "" });

  // Membership purchase / upgrade state
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({
    membershipPlan: "Gold",
    referralCode: ""
  });

  const loadVendor = () => {
    api.get("/vendors/me").then(res => {
      setVendor(res.data.data);
      if (res.data.data) {
        setUpgradeForm({
          membershipPlan: res.data.data.membershipPlan || "Gold",
          referralCode: res.data.data.referralCode || ""
        });
      }
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    loadVendor();
  }, []);

  const handleEditSubmit = async () => {
    try {
      await api.patch("/vendors/me", { businessName: editData.businessName });
      toast.success("Card business name updated successfully!");
      setIsEditOpen(false);
      loadVendor();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update business name");
    }
  };

  const handleUpgradeSubmit = async () => {
    try {
      // Switches plan & validates payment simulation
      await api.patch("/vendors/me", {
        membershipPlan: upgradeForm.membershipPlan,
        referralCode: upgradeForm.referralCode
      });
      toast.success(`Successfully upgraded to ${upgradeForm.membershipPlan} plan & updated referral code!`);
      setIsUpgradeOpen(false);
      loadVendor();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upgrade membership plan");
    }
  };

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
      
      const fileName = `vendor-card-${vendor.businessName.replace(/\s+/g, '-')}`;
      
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={800}>Seller Central</Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="contained" 
            color="warning" 
            startIcon={<WorkspacePremiumIcon />}
            onClick={() => setIsUpgradeOpen(true)}
          >
            Upgrade plan
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            onClick={(e) => setExportAnchorEl(e.currentTarget)}
          >
            Export Vendor Card
          </Button>
        </Box>
        <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
          <MenuItem onClick={() => handleExportCard("jpeg")}>Export as JPEG (Side-by-Side)</MenuItem>
          <MenuItem onClick={() => handleExportCard("pdf")}>Export as PDF (Side-by-Side)</MenuItem>
        </Menu>
      </Box>

      {/* Hidden container for side-by-side card export */}
      {vendor && (
        <Box sx={{ display: "none" }}>
          <Box 
            ref={downloadWrapperRef} 
            sx={{ 
              p: 2, 
              display: "flex", 
              flexDirection: "row", 
              gap: 3, 
              width: 900 
            }}
          >
            <Box sx={{ width: "48%" }}>
              <VendorCard vendor={vendor} forceSide="front" />
            </Box>
            <Box sx={{ width: "48%" }}>
              <VendorCard vendor={vendor} forceSide="back" />
            </Box>
          </Box>
        </Box>
      )}

      {/* Display Front Side for Interactive Flipping */}
      {vendor && (
        <Box sx={{ mb: 4, maxWidth: 500 }}>
          <VendorCard vendor={vendor} onEdit={() => {
            setEditData({ businessName: vendor.businessName });
            setIsEditOpen(true);
          }} />
        </Box>
      )}

      {/* Edit Card Modal */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Card Details</DialogTitle>
        <DialogContent dividers>
          <TextField 
            fullWidth 
            margin="dense" 
            label="Business Name" 
            value={editData.businessName} 
            onChange={e => setEditData({...editData, businessName: e.target.value})} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Upgrade Membership Modal */}
      <Dialog open={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Purchase / Upgrade Membership</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            Upgrading your tier increases commission percentages and unlocks premium card designs.
          </Alert>
          <TextField
            select
            fullWidth
            margin="dense"
            label="Select Membership Tier"
            value={upgradeForm.membershipPlan}
            onChange={e => setUpgradeForm({...upgradeForm, membershipPlan: e.target.value})}
            size="small"
          >
            <MenuItem value="Silver">Silver Plan (Free)</MenuItem>
            <MenuItem value="Gold">Gold Plan (₹999/yr)</MenuItem>
            <MenuItem value="Platinum">Platinum Plan (₹1,999/yr)</MenuItem>
            <MenuItem value="Blaze">Blaze Plan (₹4,999/yr)</MenuItem>
          </TextField>
          
          <TextField
            fullWidth
            margin="dense"
            label="Custom Referral Code"
            placeholder="e.g. MYCODE1"
            value={upgradeForm.referralCode}
            onChange={e => setUpgradeForm({...upgradeForm, referralCode: e.target.value})}
            size="small"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUpgradeOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleUpgradeSubmit}>
            Pay & Switch Plan
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        {/* Commission Report */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" mb={2}>Commission Report</Typography>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">Total Sales</Typography>
                <Typography variant="h5">₹ 2,000</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">Earned Commission</Typography>
                <Typography variant="h5" color="success.main">₹ 200</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="textSecondary">Pending Payout</Typography>
                <Typography variant="h5" color="warning.main">₹ 150</Typography>
              </Grid>
            </Grid>
            
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Commission</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockCommissions.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>₹{row.amount}</TableCell>
                    <TableCell>₹{row.commission}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell sx={{ color: row.status === 'Paid' ? 'success.main' : 'warning.main' }}>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerCentral;
