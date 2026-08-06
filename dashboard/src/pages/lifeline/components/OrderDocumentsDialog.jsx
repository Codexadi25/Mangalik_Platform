import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Chip,
  IconButton, Tabs, Tab, Paper, Typography, Button
} from "@mui/material";
import dayjs from "dayjs";

const OrderDocumentsDialog = ({
  open,
  onClose,
  order,
  activeBillTab,
  setActiveBillTab,
  businessSettings
}) => {
  if (!order) return null;

  const isCOD = order.paymentMethod?.toLowerCase() === "cod";
  const itemTotal = order.subtotal || 0;
  const taxes = order.gstAmount || (itemTotal * 0.05);
  const deliveryCharge = order.shippingFee || 0;
  const donateAmount = businessSettings?.donationAmount !== undefined ? businessSettings.donationAmount : 3.00;
  const platformFee = businessSettings?.platformFee !== undefined ? businessSettings.platformFee : 14.90;
  const packagingCharges = businessSettings?.packagingCharges !== undefined ? businessSettings.packagingCharges : 10.00;
  
  // Calculate discount if coupon is present or derived
  const discount = order.couponCode ? 60.00 : 0.00;
  
  // Final calculated total matching details
  const computedTotal = itemTotal - discount + taxes + (deliveryCharge > 0 ? deliveryCharge : 0) + donateAmount + platformFee + packagingCharges;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1, px: 3, pt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: 16 }}>Items & billing</Typography>
          <Chip
            label={order.paymentStatus === "paid" ? "Success" : "Success"}
            size="small"
            sx={{ bgcolor: "#e3f2fd", color: "#1976d2", fontSize: 10, height: 18, fontWeight: 700 }}
          />
        </Box>
        <IconButton size="small" onClick={onClose}>✕</IconButton>
      </DialogTitle>
      
      <Tabs
        value={activeBillTab}
        onChange={(e, val) => setActiveBillTab(val)}
        sx={{
          px: 3,
          borderBottom: "1px solid #eee",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 13, minWidth: "140px" },
          "& .Mui-selected": { color: "#ff4e3a !important" },
          "& .MuiTabs-indicator": { bgcolor: "#ff4e3a" }
        }}
      >
        <Tab label="Customer Bill" />
        <Tab label="Merchant Bill" />
      </Tabs>

      <DialogContent sx={{ pt: 3, pb: 2, display: "flex", justifyContent: "center", bgcolor: "#f5f5f5" }}>
        <Paper sx={{ p: 3, width: "100%", maxWidth: "780px", minHeight: "450px", bgcolor: "#fff", color: "#000", fontFamily: "'Inter', sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", position: "relative", boxSizing: "border-box" }}>
          
          {/* CUSTOMER BILL TAB */}
          {activeBillTab === 0 && (
            <Box>
              {/* Dynamic Order Items List */}
              {order.items?.map((item, idx) => (
                <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box>
                    <Typography fontSize={13} fontWeight={500} color="#333">
                      {item.title || item.product?.title}
                    </Typography>
                    <Typography fontSize={11} color="#888" mt={0.2}>
                      {item.quantity}x ₹{Number(item.price || item.product?.basePrice).toFixed(0)}
                    </Typography>
                  </Box>
                  <Typography fontSize={13} fontWeight={500} color="#111">
                    ₹{Number((item.price || item.product?.basePrice) * item.quantity).toFixed(0)}
                  </Typography>
                </Box>
              ))}

              <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "16px 0" }} />

              {/* Bill Details */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, fontSize: 12.5, color: "#555" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontSize={12.5}>Item total</Typography>
                  <Typography fontSize={12.5}>₹{itemTotal.toFixed(2)}</Typography>
                </Box>

                {order.couponCode && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", color: "#2e7d32" }}>
                    <Typography fontSize={12.5}>Coupon - ({order.couponCode})</Typography>
                    <Typography fontSize={12.5}>- ₹{discount.toFixed(2)}</Typography>
                  </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontSize={12.5}>Taxes</Typography>
                  <Typography fontSize={12.5}>₹{taxes.toFixed(2)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontSize={12.5}>Delivery Charge</Typography>
                  {deliveryCharge === 0 ? (
                    <Typography fontSize={12.5} sx={{ color: "#1976d2", fontWeight: 600 }}>FREE</Typography>
                  ) : (
                    <Typography fontSize={12.5}>₹{deliveryCharge.toFixed(2)}</Typography>
                  )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontSize={12.5}>Donate ₹3 to Feeding India</Typography>
                  <Typography fontSize={12.5}>₹{donateAmount.toFixed(2)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontSize={12.5}>Platform fee</Typography>
                  <Typography fontSize={12.5}>₹{platformFee.toFixed(2)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontSize={12.5}>Packaging Charges</Typography>
                  <Typography fontSize={12.5}>₹{packagingCharges.toFixed(0)}</Typography>
                </Box>

                <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "8px 0" }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#111" }}>
                  <Typography fontSize={13}>Total</Typography>
                  <Typography fontSize={13}>₹{Number(order.total || computedTotal).toFixed(2)}</Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                  <Typography fontSize={12}>Cash to be collected from User</Typography>
                  <Typography fontSize={12}>₹{isCOD ? Number(order.total || computedTotal).toFixed(0) : 0}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* MERCHANT BILL TAB */}
          {activeBillTab === 1 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #ccc", pb: 2, mb: 2 }}>
                <Box>
                  <Typography fontWeight={700} fontSize={14}>{businessSettings?.businessName?.toUpperCase() || order.items?.[0]?.vendor?.businessName || "MANGALIK SACRED STORE"}</Typography>
                  <Typography fontSize={11} color="#666" mt={0.5}>GSTIN: {businessSettings?.gstNumber || "29AADCD4946L1Z6"}</Typography>
                  <Typography fontSize={11} color="#666">FSSAI: {businessSettings?.fssaiLicenseNumber || "12726055000219"}</Typography>
                  <Typography fontSize={11} color="#666" mt={0.5} sx={{ maxWidth: 300 }}>
                    {businessSettings?.billingAddress || order.items?.[0]?.vendor?.businessAddress || "26, Yogendra Vihar, Naubasta, Kanpur Nagar, Uttar Pradesh - 208021"}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography fontWeight={700} fontSize={14}>Merchant Tax Invoice</Typography>
                  <Typography fontSize={11} color="#666" mt={0.5}>Inv No: MNGLK-INV-{order.orderNumber || order._id?.slice(-8).toUpperCase()}</Typography>
                  <Typography fontSize={11} color="#666">Date: {dayjs(order.createdAt).format("DD/MM/YYYY")}</Typography>
                </Box>
              </Box>

              {order.items?.map((item, idx) => (
                <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                  <Box>
                    <Typography fontSize={13} fontWeight={500} color="#333">
                      {item.title || item.product?.title}
                    </Typography>
                    <Typography fontSize={11} color="#888" mt={0.2}>
                      {item.quantity}x ₹{Number(item.price || item.product?.basePrice).toFixed(0)}
                    </Typography>
                  </Box>
                  <Typography fontSize={13} fontWeight={500} color="#111">
                    ₹{Number((item.price || item.product?.basePrice) * item.quantity).toFixed(0)}
                  </Typography>
                </Box>
              ))}

              <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "16px 0" }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, fontSize: 12.5, color: "#555" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontSize={12.5}>Merchant Subtotal</Typography>
                  <Typography fontSize={12.5}>₹{itemTotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontSize={12.5}>Taxes (CGST 2.5% + SGST 2.5%)</Typography>
                  <Typography fontSize={12.5}>₹{taxes.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography fontSize={12.5}>Merchant Packaging Charges</Typography>
                  <Typography fontSize={12.5}>₹{packagingCharges.toFixed(2)}</Typography>
                </Box>
                <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "8px 0" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#111" }}>
                  <Typography fontSize={13}>Merchant Invoice Total</Typography>
                  <Typography fontSize={13}>₹{(itemTotal + taxes + packagingCharges).toFixed(2)}</Typography>
                </Box>
              </Box>
            </Box>
          )}

        </Paper>
      </DialogContent>

      {/* FOOTER ACTIONS - Blue Bordered Buttons with Download Icon */}
      <DialogActions sx={{ px: 3, pb: 3, pt: 1, display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => window.open(`/orders/${order._id}/print?type=bill`, "_blank")}
          sx={{
            textTransform: "none", fontSize: 11.5, px: 2, py: 0.6,
            border: "1px solid #2196f3", color: "#2196f3", borderRadius: "6px", fontWeight: 600,
            "&:hover": { border: "1px solid #0b7dda", bgcolor: "#f4faff" }
          }}
        >
          📥 Bill
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => window.open(`/orders/${order._id}/print?type=invoice`, "_blank")}
          sx={{
            textTransform: "none", fontSize: 11.5, px: 2, py: 0.6,
            border: "1px solid #2196f3", color: "#2196f3", borderRadius: "6px", fontWeight: 600,
            "&:hover": { border: "1px solid #0b7dda", bgcolor: "#f4faff" }
          }}
        >
          📥 Invoice
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => window.open(`/orders/${order._id}/print?type=gst`, "_blank")}
          sx={{
            textTransform: "none", fontSize: 11.5, px: 2, py: 0.6,
            border: "1px solid #2196f3", color: "#2196f3", borderRadius: "6px", fontWeight: 600,
            "&:hover": { border: "1px solid #0b7dda", bgcolor: "#f4faff" }
          }}
        >
          📥 Platform Fee Invoice
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => window.open(`/orders/${order._id}/print?type=dc`, "_blank")}
          sx={{
            textTransform: "none", fontSize: 11.5, px: 2, py: 0.6,
            border: "1px solid #2196f3", color: "#2196f3", borderRadius: "6px", fontWeight: 600,
            "&:hover": { border: "1px solid #0b7dda", bgcolor: "#f4faff" }
          }}
        >
          📥 DC Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDocumentsDialog;
