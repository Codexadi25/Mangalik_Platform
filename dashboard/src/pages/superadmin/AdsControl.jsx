import { useEffect, useState } from "react";
import { Box, Typography, Paper, Switch, FormControlLabel, TextField, Button, Grid, Divider } from "@mui/material";
import { toast } from "react-toastify";
import api from "../../services/api";

const SLOT_KEYS = ["header_top", "home_mid", "listing_bottom", "product_sidebar", "checkout_footer"];

/**
 * SUPERADMIN — ADS & GOOGLE ADSENSE KEY CONTROL
 * Master switch for Google AdSense across the entire platform, plus
 * per-slot override to a custom banner (e.g. promoting the client's
 * own festival sale instead of third-party ads). By default Google
 * Ads render everywhere; only superadmin can change client IDs, ad
 * unit IDs, or swap to custom creative.
 */
const AdsControl = () => {
  const [settings, setSettings] = useState(null);

  const load = () => api.get("/superadmin/settings").then(({ data }) => setSettings(data.data));
  useEffect(() => { load(); }, []);

  const saveGlobal = async () => {
    try {
      await api.patch("/superadmin/ads", {
        googleAdsenseEnabled: settings.ads.googleAdsenseEnabled,
        adsenseClientId: settings.ads.adsenseClientId,
        customBannersEnabled: settings.ads.customBannersEnabled,
      });
      toast.success("Ads configuration saved.");
    } catch {
      toast.error("Failed to save.");
    }
  };

  const saveSlot = async (slotKey, slotConfig) => {
    try {
      await api.patch("/superadmin/ads", { adSlots: { [slotKey]: slotConfig } });
      toast.success(`Slot "${slotKey}" updated.`);
      load();
    } catch {
      toast.error("Failed to update slot.");
    }
  };

  if (!settings) return null;
  const adSlots = settings.ads.adSlots || {};

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} gutterBottom>Ads & AdSense Key Control</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControlLabel
          control={<Switch checked={settings.ads.googleAdsenseEnabled} onChange={(e) => setSettings({ ...settings, ads: { ...settings.ads, googleAdsenseEnabled: e.target.checked } })} />}
          label="Google AdSense Enabled (platform default)"
        />
        <TextField
          fullWidth
          label="AdSense Client ID"
          value={settings.ads.adsenseClientId}
          onChange={(e) => setSettings({ ...settings, ads: { ...settings.ads, adsenseClientId: e.target.value } })}
          sx={{ mt: 2 }}
        />
        <FormControlLabel
          sx={{ mt: 1 }}
          control={<Switch checked={settings.ads.customBannersEnabled} onChange={(e) => setSettings({ ...settings, ads: { ...settings.ads, customBannersEnabled: e.target.checked } })} />}
          label="Allow Custom Banners"
        />
        <Button variant="contained" sx={{ mt: 2 }} onClick={saveGlobal}>Save Global Ads Settings</Button>
      </Paper>

      <Typography variant="h6" fontWeight={700} gutterBottom>Per-Slot Configuration</Typography>
      <Grid container spacing={2}>
        {SLOT_KEYS.map((slotKey) => {
          const slot = adSlots[slotKey] || { enabled: true, type: "google" };
          return (
            <Grid item xs={12} md={6} key={slotKey}>
              <Paper sx={{ p: 2 }}>
                <Typography fontWeight={600} gutterBottom>{slotKey}</Typography>
                <FormControlLabel
                  control={<Switch checked={slot.enabled !== false} onChange={(e) => saveSlot(slotKey, { ...slot, enabled: e.target.checked })} />}
                  label="Enabled"
                />
                <Divider sx={{ my: 1 }} />
                <Button size="small" onClick={() => saveSlot(slotKey, { ...slot, type: "google" })} sx={{ mr: 1 }}>Use Google Ad</Button>
                <Button size="small" onClick={() => saveSlot(slotKey, { ...slot, type: "custom" })}>Use Custom Banner</Button>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default AdsControl;
