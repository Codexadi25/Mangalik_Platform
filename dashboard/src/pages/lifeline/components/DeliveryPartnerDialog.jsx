import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box,
  TextField, Button, Typography, Stack
} from "@mui/material";
import { toast } from "react-toastify";

const DeliveryPartnerDialog = ({
  open,
  onClose,
  onSubmit
}) => {
  const [partnerName, setPartnerName] = useState("Shadowfax");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [vehiclePlateNo, setVehiclePlateNo] = useState("");
  const [trackingId, setTrackingId] = useState("");

  const handleAutoFetch = () => {
    setPartnerName("NexLog Logistics");
    setPartnerPhone("+91 98765 43210");
    setVehiclePlateNo("UP78-EX-9988");
    const mockTrackingId = `NEX-${Math.floor(100000 + Math.random() * 900000)}`;
    setTrackingId(mockTrackingId);
    toast.success("Auto-fetched delivery partner details from NexLogLogistics!");
  };

  const handleSave = () => {
    if (!partnerName.trim()) {
      toast.warning("Delivery Partner Name is required.");
      return;
    }
    onSubmit({
      deliveryPartnerName: partnerName.trim(),
      partnerPhone: partnerPhone.trim() || undefined,
      vehiclePlateNo: vehiclePlateNo.trim() || undefined,
      trackingId: trackingId.trim() || undefined
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Attach Delivery Partner & Tracking Details</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1.5 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAutoFetch}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)",
              "&:hover": { background: "linear-gradient(90deg, #122547 0%, #1a3668 100%)" }
            }}
          >
            ⚡ Auto-Fetch from NexLogLogistics
          </Button>

          <Typography variant="caption" color="text.secondary">
            Or enter the logistical partner details manually below to generate tracking:
          </Typography>

          <TextField
            fullWidth
            label="Logistical Partner Name"
            placeholder="e.g. Porter, Shadowfax, Delhivery"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            size="small"
          />

          <TextField
            fullWidth
            label="Logistical Partner Phone Number"
            placeholder="e.g. +91 98765 43210"
            value={partnerPhone}
            onChange={(e) => setPartnerPhone(e.target.value)}
            size="small"
          />

          <TextField
            fullWidth
            label="Vehicle License Plate No."
            placeholder="e.g. UP78-EX-9988"
            value={vehiclePlateNo}
            onChange={(e) => setVehiclePlateNo(e.target.value)}
            size="small"
          />

          <TextField
            fullWidth
            label="Tracking Ref. ID (leave blank to auto-generate)"
            placeholder="e.g. TRK-SHADOWFAX-XXXXXX"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" size="small" sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="error" size="small" sx={{ textTransform: "none", fontWeight: 700 }}>
          Attach Details & Dispatch
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeliveryPartnerDialog;
