import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Stack,
  Alert,
} from "@mui/material";
import { toast } from "react-toastify";
import api from "../../services/api";

/**
 * SUPERADMIN — PLATFORM CONTROL CENTER
 * The master kill-switch console: global site enable/disable,
 * per-feature flags, and per-route toggles. This entire page is
 * mounted ONLY under /superadmin/* routes, which are themselves
 * gated both client-side (role check) and server-side
 * (authorize("superadmin") on every /api/superadmin/* route) —
 * defence in depth so this is never reachable by an ADMIN account
 * even via direct URL navigation or a forged client-side role claim.
 */
const PlatformControl = () => {
  const [settings, setSettings] = useState(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  const load = () => api.get("/superadmin/settings").then(({ data }) => {
    setSettings(data.data);
    setMaintenanceMessage(data.data.maintenanceMessage || "");
  });

  useEffect(() => { load(); }, []);

  const toggleGlobal = async (siteEnabled) => {
    try {
      await api.patch("/superadmin/kill-switch", { siteEnabled, maintenanceMessage });
      toast.success(siteEnabled ? "Platform re-enabled." : "Platform disabled platform-wide.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update.");
    }
  };

  const toggleFeature = async (key, value) => {
    try {
      await api.patch("/superadmin/feature-flags", { key, value });
      toast.success(`${key} ${value ? "enabled" : "disabled"}.`);
      load();
    } catch (err) {
      toast.error("Failed to update feature flag.");
    }
  };

  if (!settings) return null;

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Platform Control Center</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Superadmin-exclusive controls. Changes here apply instantly across both the storefront and dashboard.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Global Kill Switch</Typography>
        {!settings.siteEnabled && (
          <Alert severity="error" sx={{ mb: 2 }}>The platform is currently DISABLED for all non-superadmin users.</Alert>
        )}
        <FormControlLabel
          control={<Switch checked={settings.siteEnabled} onChange={(e) => toggleGlobal(e.target.checked)} color="primary" />}
          label={settings.siteEnabled ? "Platform is LIVE" : "Platform is DISABLED"}
        />
        <TextField
          fullWidth
          label="Maintenance message shown to users"
          value={maintenanceMessage}
          onChange={(e) => setMaintenanceMessage(e.target.value)}
          sx={{ mt: 2 }}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Feature Flags</Typography>
        <Stack divider={<Divider />} spacing={1}>
          {Object.entries(settings.featureFlags || {}).map(([key, value]) => (
            <Stack key={key} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
              <Typography sx={{ textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</Typography>
              <Switch checked={!!value} onChange={(e) => toggleFeature(key, e.target.checked)} />
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};

export default PlatformControl;
