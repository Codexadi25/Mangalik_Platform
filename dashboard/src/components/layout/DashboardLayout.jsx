import { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Popover,
  Badge,
  Divider,
  ListItem
} from "@mui/material";
import * as Icons from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { useSelector, useDispatch } from "react-redux";
import { setMockRole, logoutThunk, setUser } from "../../redux/slices/authSlice";
import { NAV_BY_ROLE } from "../../utils/navConfig";
import api from "../../services/api";
import { toast } from "react-toastify";
import io from "socket.io-client";
import { useHeader } from "../../context/HeaderContext";

const DRAWER_WIDTH = 260;

const DashboardLayout = ({ children }) => {
  const { headerData } = useHeader();
  const dispatch = useDispatch();
  const { user, mockRole } = useSelector((s) => s.auth);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "", phone: "", password: "" });
  const [rolesHtml, setRolesHtml] = useState('<option value="superadmin">Superadmin</option>');

  const playAlarm = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-120.wav");
    audio.play().catch(e => console.log("Audio play error", e));
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || !user) return;

    const socket = io(import.meta.env.VITE_API_BASE_URL || "https://admin-api.mangalik.store", {
      auth: { token }
    });

    socket.on("connect", () => {
      console.log("Socket connected to server");
    });

    socket.on("order:new", (newOrder) => {
      console.log("New order placed:", newOrder);
      playAlarm();
      setNotifications(prev => [
        {
          id: newOrder._id,
          title: "New Order Placed",
          message: `Order #${newOrder.orderNumber} for ₹${newOrder.total} requires confirmation.`,
          orderNumber: newOrder.orderNumber,
          read: false,
          at: new Date()
        },
        ...prev
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const fetchPendingNotifications = async () => {
      try {
        const { data } = await api.get("/superadmin/overview");
        if (data?.data?.unprocessedOrders) {
          const pending = data.data.unprocessedOrders.map(order => ({
            id: order._id,
            title: "Pending Order",
            message: `Order #${order.orderNumber} for ₹${order.total} requires confirmation.`,
            orderNumber: order.orderNumber,
            read: false,
            at: new Date(order.createdAt)
          }));
          setNotifications(pending);
        }
      } catch (e) {
        console.error("Failed to fetch pending notifications", e);
      }
    };
    if (user) {
      fetchPendingNotifications();
    }
  }, [user]);

  const activeRole = mockRole || user?.role;
  
  useEffect(() => {
    if (user?.role === "superadmin") {
      api.get("/admin/roles-ui").then(res => {
        setRolesHtml(res.data); // API returns raw HTML string because it's rendered by EJS
      }).catch(err => console.error("Failed to fetch roles UI", err));
    }
  }, [user?.role]);
  const navItems = NAV_BY_ROLE[activeRole] || [];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleOpenNotifications = (event) => setNotifAnchorEl(event.currentTarget);
  const handleCloseNotifications = () => setNotifAnchorEl(null);

  const handleOpenProfileModal = () => {
    setEditData({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", password: "" });
    setIsProfileModalOpen(true);
    handleCloseMenu();
  };

  const handleSaveProfile = async () => {
    try {
      const { data } = await api.patch("/users/me", editData);
      dispatch(setUser(data.data)); // Update local redux state
      toast.success("Profile updated successfully!");
      setIsProfileModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };

  const handleLogout = () => {
    handleCloseMenu();
    dispatch(logoutThunk());
  };

  useEffect(() => {
    const handleRoleSwitch = (e) => {
      if (e.target.tagName === "SELECT" && e.target.id === "role-switcher-select") {
        dispatch(setMockRole(e.target.value));
      }
    };
    // Listen for changes bubbling up from the injected raw HTML select
    window.addEventListener("change", handleRoleSwitch);
    return () => window.removeEventListener("change", handleRoleSwitch);
  }, [dispatch]);

  const drawerContent = (
    <>
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between" }}>
        {!isCollapsed && (
          <Box>
            <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.1rem" }}>
              मंगलिक · Mangalik
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              {roleDisplayName(activeRole)} {mockRole && "(Mocked)"}
            </Typography>
          </Box>
        )}
        <IconButton onClick={() => setIsCollapsed(!isCollapsed)} size="small">
          <MenuIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => {
          const Icon = Icons[item.icon] || Icons.Circle;
          const active = location.pathname === item.path;
          
          if (item.newTab) {
            return (
              <ListItemButton
                key={item.path}
                onClick={() => window.open(item.path, "_blank", "noopener,noreferrer")}
                sx={{
                  borderRadius: isCollapsed ? "12px" : "0 24px 24px 0",
                  mr: isCollapsed ? 0 : 2,
                  mb: 0.5,
                  mx: isCollapsed ? 1 : 0,
                  justifyContent: isCollapsed ? "center" : "initial",
                  color: "primary.main",
                  "&:hover": { bgcolor: "rgba(227, 60, 36, 0.08)" }
                }}
              >
                <ListItemIcon sx={{ color: "primary.main", minWidth: isCollapsed ? 0 : 40, justifyContent: "center" }} title={isCollapsed ? item.label : ""}>
                  <Icon fontSize="small" />
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: 700, color: "primary.main" }}
                    secondary={!isCollapsed ? "↗ Opens in new tab" : null}
                    secondaryTypographyProps={{ fontSize: 9, color: "primary.light" }}
                  />
                )}
              </ListItemButton>
            );
          }

          return (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              selected={active}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: isCollapsed ? "12px" : "0 24px 24px 0",
                mr: isCollapsed ? 0 : 2,
                mb: 0.5,
                mx: isCollapsed ? 1 : 0,
                justifyContent: isCollapsed ? "center" : "initial",
                color: active ? "primary.main" : "inherit",
                "&.Mui-selected": { bgcolor: "rgba(227, 60, 36, 0.1)" },
                "&:hover": { bgcolor: "rgba(227, 60, 36, 0.05)" }
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: isCollapsed ? 0 : 40, justifyContent: "center" }} title={isCollapsed ? item.label : ""}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }} />}
            </ListItemButton>
          );
        })}
      </List>
    </>
  );

  const currentDrawerWidth = isCollapsed ? 70 : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          width: { md: `calc(100% - ${currentDrawerWidth}px)` }, 
          ml: { md: `${currentDrawerWidth}px` },
          transition: "width 0.2s, margin 0.2s"
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, gap: 3, ml: 1, mr: 2 }}>
            {headerData.title && (
              <Typography variant="h6" fontWeight={700} noWrap color="inherit">
                {headerData.title}
              </Typography>
            )}
            
            {headerData.onSearchChange ? (
              <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
                <input
                  type="text"
                  placeholder={headerData.searchPlaceholder || "Search..."}
                  value={headerData.searchValue || ""}
                  onChange={(e) => headerData.onSearchChange(e.target.value)}
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "1.5px solid #cbd5e1",
                    outline: "none",
                    fontSize: "0.9rem",
                    color: "#334155"
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ flexGrow: 1 }} />
            )}

            {headerData.actionComponent && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {headerData.actionComponent}
              </Box>
            )}
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            {user?.role === "superadmin" && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel shrink>View As Role</InputLabel>
                <div dangerouslySetInnerHTML={{ __html: rolesHtml }} />
              </FormControl>
            )}

            {/* Notification Bell */}
            <IconButton color="inherit" onClick={handleOpenNotifications}>
              <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                <Icons.Notifications />
              </Badge>
            </IconButton>

            <Popover
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleCloseNotifications}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { p: 2, width: 320, maxHeight: 400, overflowY: "auto" } }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                New Orders & Alerts
              </Typography>
              <Divider sx={{ mb: 1 }} />
              {notifications.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No pending order alerts.
                </Typography>
              ) : (
                <List size="small" disablePadding>
                  {notifications.map((n) => (
                    <ListItem
                      key={n.id}
                      disablePadding
                      sx={{
                        mb: 1,
                        bgcolor: n.read ? "transparent" : "action.hover",
                        borderRadius: 1,
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                        <Typography variant="caption" fontWeight={700} color="primary">
                          {n.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(n.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ my: 0.5, fontSize: "0.8rem" }}>
                        {n.message}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          sx={{ fontSize: "0.7rem", py: 0.2 }}
                          onClick={async () => {
                            try {
                              await api.put(`/orders/${n.id}/status`, { status: "processing" });
                              toast.success("Order accepted!");
                              setNotifications(prev => prev.filter(item => item.id !== n.id));
                            } catch (e) {
                              toast.error("Failed to accept order");
                            }
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          sx={{ fontSize: "0.7rem", py: 0.2 }}
                          onClick={() => {
                            setNotifications(prev =>
                              prev.map(item => item.id === n.id ? { ...item, read: true } : item)
                            );
                          }}
                        >
                          Mark Read
                        </Button>
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              )}
            </Popover>
            
            <Stack 
              direction="row" 
              spacing={1} 
              alignItems="center" 
              onClick={handleOpenMenu}
              sx={{ cursor: "pointer", p: 0.5, borderRadius: 2, "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.name}
              </Typography>
              <Avatar src={user?.photoURL} sx={{ width: 36, height: 36 }} />
            </Stack>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
              <MenuItem onClick={handleOpenProfileModal}><Icons.Person fontSize="small" sx={{ mr: 1 }}/> Edit Profile</MenuItem>
              <MenuItem onClick={handleLogout}><Icons.Logout fontSize="small" sx={{ mr: 1 }}/> Logout</MenuItem>
            </Menu>

          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: currentDrawerWidth }, flexShrink: { md: 0 }, transition: "width 0.2s" }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: currentDrawerWidth, overflowX: "hidden", transition: "width 0.2s" },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: currentDrawerWidth, overflowX: "hidden", transition: "width 0.2s" },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, md: 2 }, mt: { xs: 7, md: 8 }, width: { md: `calc(100% - ${currentDrawerWidth}px)` }, transition: "width 0.2s" }}>
        {children}
      </Box>

      {/* Edit Profile Modal */}
      <Dialog open={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth margin="dense" label="Full Name" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Email Address" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="Phone Number" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} size="small" />
          <TextField fullWidth margin="dense" label="New Password (Optional)" type="password" value={editData.password} onChange={(e) => setEditData({...editData, password: e.target.value})} size="small" sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsProfileModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

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
