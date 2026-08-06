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
    businessEmail: "",
    supportWhatsapp: "",
    subscriptionPlan: "Custom Plan",
    subscriptionCost: 69999,
    subscriptionProvider: "Aditya Tech & Devoops",
    subscriptionStatus: "Active",
    governedBy: "Dhanlaxmi Enterprises",
    businessLocation: "https://maps.app.goo.gl/EzBC1JZsobNbr1gy5",
    deliveryChargePerKm: 12,
    baseDeliveryDistanceLimit: 5,
    baseDeliveryCharge: 49,
    gstNumber: "",
    fssaiLicenseNumber: "",
    billingAddress: ""
  });
  const [agreed, setAgreed] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      toast.warning("Logo image exceeds 12MB limit.");
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
        businessEmail: settings.businessEmail,
        supportWhatsapp: settings.supportWhatsapp,
        businessLocation: settings.businessLocation,
        deliveryChargePerKm: Number(settings.deliveryChargePerKm),
        baseDeliveryDistanceLimit: Number(settings.baseDeliveryDistanceLimit),
        baseDeliveryCharge: Number(settings.baseDeliveryCharge),
        gstNumber: settings.gstNumber,
        fssaiLicenseNumber: settings.fssaiLicenseNumber,
        billingAddress: settings.billingAddress,
        platformFee: Number(settings.platformFee),
        packagingCharges: Number(settings.packagingCharges),
        donationAmount: Number(settings.donationAmount),
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
      <Box display="flex" alignItems="center" mb={4}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 3, 
            background: "linear-gradient(135deg, #FF6F1E 0%, #FF9A44 100%)", 
            boxShadow: "0 4px 12px rgba(255, 111, 30, 0.2)",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            mr: 2
          }}
        >
          <LockIcon sx={{ color: "#fff", fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={900} color="#334155" sx={{ letterSpacing: "-0.5px" }}>
            Platform Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure your storefront metadata, delivery variables, and governance agreements.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Side: General Profile Settings */}
        <Grid item xs={12} md={7}>
          {/* Business Profile */}
          <Paper 
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              mb: 4, 
              border: "1px solid rgba(255, 111, 30, 0.08)", 
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.02)",
              background: "#fff"
            }}
          >
            <Typography variant="h6" fontWeight={800} color="#7C2D12" sx={{ mb: 0.5 }}>
              Business Profile
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Your brand identity displayed across search engines and customer invoices.
            </Typography>
            <Divider sx={{ mb: 3, borderColor: "rgba(255, 111, 30, 0.1)" }} />
            
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  value={settings.businessName || ""}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Support Email"
                  value={settings.supportEmail || ""}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Support Phone"
                  value={settings.supportPhone || ""}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="WhatsApp Contact"
                  value={settings.supportWhatsapp || ""}
                  onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Relations Email"
                  value={settings.businessEmail || ""}
                  onChange={(e) => setSettings({ ...settings, businessEmail: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Logo URL"
                  value={settings.logoUrl || ""}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>

              {/* Logo Preview & Uploader Row */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    background: "linear-gradient(135deg, #FFF7ED 0%, #FFF1F2 100%)",
                    border: "1.5px dashed rgba(255, 111, 30, 0.2)",
                    display: "flex", 
                    alignItems: "center", 
                    gap: 3 
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: "50%", 
                      overflow: "hidden", 
                      bgcolor: "#fff", 
                      boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      border: "2px solid #fff"
                    }}
                  >
                    <img 
                      src={settings.logoUrl || "/Mangalik.png"} 
                      alt="Logo Preview" 
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={(e) => { e.target.src = "/Mangalik.png"; }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="#7C2D12" gutterBottom>
                      Update Brand Logo
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                      Supported formats: PNG, JPG (Max 12MB). Transparent background recommended.
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      size="small"
                      disabled={isUploadingLogo}
                      sx={{ 
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3,
                        py: 0.75,
                        borderRadius: 2,
                        background: "linear-gradient(90deg, #FF6F1E 0%, #FF9A44 100%)", 
                        boxShadow: "0 4px 10px rgba(255, 111, 30, 0.2)",
                        "&:hover": { background: "linear-gradient(90deg, #E35205 0%, #FF8C00 100%)" }
                      }}
                    >
                      {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                      <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Distance-Based Delivery Settings Section */}
            <Typography variant="h6" fontWeight={800} color="#7C2D12" sx={{ mt: 5, mb: 0.5 }}>
              Distance-Based Delivery Settings
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Control real-time logistical costs based on GPS drop proximity.
            </Typography>
            <Divider sx={{ mb: 3, borderColor: "rgba(255, 111, 30, 0.1)" }} />
            
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Business Location (Google Maps Link)"
                  value={settings.businessLocation || ""}
                  onChange={(e) => setSettings({ ...settings, businessLocation: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Base Delivery Charge (₹)"
                  value={settings.baseDeliveryCharge || 0}
                  onChange={(e) => setSettings({ ...settings, baseDeliveryCharge: Number(e.target.value) })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Base Distance Limit (km)"
                  value={settings.baseDeliveryDistanceLimit || 0}
                  onChange={(e) => setSettings({ ...settings, baseDeliveryDistanceLimit: Number(e.target.value) })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Delivery Charge / Km (₹)"
                  value={settings.deliveryChargePerKm || 0}
                  onChange={(e) => setSettings({ ...settings, deliveryChargePerKm: Number(e.target.value) })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
            </Grid>

            {/* Taxation & Licensing Settings Section */}
            <Typography variant="h6" fontWeight={800} color="#7C2D12" sx={{ mt: 5, mb: 0.5 }}>
              Taxation & Licensing Settings
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Verify and update governmental registrations used in your GST bills and invoices.
            </Typography>
            <Divider sx={{ mb: 3, borderColor: "rgba(255, 111, 30, 0.1)" }} />
            
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GST Number"
                  value={settings.gstNumber || ""}
                  onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="FSSAI License Number"
                  value={settings.fssaiLicenseNumber || ""}
                  onChange={(e) => setSettings({ ...settings, fssaiLicenseNumber: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Billing Address for Invoices & GST Bills"
                  value={settings.billingAddress || ""}
                  onChange={(e) => setSettings({ ...settings, billingAddress: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
            </Grid>

            {/* Transaction & Fee Defaults Section */}
            <Typography variant="h6" fontWeight={800} color="#7C2D12" sx={{ mt: 5, mb: 0.5 }}>
              Transaction & Fee Defaults
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Set default values for platform fees, packaging charges, and donations.
            </Typography>
            <Divider sx={{ mb: 3, borderColor: "rgba(255, 111, 30, 0.1)" }} />
            
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Platform Fee (₹)"
                  value={settings.platformFee || 0}
                  onChange={(e) => setSettings({ ...settings, platformFee: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Packaging Charges (₹)"
                  value={settings.packagingCharges || 0}
                  onChange={(e) => setSettings({ ...settings, packagingCharges: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Donation to Feeding India (₹)"
                  value={settings.donationAmount || 0}
                  onChange={(e) => setSettings({ ...settings, donationAmount: e.target.value })}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Other Plan Options Section */}
          <Paper 
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              mb: 4, 
              border: "1px solid rgba(255, 111, 30, 0.08)", 
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.02)",
              background: "#fff"
            }}
          >
            <Typography variant="h6" fontWeight={800} color="#7C2D12" sx={{ mb: 0.5 }}>
              Other Available Plan Options
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Explore alternative professional tiers to scale platform services.
            </Typography>
            <Divider sx={{ mb: 3, borderColor: "rgba(255, 111, 30, 0.1)" }} />
            
            <Grid container spacing={3}>
              {/* Starter Option */}
              <Grid item xs={12} sm={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: "100%", 
                    borderRadius: 3,
                    borderColor: "rgba(255, 111, 30, 0.12)",
                    transition: "all 0.2s",
                    "&:hover": { boxShadow: "0 6px 15px rgba(255,111,30,0.05)", transform: "translateY(-1px)" }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Starter Plan
                    </Typography>
                    <Typography variant="h4" fontWeight={900} color="#C2410C" sx={{ my: 1.5 }}>
                      ₹14,376 <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>/ project</Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, lineHeight: 1.5 }}>
                      Perfect for small businesses and storefront startups looking to go online quickly.
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: "#fed7aa" }} />
                    <Typography variant="caption" fontWeight={800} color="#7C2D12" display="block" sx={{ mb: 1, letterSpacing: "0.5px" }}>
                      FEATURES INCLUDE:
                    </Typography>
                    <Stack spacing={0.75}>
                      {["Responsive Web Application", "Modern UI/UX Design", "Basic SEO Optimization", "Mobile-First Approach", "30 Days Support"].map((feat, i) => (
                        <Box key={i} display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#FF6F1E" }} />
                          <Typography variant="caption" color="text.secondary">{feat}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Enterprise Option */}
              <Grid item xs={12} sm={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: "100%", 
                    borderRadius: 3,
                    borderColor: "rgba(255, 111, 30, 0.12)",
                    background: "linear-gradient(135deg, #FFF7ED 0%, #FFFbeb 100%)",
                    transition: "all 0.2s",
                    "&:hover": { boxShadow: "0 6px 15px rgba(255,111,30,0.05)", transform: "translateY(-1px)" }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle2" fontWeight={800} color="#C2410C" sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Enterprise Plan
                    </Typography>
                    <Typography variant="h4" fontWeight={900} color="#C2410C" sx={{ my: 1.5 }}>
                      ₹1,99,999 <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>/ project</Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, lineHeight: 1.5 }}>
                      Comprehensive high-availability solutions for scaling organizations.
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: "#fdba74" }} />
                    <Typography variant="caption" fontWeight={800} color="#7C2D12" display="block" sx={{ mb: 1, letterSpacing: "0.5px" }}>
                      FEATURES INCLUDE:
                    </Typography>
                    <Stack spacing={0.75}>
                      {["Enterprise-Grade Architecture", "Microservices Development", "AI/ML Integration", "Cloud Infrastructure Setup", "1 Year Support & Maintenance"].map((feat, i) => (
                        <Box key={i} display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#FF6F1E" }} />
                          <Typography variant="caption" color="text.secondary">{feat}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>

          {/* Legal Governance Banner */}
          <Paper 
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              bgcolor: "rgba(239, 68, 68, 0.02)", 
              border: "1.5px solid rgba(239, 68, 68, 0.25)", 
              mb: 4,
              boxShadow: "0 8px 24px rgba(239,68,68,0.03)"
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: "rgba(239, 68, 68, 0.1)", display: "flex", mr: 1.5 }}>
                <ShieldIcon color="error" sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" color="#991B1B" fontWeight={800}>
                Platform Governance & Supervision
              </Typography>
            </Box>
            <Typography variant="body2" color="#7F1D1D" paragraph sx={{ lineHeight: 1.6, fontSize: "0.85rem" }}>
              The team has designed this platform under the governance, supervision, and guidance of <strong>Dhanlaxmi Enterprises</strong>. Every single feature and operational configuration is solely governed by them. As per Indian Company Laws and IT Laws, any forgery, security breach, data loss, or user data exploitation under any condition remains the responsibility of <strong>Dhanlaxmi Enterprises</strong>.
            </Typography>
            <FormControlLabel
              control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} color="error" />}
              label={
                <Typography variant="body2" fontWeight={700} color="#7F1D1D" sx={{ fontSize: "0.85rem" }}>
                  I acknowledge and agree to these terms of platform governance.
                </Typography>
              }
              sx={{ mt: 1 }}
            />
          </Paper>

          <Box display="flex" justifyContent="flex-end">
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleSave}
              sx={{
                py: 1.5,
                px: 5,
                fontWeight: 800,
                borderRadius: 3,
                textTransform: "none",
                background: "linear-gradient(90deg, #FF6F1E 0%, #FF9A44 100%)", 
                boxShadow: "0 4px 15px rgba(255, 111, 30, 0.35)",
                transition: "all 0.2s",
                "&:hover": { 
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(255, 111, 30, 0.5)",
                  background: "linear-gradient(90deg, #E35205 0%, #FF8C00 100%)"
                }
              }}
            >
              Save Settings
            </Button>
          </Box>
        </Grid>

        {/* Right Side: Subscription Details & Features */}
        <Grid item xs={12} md={5}>
          <Paper 
            sx={{ 
              p: 4, 
              borderRadius: 4, 
              height: "100%", 
              border: "1px solid rgba(255, 111, 30, 0.08)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.02)",
              background: "#fff"
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800} color="#7C2D12">
                Subscription Details
              </Typography>
              <Chip 
                label={settings.subscriptionStatus?.toUpperCase() || "ACTIVE"} 
                color="success" 
                size="small" 
                sx={{ fontWeight: 800, fontSize: "0.75rem", borderRadius: 1.5 }} 
              />
            </Box>
            <Divider sx={{ mb: 3, borderColor: "rgba(255, 111, 30, 0.1)" }} />

            {!isSuperAdmin && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5 }}>
                <AlertTitle sx={{ fontWeight: 700 }}>Read-Only Notice</AlertTitle>
                Subscription properties can only be managed by the SuperAdmin.
              </Alert>
            )}

            <Stack spacing={2.5} sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Subscription Plan"
                value={settings.subscriptionPlan || ""}
                disabled={!isSuperAdmin}
                onChange={(e) => setSettings({ ...settings, subscriptionPlan: e.target.value })}
                size="small"
                sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
              />
              <TextField
                fullWidth
                label="Cost (₹/Project)"
                value={settings.subscriptionCost || ""}
                disabled={!isSuperAdmin}
                onChange={(e) => setSettings({ ...settings, subscriptionCost: e.target.value })}
                size="small"
                type="number"
                sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
              />
              <TextField
                fullWidth
                label="Provider"
                value={settings.subscriptionProvider || ""}
                disabled={!isSuperAdmin}
                onChange={(e) => setSettings({ ...settings, subscriptionProvider: e.target.value })}
                size="small"
                sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
              />
              <TextField
                fullWidth
                label="Platform Governance"
                value={settings.governedBy || ""}
                disabled={!isSuperAdmin}
                onChange={(e) => setSettings({ ...settings, governedBy: e.target.value })}
                size="small"
                sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#FF6F1E" } }}
              />
            </Stack>

            <Typography variant="subtitle2" fontWeight={800} color="#C2410C" sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              ACTIVE PLAN FEATURES (Custom Professional Tier)
            </Typography>
            <List dense disablePadding sx={{ mb: 4 }}>
              {profFeatures.map((f, idx) => (
                <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary={f} primaryTypographyProps={{ fontSize: "0.85rem", color: "text.secondary", fontWeight: 500 }} />
                </ListItem>
              ))}
              {profDeliverables.map((d, idx) => (
                <ListItem key={`del-${idx}`} disableGutters sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <StarIcon color="warning" sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary={`Deliverable: ${d}`} primaryTypographyProps={{ fontSize: "0.85rem", color: "text.secondary", fontWeight: 500 }} />
                </ListItem>
              ))}
            </List>

            {/* MOU Exception Box */}
            <Box 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                border: "2px dashed #1976d2", 
                bgcolor: "rgba(25, 118, 210, 0.02)",
                boxShadow: "0 4px 15px rgba(25, 118, 210, 0.02)"
              }}
            >
              <Box display="flex" alignItems="center" mb={1.5}>
                <Box sx={{ p: 0.5, borderRadius: 1.5, bgcolor: "rgba(25, 118, 210, 0.1)", display: "flex", mr: 1 }}>
                  <HelpOutlineIcon color="primary" sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="body2" fontWeight={800} color="#1565C0">
                  MOU Additional Beta Program
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2, lineHeight: 1.5 }}>
                Offered as a specialized exception under the Memorandum of Understanding (MOU) between Aditya Tech & Devoops and Dhanlaxmi Enterprises.
              </Typography>
              <List dense disablePadding>
                {betaFeatures.map((f, idx) => (
                  <ListItem key={`beta-${idx}`} disableGutters sx={{ py: 0.4 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <CheckCircleIcon color="primary" sx={{ fontSize: 15 }} />
                    </ListItemIcon>
                    <ListItemText primary={f} primaryTypographyProps={{ fontSize: "0.78rem", color: "text.primary", fontWeight: 500 }} />
                  </ListItem>
                ))}
                {betaDeliverables.map((d, idx) => (
                  <ListItem key={`betadel-${idx}`} disableGutters sx={{ py: 0.4 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <StarIcon color="primary" sx={{ fontSize: 15 }} />
                    </ListItemIcon>
                    <ListItemText primary={`MOU Feature: ${d}`} primaryTypographyProps={{ fontSize: "0.78rem", color: "text.primary", fontWeight: 500 }} />
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
