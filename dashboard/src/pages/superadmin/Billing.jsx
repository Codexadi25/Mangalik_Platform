import { useEffect, useState } from "react";
import { Box, Typography, Paper, Switch, FormControlLabel, TextField, Button, Stack, Alert } from "@mui/material";
import { toast } from "react-toastify";
import api from "../../services/api";

/**
 * SUPERADMIN — BILLING ENFORCEMENT
 * Lets Aditya Tech & Devoops enforce payment dues against the
 * client by suspending the platform (or specific features) if dues
 * are overdue, independent of any disablement visible to the ADMIN
 * (business owner) account. This is intentionally NOT exposed
 * anywhere in the admin-facing dashboard.
 */
const Billing = () => {
  const [settings, setSettings] = useState(null);
  const [nextDueDate, setNextDueDate] = useState("");

  const load = () => api.get("/superadmin/settings").then(({ data }) => {
    setSettings(data.data);
    setNextDueDate(data.data.billing?.nextDueDate?.slice(0, 10) || "");
  });

  useEffect(() => { load(); }, []);

  const save = async (overrides = {}) => {
    try {
      await api.patch("/superadmin/billing", {
        isDuesCleared: settings.billing.isDuesCleared,
        autoDisableOnOverdue: settings.billing.autoDisableOnOverdue,
        overdueGraceDays: settings.billing.overdueGraceDays,
        nextDueDate,
        ...overrides,
      });
      toast.success("Billing settings updated.");
      load();
    } catch {
      toast.error("Failed to update billing settings.");
    }
  };

  if (!settings) return null;
  const billing = settings.billing || {};

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Billing Enforcement</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Internal use only — controls client payment-due enforcement against the live platform.
      </Typography>

      {!billing.isDuesCleared && (
        <Alert severity="warning" sx={{ mb: 2 }}>Client dues are marked as NOT cleared.</Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <FormControlLabel
          control={<Switch checked={billing.isDuesCleared} onChange={(e) => save({ isDuesCleared: e.target.checked })} />}
          label="Dues Cleared"
        />
        <FormControlLabel
          control={<Switch checked={billing.autoDisableOnOverdue} onChange={(e) => save({ autoDisableOnOverdue: e.target.checked })} />}
          label="Auto-disable platform when overdue"
        />
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Next Due Date"
            type="date"
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Overdue Grace Days"
            type="number"
            value={billing.overdueGraceDays}
            onChange={(e) => setSettings({ ...settings, billing: { ...billing, overdueGraceDays: e.target.value } })}
          />
        </Stack>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => save()}>Save Billing Settings</Button>
      </Paper>
    </Box>
  );
};

export default Billing;
