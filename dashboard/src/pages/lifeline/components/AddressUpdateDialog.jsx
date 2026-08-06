import React from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Paper, Typography,
  Button, Alert, FormControl, InputLabel, Select, MenuItem, Stack,
  TextField, FormControlLabel, Checkbox, Box
} from "@mui/material";
import { toast } from "react-toastify";

const AddressUpdateDialog = ({
  open,
  onClose,
  order,
  customerAddresses,
  selectedAddressBookIdx,
  setSelectedAddressBookIdx,
  manualAddressForm,
  setManualAddressForm,
  saveToBook,
  setSaveToBook,
  gpsCountdown,
  setGpsCountdown,
  handleUpdateAddress
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <span style={{ fontWeight: 700 }}>Update Delivery Location & Address</span>
        <IconButton size="small" onClick={onClose}>✕</IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {/* Option A: Request GPS Location */}
        <Paper sx={{ p: 2, mb: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Option A: GPS Location request (1-Min Window)
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Send an alert to the user's active application session to query their live GPS location coordinates.
          </Typography>
          {gpsCountdown > 0 ? (
            <Alert severity="warning" sx={{ mt: 1 }}>
              GPS Sharing Window is active. Countdown: <strong>{gpsCountdown}s</strong>
            </Alert>
          ) : (
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => {
                setGpsCountdown(60);
                toast.success("GPS Sharing Request broadcasted! Listening for client geolocation updates (1-minute window).");
              }}
              sx={{ mt: 1, textTransform: "none" }}
            >
              Request GPS Location
            </Button>
          )}
        </Paper>

        {/* Option B: Select Saved Address */}
        <Paper sx={{ p: 2, mb: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Option B: Select from Customer's Address Book
          </Typography>
          {customerAddresses.length > 0 ? (
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel>Select Saved Address</InputLabel>
              <Select
                value={selectedAddressBookIdx}
                label="Select Saved Address"
                onChange={(e) => {
                  const idx = e.target.value;
                  setSelectedAddressBookIdx(idx);
                  if (idx !== "") {
                    const addr = customerAddresses[idx];
                    handleUpdateAddress({
                      fullName: addr.fullName,
                      phone: addr.phone,
                      line1: addr.line1,
                      city: addr.city,
                      state: addr.state,
                      pincode: addr.pincode
                    });
                  }
                }}
              >
                <MenuItem value=""><em>-- Choose --</em></MenuItem>
                {customerAddresses.map((addr, idx) => (
                  <MenuItem key={idx} value={idx}>
                    {addr.fullName} ({addr.phone}) - {addr.line1}, {addr.city} ({addr.pincode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No saved addresses found in user's profile.
            </Typography>
          )}
        </Paper>

        {/* Option C: Modify Address details */}
        <Paper sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Option C: Modify Address manually & Save to Address Book
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth size="small" label="Full Name"
              value={manualAddressForm.fullName}
              onChange={(e) => setManualAddressForm({ ...manualAddressForm, fullName: e.target.value })}
            />
            <TextField
              fullWidth size="small" label="Phone"
              value={manualAddressForm.phone}
              onChange={(e) => setManualAddressForm({ ...manualAddressForm, phone: e.target.value })}
            />
            <TextField
              fullWidth size="small" label="Address line"
              value={manualAddressForm.line1}
              onChange={(e) => setManualAddressForm({ ...manualAddressForm, line1: e.target.value })}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
              <TextField
                size="small" label="City"
                value={manualAddressForm.city}
                onChange={(e) => setManualAddressForm({ ...manualAddressForm, city: e.target.value })}
              />
              <TextField
                size="small" label="State"
                value={manualAddressForm.state}
                onChange={(e) => setManualAddressForm({ ...manualAddressForm, state: e.target.value })}
              />
              <TextField
                size="small" label="Pincode"
                value={manualAddressForm.pincode}
                onChange={(e) => setManualAddressForm({ ...manualAddressForm, pincode: e.target.value })}
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={saveToBook}
                  onChange={(e) => setSaveToBook(e.target.checked)}
                  color="error"
                />
              }
              label="Save as new address to customer's address book (Visible to user)"
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleUpdateAddress(manualAddressForm, saveToBook)}
                sx={{ textTransform: "none" }}
              >
                Save & Update Address
              </Button>
            </Box>
          </Stack>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default AddressUpdateDialog;
