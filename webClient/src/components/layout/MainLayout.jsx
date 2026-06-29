import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Container,
  Stack,
  Link,
  Grid,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MenuIcon from "@mui/icons-material/Menu";
import { useSelector } from "react-redux";
import AdsBanner from "../common/AdsBanner";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/products" },
  { label: "About", to: "/about" },
  { label: "Help & Support", to: "/help-support" },
  { label: "Contact", to: "/contact" },
];

const MainLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const cartCount = useSelector((s) => s.cart.items?.length || 0);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ---------- Top utility strip ---------- */}
      <Box sx={{ bgcolor: "secondary.main", color: "#fff", py: 0.5 }}>
        <Container>
          <Typography variant="caption" align="center" display="block">
            🔱 Incorporating AI Innovations in Z+ ERA — A-Z Poojan Samagri, Delivered with Devotion
          </Typography>
        </Container>
      </Box>

      {/* ---------- Header ---------- */}
      <AppBar position="sticky" elevation={0}>
        <Container>
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton sx={{ display: { md: "none" } }} onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h5"
                component={RouterLink}
                to="/"
                sx={{ fontWeight: 800, color: "primary.main", textDecoration: "none", letterSpacing: 0.5 }}
              >
                मंगलिक · Mangalik
              </Typography>
            </Stack>

            <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  component={RouterLink}
                  to={l.to}
                  underline="none"
                  color="text.primary"
                  sx={{ fontWeight: 500, "&:hover": { color: "primary.main" } }}
                >
                  {l.label}
                </Link>
              ))}
            </Stack>

            <Stack direction="row" spacing={1}>
              <IconButton component={RouterLink} to="/login">
                <PersonOutlineIcon />
              </IconButton>
              <IconButton component={RouterLink} to="/cart">
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 240 }}>
          {navLinks.map((l) => (
            <ListItem button key={l.to} component={RouterLink} to={l.to} onClick={() => setDrawerOpen(false)}>
              <ListItemText primary={l.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* ---------- Top banner ad slot (superadmin controlled) ---------- */}
      <Container sx={{ pt: 1 }}>
        <AdsBanner slotKey="header_top" />
      </Container>

      {/* ---------- Page content ---------- */}
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      {/* ---------- Footer ---------- */}
      <Box sx={{ bgcolor: "secondary.main", color: "#F5F1EC", mt: 6, pt: 6, pb: 3 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                मंगलिक · Mangalik
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                A-Z Poojan Samagri for every Hindu ritual, yagna, and hawan — delivered to your
                doorstep with purity and devotion.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography fontWeight={700} gutterBottom>Company</Typography>
              <Stack spacing={1}>
                <Link component={RouterLink} to="/about" color="inherit" underline="hover">About Us</Link>
                <Link component={RouterLink} to="/contact" color="inherit" underline="hover">Contact Us</Link>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography fontWeight={700} gutterBottom>Support</Typography>
              <Stack spacing={1}>
                <Link component={RouterLink} to="/help-support" color="inherit" underline="hover">Help & Support</Link>
                <Link component={RouterLink} to="/faqs" color="inherit" underline="hover">FAQs</Link>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography fontWeight={700} gutterBottom>Legal</Typography>
              <Stack spacing={1}>
                <Link component={RouterLink} to="/terms-and-conditions" color="inherit" underline="hover">Terms & Conditions</Link>
                <Link component={RouterLink} to="/privacy-policy" color="inherit" underline="hover">Privacy Policy</Link>
                <Link component={RouterLink} to="/refund-policy" color="inherit" underline="hover">Refund Policy</Link>
                <Link component={RouterLink} to="/shipping-policy" color="inherit" underline="hover">Shipping Policy</Link>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.12)" }} />
          <Typography variant="body2" align="center" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} Mangalik. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
