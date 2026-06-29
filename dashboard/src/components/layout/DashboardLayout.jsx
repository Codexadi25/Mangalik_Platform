import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Stack,
} from "@mui/material";
import * as Icons from "@mui/icons-material";
import { useSelector } from "react-redux";
import { NAV_BY_ROLE } from "../../utils/navConfig";

const DRAWER_WIDTH = 260;

/**
 * DashboardLayout — the single shell used by ALL roles. It reads
 * `NAV_BY_ROLE[user.role]` to render the correct sidebar, so the
 * exact same component tree powers superadmin, admin, vendor,
 * manager, agent, deliveryPartner, and salesPartner views.
 */
const DashboardLayout = ({ children }) => {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();
  const navItems = NAV_BY_ROLE[user?.role] || [];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{ width: DRAWER_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={800} color="primary.main">
            मंगलिक · Mangalik
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.6 }}>
            {roleDisplayName(user?.role)}
          </Typography>
        </Box>
        <List>
          {navItems.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle;
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                selected={active}
                sx={{
                  color: active ? "primary.main" : "inherit",
                  "&.Mui-selected": { bgcolor: "rgba(255,111,30,0.15)" },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0} color="inherit" sx={{ borderBottom: "1px solid #eee" }}>
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="body2">{user?.name}</Typography>
              <Avatar src={user?.photoURL} sx={{ width: 32, height: 32 }} />
            </Stack>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
};

/**
 * Important UX/trust nuance: SUPERADMIN's actual role string is
 * never displayed verbatim to non-superadmin viewers, and the
 * superadmin's own UI always reads as "System Owner" — the business
 * owner (ADMIN) only ever sees themself labelled as "Business Owner".
 */
const roleDisplayName = (role) => {
  const map = {
    superadmin: "System Owner",
    admin: "Business Owner",
    manager: "Operations Manager",
    vendor: "Vendor Partner",
    agent: "Support Agent",
    deliveryPartner: "Delivery Partner",
    salesPartner: "Sales Partner",
  };
  return map[role] || "";
};

export default DashboardLayout;
