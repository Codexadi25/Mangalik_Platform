import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { 
  Box, Typography, MenuItem, Select, IconButton, Menu, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  TextField, FormControlLabel, Checkbox, FormGroup, Chip 
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import DataTable from "../../components/widgets/DataTable";
import api from "../../services/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const ALL_ROLES = ["admin", "superadmin", "manager", "agent", "deliveryPartner", "salesPartner", "vendor"];
const PERMISSION_OPTIONS = [
  "manage_orders", "manage_catalog", "manage_users", "manage_cms", "view_reports", "manage_coupons"
];

const Staff = () => {
  const currentUser = useSelector(s => s.auth.user);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form states
  const [editRole, setEditRole] = useState("");
  const [editPermissions, setEditPermissions] = useState([]);
  const [newPassword, setNewPassword] = useState("");

  const load = () => api.get("/users").then(({ data }) => { setRows(data.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openMenu = (event, user) => {
    setMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setSelectedUser(null);
  };

  const openProfileModal = () => {
    setEditRole(selectedUser.role);
    setEditPermissions(selectedUser.permissions || []);
    setIsProfileModalOpen(true);
    setMenuAnchor(null);
  };

  const openPasswordModal = () => {
    setNewPassword("");
    setIsPasswordModalOpen(true);
    setMenuAnchor(null);
  };

  const handleUpdateProfile = async () => {
    try {
      await api.patch(`/users/${selectedUser._id}/role`, { role: editRole, permissions: editPermissions });
      toast.success("Profile updated");
      setIsProfileModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    try {
      await api.patch(`/users/${selectedUser._id}/password`, { newPassword });
      toast.success("Password changed successfully");
      setIsPasswordModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  const togglePermission = (perm) => {
    setEditPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const availableRoles = currentUser?.role === "superadmin" 
    ? ALL_ROLES 
    : ALL_ROLES.filter(r => r !== "superadmin");

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email/Phone", flex: 1, valueGetter: (value, row) => row?.email || row?.phone || "" },
    { 
      field: "role", 
      headerName: "Role", 
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} color="primary" variant="outlined" size="small" />
      )
    },
    { 
      field: "lastLoginAt", 
      headerName: "Last Login", 
      width: 180,
      valueGetter: (value, row) => row?.lastLoginAt,
      renderCell: (params) => params.value ? dayjs(params.value).format("DD MMM YYYY, HH:mm") : "Never"
    },
    { field: "lastLoginIp", headerName: "IP Address", width: 150 },
    { field: "failedLoginAttempts", headerName: "Failed Logins", width: 120, align: 'center' },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => openMenu(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    }
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Staff Management</Typography>
      <DataTable rows={rows} columns={columns} loading={loading} />

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={openProfileModal}><EditIcon fontSize="small" sx={{ mr: 1 }}/> Edit Profile</MenuItem>
        <MenuItem onClick={openPasswordModal}><VpnKeyIcon fontSize="small" sx={{ mr: 1 }}/> Change Password</MenuItem>
      </Menu>

      {/* Profile/Role/Permissions Modal */}
      <Dialog open={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Staff Profile</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Role</Typography>
          <Select 
            fullWidth 
            value={editRole} 
            onChange={(e) => setEditRole(e.target.value)} 
            size="small" 
            sx={{ mb: 3 }}
          >
            {availableRoles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>API Route Permissions</Typography>
          <FormGroup>
            {PERMISSION_OPTIONS.map(perm => (
              <FormControlLabel
                key={perm}
                control={<Checkbox checked={editPermissions.includes(perm)} onChange={() => togglePermission(perm)} />}
                label={perm.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsProfileModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateProfile}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>Enter a new password for <b>{selectedUser?.name}</b>.</Typography>
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleChangePassword}>Update Password</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;
