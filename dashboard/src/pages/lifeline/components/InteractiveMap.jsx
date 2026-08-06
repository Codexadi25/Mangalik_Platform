import React from "react";
import { Box, Typography, Button } from "@mui/material";

const InteractiveMap = ({
  width = "100%",
  height = 90,
  mapActive = true,
  mapSessionTime = 30,
  handleReloadMap,
  onExpand,
  order,
  businessSettings
}) => {
  const dropAddress = order?.shippingAddress
    ? `${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.pincode}`
    : "New Delhi";

  const pickupAddress = businessSettings?.businessLocation || "26, Yogendra Vihar, Naubasta, Kanpur Nagar, Uttar Pradesh - 208021";

  const mapUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(pickupAddress)}&daddr=${encodeURIComponent(dropAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <Box
      sx={{
        width,
        height,
        position: "relative",
        border: "1px solid #ccc",
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "#e5e9f0"
      }}
    >
      <Box sx={{
        position: "absolute", top: 4, right: 4, zIndex: 10,
        bgcolor: "rgba(0,0,0,0.8)", color: "#fff", px: 1, py: 0.2,
        borderRadius: "4px", fontSize: 9, fontWeight: "bold"
      }}>
        {mapActive ? `Session: ${mapSessionTime}s` : "Expired"}
      </Box>

      {mapActive && (
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={mapUrl}
          allowFullScreen
          loading="lazy"
        />
      )}

      {onExpand && (
        <Box sx={{ position: "absolute", bottom: 4, left: 4, zIndex: 10 }}>
          <Button
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            sx={{ minWidth: 20, height: 20, p: 0, bgcolor: "rgba(255,255,255,0.9)", color: "#333", fontSize: 10, fontWeight: "bold", border: "1px solid #ccc" }}
          >
            ⛶
          </Button>
        </Box>
      )}

      {!mapActive && (
        <Box sx={{
          position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.65)",
          zIndex: 100, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 1
        }}>
          <Typography fontSize={11} color="#fff" fontWeight="bold">Map Session Expired</Typography>
          <Button
            size="small" variant="contained" color="error"
            onClick={(e) => { e.stopPropagation(); handleReloadMap(); }}
            sx={{ textTransform: "none", fontSize: 9, py: 0.2, px: 1, minHeight: 20 }}
          >
            Reload Map
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default InteractiveMap;
