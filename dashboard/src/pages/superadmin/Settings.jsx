import { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Paper, 
  Divider, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Alert,
  AlertTitle,
  Stack
} from "@mui/material";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "../../services/api";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import StarIcon from "@mui/icons-material/Star";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const Settings = () => {
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superadmin";

  const [settings, setSettings] = useState({
    businessName: "",
    logoUrl: "",
    supportEmail: "",
    supportPhone: "",
    subscriptionPlan: "Custom Plan",
    subscriptionCost: 69999,
    subscriptionProvider: "Aditya Tech & Devoops",
    subscriptionStatus: "Active",
    governedBy: "Dhanlaxmi Enterprises",
    businessLocation: "https://maps.app.goo.gl/EzBC1JZsobNbr1gy5",
    deliveryChargePerKm: 12,
    baseDeliveryDistanceLimit: 5,
    baseDeliveryCharge: 49
  });
  const [agreed, setAgreed] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Logo image exceeds 2MB limit.");
      return;
    }
    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const { data } = await api.post("/products/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSettings(prev => ({ ...prev, logoUrl: data.url }));
      toast.success("Logo uploaded successfully!");
    } catch (err) {
      toast.error("Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/business-settings");
        if (data.data) {
          setSettings(prev => ({
            ...prev,
            ...data.data
          }));
        }
        toast.info("Settings loaded successfully.");
        setIsFetching(false);
      } catch (err) {
        toast.error("Failed to load settings.");
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!agreed) {
      return toast.error("You must agree to the Terms of Usage and Policies to save.");
    }
    try {
      const payload = {
        businessName: settings.businessName,
        logoUrl: settings.logoUrl,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        businessLocation: settings.businessLocation,
        deliveryChargePerKm: Number(settings.deliveryChargePerKm),
        baseDeliveryDistanceLimit: Number(settings.baseDeliveryDistanceLimit),
        baseDeliveryCharge: Number(settings.baseDeliveryCharge),
      };

      // Only include subscription fields if superadmin
      if (isSuperAdmin) {
        payload.subscriptionPlan = settings.subscriptionPlan;
        payload.subscriptionCost = Number(settings.subscriptionCost);
        payload.subscriptionProvider = settings.subscriptionProvider;
        payload.subscriptionStatus = settings.subscriptionStatus;
        payload.governedBy = settings.governedBy;
      }

      const { data } = await api.patch("/business-settings", payload);
      if (data.data) {
        setSettings(prev => ({
          ...prev,
          ...data.data
        }));
      }
      toast.success("Settings securely updated!");
    } catch (err) {
      toast.error("Failed to update settings.");
    }
  };

  const profFeatures = [
    "Full-Stack Web Application",
    "Custom Backend Development",
    "Database Design & Integration",
    "Advanced SEO & Analytics",
    "90 Days Support",
    "API Development",
    "Admin Dashboard",
    "Unlimited Revisions",
    "Performance Optimization",
    "Security Implementation"
  ];

  const profDeliverables = [
    "Up to 10 Pages/Screens",
    "User Authentication System",
    "Content Management System",
    "Payment Gateway Integration",
    "Email Automation Setup"
  ];

  const betaFeatures = [
    "Enterprise-Grade Architecture",
    "Microservices Development",
    "AI/ML Integration",
    "Cloud Infrastructure Setup",
    "1 Year Support & Maintenance",
    "DevOps Pipeline Setup",
    "Multi-Platform Development",
    "Custom Integrations",
    "Load Balancing & Scaling",
    "Advanced Security Audits",
    "24/7 Monitoring",
    "Team Training Included"
  ];

  const betaDeliverables = [
    "Unlimited Pages/Features",
    "Multi-Role User Management",
    "Advanced Analytics Dashboard",
    "Third-Party Integrations",
    "Mobile App Development",
    "Custom AI Solutions"
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <LockIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" fontWeight={800}>
          Platform Settings
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Side: General Profile Settings */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Business Profile</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  value={settings.businessName || ""}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  margin="dense"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    fullWidth
                    label="Logo URL"
                    value={settings.logoUrl || ""}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    margin="dense"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    component="label"
                    size="small"
                    disabled={isUploadingLogo}
                    sx={{ minWidth: "120px", mt: 0.5 }}
                  >
                    {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Support Email"
                  value={settings.supportEmail || ""}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  margin="dense"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Support Phone"
                  value={settings.supportPhone || ""}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  margin="dense"
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Distance-Based Delivery Settings Section */}
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              Distance-Based Delivery Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Location (Google Maps Link)"
                  value={settings.businessLocation || ""}
                  onChange={(e) => setSettings({ ...settings, businessLocation: e.target.value })}
                  margin="dense"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Base Delivery Charge (₹)"
                  value={settings.baseDeliveryCharge || 0}
                  onChange={(e) => setSettings({ ...settings, baseDeliveryCharge: Number(e.target.value) })}
                  margin="dense"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Base Distance Limit (km)"
                  value={settings.baseDeliveryDistanceLimit || 0}
                  onChange={(e) => setSettings({ ...settings, baseDeliveryDistanceLimit: Number(e.target.value) })}
                  margin="dense"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Delivery Charge / Km (₹)"
                  value={settings.deliveryChargePerKm || 0}
                  onChange={(e) => setSettings({ ...settings, deliveryChargePerKm: Number(e.target.value) })}
                  margin="dense"
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Other Plan Options Section */}
          <Paper sx={{ p: 4, borderRadius: 3, mb: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Other Available Plan Options</Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              {/* Starter Option */}
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} color="text.secondary">Starter Plan</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary" sx={{ my: 1 }}>₹14,376 <Typography variant="caption" color="text.secondary">/ project</Typography></Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>Perfect for small businesses and startups.</Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>FEATURES INCLUDE:</Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      • Responsive Web Application<br />
                      • Modern UI/UX Design<br />
                      • Basic SEO Optimization<br />
                      • Mobile-First Approach<br />
                      • 30 Days Support
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Enterprise Option */}
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} color="text.secondary">Enterprise Plan</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary" sx={{ my: 1 }}>₹1,99,999 <Typography variant="caption" color="text.secondary">/ project</Typography></Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>Comprehensive solution for large organizations.</Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="caption" fontWeight={700} display="block" sx={{ mb: 0.5 }}>FEATURES INCLUDE:</Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      • Enterprise-Grade Architecture<br />
                      • Microservices Development<br />
                      • AI/ML Integration<br />
                      • Cloud Infrastructure Setup<br />
                      • 1 Year Support & Maintenance
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Legal Governance Banner */}
          <Paper sx={{ p: 4, borderRadius: 3, bgcolor: "rgba(239, 68, 68, 0.04)", border: "1px solid #ef4444", mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <ShieldIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" color="error.dark" fontWeight={700}>Platform Governance & Supervision</Typography>
            </Box>
            <Typography variant="body2" color="text.primary" paragraph sx={{ lineHeight: 1.6 }}>
              The team has designed this platform under the governance, supervision, and guidance of <strong>Dhanlaxmi Enterprises</strong>. Every single feature and operational configuration is solely governed by them. As per Indian Company Laws and IT Laws, any forgery, security breach, data loss, or user data exploitation under any condition remains the responsibility of <strong>Dhanlaxmi Enterprises</strong>.
            </Typography>
            <FormControlLabel
              control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} color="error" />}
              label="I acknowledge and agree to these terms of platform governance."
              sx={{ mt: 1, color: "text.primary" }}
            />
          </Paper>

          <Box display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary" size="large" onClick={handleSave}>
              Save Settings
            </Button>
          </Box>
        </Grid>

        {/* Right Side: Subscription Details & Features */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: 3, height: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>Subscription Details</Typography>
              <Chip label={settings.subscriptionStatus || "Active"} color="success" size="small" sx={{ fontWeight: 700 }} />
            </Box>
            <Divider sx={{ mb: 3 }} />

            {!isSuperAdmin && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Read-Only Notice</AlertTitle>
                Subscription properties can only be managed by the SuperAdmin.
              </Alert>
            )}

            <Stack spacing={2} sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Subscription Plan"
                value={settings.subscriptionPlan || ""}
                disabled={!isSuperAdmin}
                onChange={(e) => setSettings({ ...settings, subscriptionPlan: e.target.value })}
                size="small"
              />
              <TextField
                fullWidth
                label="Cost (₹/Project)"
                value={settings.subscriptionCost || ""}
                disabled={!isSuperAdmin}
                onChange={(e) => setSettings({ ...settings, subscriptionCost: e.target.value })}
                size="small"
                type="number"
              />
              <TextField
                fullWidth
                label="Provider"
                value={settings.subscriptionProvider || ""}
                disabled={!isSuperAdmin}
                onChange={(e) => setSettings({ ...settings, subscriptionProvider: e.target.value })}
                size="small"
              />
              <TextField
                fullWidth
                label="Platform Governance"
                value={settings.governedBy || ""}
                disabled={!isSuperAdmin}
                onChange={(e) => setSettings({ ...settings, governedBy: e.target.value })}
                size="small"
              />
            </Stack>

            <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 1 }}>
              ACTIVE PLAN FEATURES (Custom Professional Tier)
            </Typography>
            <List dense disablePadding sx={{ mb: 3 }}>
              {profFeatures.map((f, idx) => (
                <ListItem key={idx} disableGutters sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><CheckCircleIcon color="success" sx={{ fontSize: 16 }} /></ListItemIcon>
                  <ListItemText primary={f} primaryTypographyProps={{ fontSize: "0.8rem", color: "text.secondary" }} />
                </ListItem>
              ))}
              {profDeliverables.map((d, idx) => (
                <ListItem key={`del-${idx}`} disableGutters sx={{ py: 0.25 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><StarIcon color="warning" sx={{ fontSize: 16 }} /></ListItemIcon>
                  <ListItemText primary={`Deliverable: ${d}`} primaryTypographyProps={{ fontSize: "0.8rem", color: "text.secondary" }} />
                </ListItem>
              ))}
            </List>

            {/* MOU Exception Box */}
            <Box 
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                border: "1.5px dashed #1976d2", 
                bgcolor: "rgba(25, 118, 210, 0.03)" 
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <HelpOutlineIcon color="primary" sx={{ mr: 0.75, fontSize: 18 }} />
                <Typography variant="body2" fontWeight={700} color="primary.dark">
                  MOU Additional Beta Program
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                Offered as a specialized exception under the Memorandum of Understanding (MOU) between Aditya Tech & Devoops and Dhanlaxmi Enterprises.
              </Typography>
              <List dense disablePadding>
                {betaFeatures.map((f, idx) => (
                  <ListItem key={`beta-${idx}`} disableGutters sx={{ py: 0.2 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}><CheckCircleIcon color="primary" sx={{ fontSize: 14 }} /></ListItemIcon>
                    <ListItemText primary={f} primaryTypographyProps={{ fontSize: "0.75rem", color: "text.primary" }} />
                  </ListItem>
                ))}
                {betaDeliverables.map((d, idx) => (
                  <ListItem key={`betadel-${idx}`} disableGutters sx={{ py: 0.2 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}><StarIcon color="primary" sx={{ fontSize: 14 }} /></ListItemIcon>
                    <ListItemText primary={`MOU Feature: ${d}`} primaryTypographyProps={{ fontSize: "0.75rem", color: "text.primary" }} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;
