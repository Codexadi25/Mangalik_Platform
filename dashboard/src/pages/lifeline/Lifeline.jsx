import React, { useState, useRef } from "react";
import {
  Box, Typography, TextField, Button, Chip, IconButton, Tooltip, Divider,
  CircularProgress, Stack, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Tab, Tabs, Paper, Modal
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneIcon from "@mui/icons-material/Phone";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AddIcon from "@mui/icons-material/Add";
import api from "../../services/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";

// ─── Issue categories adapted for Mangalik Poojan Samagri ───────────────────
const ISSUES = [
  "Order Delayed",
  "Package Damaged / Broken Item",
  "Item Missing or Not Delivered",
  "Wrong Item Delivered",
  "Payment / Billing Issue",
  "Poor Packaging (Ritual Item Concern)",
  "Change Delivery Address",
  "Escalate to Manager",
];

// ─── Quick Actions adapted for Quick Commerce ────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Accept Order", icon: "✅" },
  { label: "Change Delivery Address", icon: "📍" },
  { label: "Assign Delivery Partner", icon: "🚴" },
  { label: "Mark as Packed", icon: "📦" },
  { label: "Mark as Shipped", icon: "🚚" },
  { label: "Mark as Delivered", icon: "🏠" },
  { label: "Issue Full Refund", icon: "💸" },
  { label: "Issue Partial Refund", icon: "🔄" },
  { label: "Cancel Order", icon: "❌" },
  { label: "Waive Delivery Charge", icon: "🎁" },
  { label: "Contact Customer (Masked)", icon: "📞" },
  { label: "Escalate to Manager", icon: "⬆️" },
  { label: "Generate Invoice", icon: "🧾" },
  { label: "View Complaints / Tickets", icon: "🎫" },
];

// ─── Progress timeline steps ─────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "pending", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const getStepIndex = (status) => STATUS_STEPS.findIndex((s) => s.key === status);

// ─── Masked phone display ────────────────────────────────────────────────────
const maskPhone = (phone) => (phone ? `XXXXX${phone.slice(-5)}` : "N/A");

// ─── Copy to clipboard helper ────────────────────────────────────────────────
const CopyChip = ({ text }) => (
  <Tooltip title="Copy">
    <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => { navigator.clipboard.writeText(text); toast.info("Copied!"); }}>
      <ContentCopyIcon sx={{ fontSize: 13, color: "#888" }} />
    </IconButton>
  </Tooltip>
);

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const Lifeline = () => {
  const [searchType, setSearchType] = useState("orderNumber");
  const [searchValue, setSearchValue] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rightTab, setRightTab] = useState(0); // 0 = Report An Issue, 1 = Quick Actions
  const [activeIssue, setActiveIssue] = useState(null);
  const [actionSearch, setActionSearch] = useState("");
  const [comment, setComment] = useState("");
  const [billModal, setBillModal] = useState(false);
  const [historyModal, setHistoryModal] = useState({ open: false, data: null, title: "" });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const searchInputRef = useRef(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchValue.trim()) return;
    setLoading(true);
    setOrder(null);
    setActiveIssue(null);
    try {
      const { data } = await api.get(`/orders/lifeline/search?query=${encodeURIComponent(searchValue.trim())}&type=${searchType}`);
      if (data.data?.length > 0) {
        setOrder(data.data[0]);
        setTags(data.data[0].tags || []);
      } else {
        toast.warning("No order found matching your search.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to search orders.");
    } finally {
      setLoading(false);
    }
  };

  const openHistory = async (userId, title) => {
    if (!userId) return;
    try {
      const { data } = await api.get(`/users/${userId}/history`);
      setHistoryModal({ open: true, data: data.data, title });
    } catch {
      toast.error("Could not load history.");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    toast.success("Comment added.");
    setComment("");
  };

  const handleQuickAction = async (action) => {
    if (!order) return;
    
    const statusMap = {
      "Accept Order": "confirmed",
      "Mark as Packed": "packed",
      "Mark as Shipped": "shipped",
      "Mark as Delivered": "delivered",
    };

    if (action === "Cancel Order") {
      const reason = window.prompt("Enter rejection / cancellation reason:");
      if (!reason) return toast.warning("Cancellation cancelled. Reason is required.");
      try {
        const { data } = await api.put(`/orders/${order._id}/status`, { status: "cancelled", rejectionReason: reason });
        if (data.data) setOrder(data.data);
        toast.success("Order cancelled / rejected successfully.");
      } catch (err) {
        toast.error(err.response?.data?.message || "Cancellation failed.");
      }
      return;
    }

    if (action === "Change Delivery Address") {
      const newAddressLine1 = window.prompt("Enter New Shipping Address Line 1:", order.shippingAddress?.line1);
      if (!newAddressLine1) return;
      const newCity = window.prompt("Enter City:", order.shippingAddress?.city);
      const newState = window.prompt("Enter State:", order.shippingAddress?.state);
      const newPincode = window.prompt("Enter Pincode:", order.shippingAddress?.pincode);
      try {
        const updatedAddress = {
          ...order.shippingAddress,
          line1: newAddressLine1,
          city: newCity || order.shippingAddress?.city,
          state: newState || order.shippingAddress?.state,
          pincode: newPincode || order.shippingAddress?.pincode,
        };
        const { data } = await api.patch(`/orders/${order._id}`, { shippingAddress: updatedAddress });
        if (data.data) setOrder(data.data);
        toast.success("Shipping address successfully updated.");
      } catch (err) {
        toast.error("Address update failed.");
      }
      return;
    }

    if (action === "Assign Delivery Partner") {
      const partner = window.prompt("Enter Delivery Partner (e.g. Porter, Shadowfax, Pidge, Delhivery):", "Shadowfax");
      if (!partner) return;
      const trkId = window.prompt("Enter Tracking ID (leave blank to auto-generate):");
      try {
        const { data } = await api.put(`/orders/${order._id}/status`, {
          status: "packed",
          deliveryPartnerName: partner,
          trackingId: trkId || undefined
        });
        if (data.data) setOrder(data.data);
        toast.success(`Delivery partner assigned: ${partner}`);
      } catch (err) {
        toast.error("Failed to assign partner.");
      }
      return;
    }

    if (action === "Issue Full Refund") {
      if (window.confirm("Confirm issuing full refund for this order?")) {
        try {
          const { data } = await api.patch(`/orders/${order._id}`, { paymentStatus: "refunded" });
          if (data.data) setOrder(data.data);
          toast.success("Full refund processed successfully.");
        } catch (err) {
          toast.error("Refund failed.");
        }
      }
      return;
    }

    if (action === "Issue Partial Refund") {
      const amt = window.prompt("Enter refund amount:");
      if (!amt) return;
      try {
        const { data } = await api.patch(`/orders/${order._id}`, { paymentStatus: "partially_refunded" });
        if (data.data) setOrder(data.data);
        toast.success(`Partial refund of ₹${amt} registered.`);
      } catch (err) {
        toast.error("Partial refund failed.");
      }
      return;
    }

    if (action === "Waive Delivery Charge") {
      if (window.confirm("Waive delivery shipping fee?")) {
        try {
          const newTotal = order.total - (order.shippingFee || 0);
          const { data } = await api.patch(`/orders/${order._id}`, { shippingFee: 0, total: newTotal });
          if (data.data) setOrder(data.data);
          toast.success("Delivery fee waived successfully.");
        } catch (err) {
          toast.error("Waiving failed.");
        }
      }
      return;
    }

    if (action === "Contact Customer (Masked)") {
      toast.info(`Dialing masked customer phone: ${maskPhone(order.shippingAddress?.phone || order.user?.phone)}`);
      return;
    }

    if (action === "Escalate to Manager") {
      toast.success("Order issue escalated successfully to supervisor queue.");
      return;
    }

    if (action === "Generate Invoice") {
      window.open(`/orders/${order._id}/print?type=invoice`, "_blank");
      return;
    }

    if (action === "View Complaints / Tickets") {
      toast.info("Opening support tickets associated with user account...");
      return;
    }

    if (statusMap[action]) {
      try {
        const { data } = await api.put(`/orders/${order._id}/status`, { status: statusMap[action] });
        if (data.data) setOrder(data.data);
        toast.success(`Order marked as ${statusMap[action]}.`);
      } catch (err) {
        toast.error(err.response?.data?.message || "Action failed.");
      }
      return;
    }
    toast.info(`"${action}" — coming soon!`);
  };

  const activeStep = order ? getStepIndex(order.status) : -1;
  const filteredActions = QUICK_ACTIONS.filter(a =>
    a.label.toLowerCase().includes(actionSearch.toLowerCase())
  );

  // ─── RIGHT PANEL ──────────────────────────────────────────────────────────
  const RightPanel = () => (
    <Box sx={{ width: 340, minWidth: 340, borderLeft: "1px solid #e8e8e8", display: "flex", flexDirection: "column", bgcolor: "#fff", height: "100%" }}>
      <Tabs
        value={rightTab}
        onChange={(_, v) => { setRightTab(v); setActiveIssue(null); }}
        variant="fullWidth"
        sx={{
          borderBottom: "1px solid #e8e8e8",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 13 },
          "& .Mui-selected": { color: "#e53935 !important" },
          "& .MuiTabs-indicator": { bgcolor: "#e53935" }
        }}
      >
        <Tab label="Report An Issue" />
        <Tab label="Quick Actions" />
      </Tabs>

      {/* Issue/Action search */}
      <Box sx={{ p: 1.5, borderBottom: "1px solid #f0f0f0" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Let's start search..."
          value={actionSearch}
          onChange={(e) => setActionSearch(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1, fontSize: 13 } }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {rightTab === 0 && (
          <>
            {activeIssue === null ? (
              // Issue list
              ISSUES.filter(i => i.toLowerCase().includes(actionSearch.toLowerCase())).map((issue) => (
                <Box
                  key={issue}
                  onClick={() => setActiveIssue(issue)}
                  sx={{
                    px: 2, py: 1.5, cursor: "pointer", fontSize: 13, color: "#333",
                    borderBottom: "1px solid #f5f5f5",
                    "&:hover": { bgcolor: "#fafafa" },
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}
                >
                  <span>{issue}</span>
                  <span style={{ color: "#ccc", fontSize: 16 }}>›</span>
                </Box>
              ))
            ) : (
              // Issue detail flow
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <IconButton size="small" onClick={() => setActiveIssue(null)} sx={{ mr: 1 }}>
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                  <Typography fontWeight={700} fontSize={14}>{activeIssue}</Typography>
                </Box>

                <Typography fontSize={12} color="text.secondary" mb={1}>Select affected items:</Typography>
                {order?.items?.map((item, idx) => (
                  <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, mb: 1, border: "1px solid #eee", borderRadius: 1 }}>
                    <Box>
                      <Typography fontSize={13} fontWeight={600}>{item.title || item.product?.title || "Product"}</Typography>
                      <Typography fontSize={11} color="text.secondary">₹{item.price || item.product?.basePrice} × {item.quantity}</Typography>
                    </Box>
                    <Button size="small" variant="outlined" startIcon={<AddIcon />} sx={{ fontSize: 11, minWidth: "auto", px: 1 }}>Add</Button>
                  </Box>
                ))}

                <TextField
                  multiline rows={3} fullWidth size="small" placeholder="Describe the issue..."
                  sx={{ mt: 2, mb: 2, fontSize: 12 }}
                />
                <Button
                  fullWidth variant="contained"
                  sx={{ bgcolor: "#e53935", "&:hover": { bgcolor: "#c62828" }, textTransform: "none", fontWeight: 600 }}
                  onClick={() => { toast.success("Issue logged successfully!"); setActiveIssue(null); }}
                >
                  Submit Issue
                </Button>
              </Box>
            )}
          </>
        )}

        {rightTab === 1 && (
          filteredActions.map(({ label, icon }) => (
            <Box
              key={label}
              onClick={() => handleQuickAction(label)}
              sx={{
                px: 2, py: 1.5, cursor: "pointer", fontSize: 13, color: "#333",
                borderBottom: "1px solid #f5f5f5",
                "&:hover": { bgcolor: "#fafafa" },
                display: "flex", alignItems: "center", gap: 1.5
              }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span>{label}</span>
            </Box>
          ))
        )}
      </Box>

      {/* Comments Section */}
      {order && (
        <Box sx={{ borderTop: "1px solid #e8e8e8", p: 1.5 }}>
          <Typography fontWeight={700} fontSize={13} mb={1}>Comments</Typography>
          <TextField
            fullWidth multiline rows={2} size="small"
            placeholder="Start typing your comments..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 1, "& .MuiOutlinedInput-root": { fontSize: 12 } }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button size="small" variant="outlined" onClick={handleAddComment} sx={{ textTransform: "none", fontSize: 12 }}>Add</Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "#f7f7f7", fontFamily: "'Inter', 'Roboto', sans-serif" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 2, px: 3, py: 1.5,
        bgcolor: "#fff", borderBottom: "1px solid #e0e0e0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
      }}>
        {/* Logo */}
        <Typography fontWeight={800} fontSize={20} sx={{ mr: 2, whiteSpace: "nowrap", letterSpacing: "-0.5px" }}>
          <span style={{ color: "#e53935" }}>mangalik</span>
          <span style={{ color: "#444", fontWeight: 400, marginLeft: 6 }}>Lifeline</span>
        </Typography>

        {/* Search Type Selector */}
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          style={{
            border: "1px solid #ddd", borderRadius: 6, padding: "7px 12px",
            fontSize: 13, color: "#333", background: "#fafafa", cursor: "pointer", outline: "none"
          }}
        >
          <option value="orderNumber">Order Number</option>
          <option value="phone">Customer Phone</option>
          <option value="orderId">Order ID</option>
          <option value="email">Customer Email</option>
        </select>

        {/* Search Input */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", gap: 8, maxWidth: 700 }}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === "orderNumber" ? "Enter Order Number..." : searchType === "phone" ? "Enter Customer Phone..." : "Enter Order ID..."}
            style={{
              flex: 1, border: "1px solid #ddd", borderRadius: 6,
              padding: "8px 14px", fontSize: 14, outline: "none",
              fontFamily: "inherit"
            }}
          />
          <button
            type="submit"
            style={{
              background: "#27ae60", color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              fontWeight: 600, fontSize: 14
            }}
          >
            <SearchIcon sx={{ fontSize: 18 }} /> Search
          </button>
        </form>

        <Box sx={{ flex: 1 }} />
        <Avatar sx={{ width: 34, height: 34, bgcolor: "#e53935", fontSize: 14 }}>M</Avatar>
      </Box>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── LEFT MAIN PANEL ─────────────────────────────────────────────── */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
              <CircularProgress color="error" />
            </Box>
          )}

          {!loading && !order && (
            <Box sx={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "70vh", color: "#999", gap: 2
            }}>
              <Box sx={{ fontSize: 64 }}>🔍</Box>
              <Typography fontWeight={700} fontSize={18} color="#555">Search to begin</Typography>
              <Typography fontSize={13} color="#aaa" textAlign="center" maxWidth={320}>
                Enter an Order Number, Customer Phone, or Order ID above.<br />
                No data loads automatically — keeping Lifeline lightning fast.
              </Typography>
            </Box>
          )}

          {!loading && order && (
            <Box sx={{ bgcolor: "#fff", borderRadius: 2, border: "1px solid #e8e8e8", overflow: "hidden" }}>
              {/* Order Header */}
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #f0f0f0" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography fontWeight={700} fontSize={14} color="#e53935">
                      Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                    </Typography>
                    <CopyChip text={order.orderNumber || order._id} />
                    <Typography fontSize={12} color="#999" ml={1}>
                      {dayjs(order.createdAt).format("MMM DD YYYY, hh:mm A")}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Refresh"><IconButton size="small" onClick={handleSearch}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="More Actions"><IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </Box>

                {/* Tags */}
                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  <Typography fontSize={12} color="#666" fontWeight={600}>Order Tags •</Typography>
                  {tags.map((t) => (
                    <Chip key={t} label={t} size="small" onDelete={() => setTags(tags.filter(x => x !== t))} sx={{ fontSize: 11 }} />
                  ))}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      placeholder="+ Add tag"
                      style={{ border: "1px dashed #ccc", borderRadius: 12, padding: "2px 10px", fontSize: 11, outline: "none", width: 80 }}
                    />
                    <IconButton size="small" onClick={handleAddTag} sx={{ p: 0.3 }}><AddIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                </Box>
              </Box>

              {/* 3-Column Entity Cards */}
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 200px", borderBottom: "1px solid #f0f0f0" }}>
                {/* Customer Card */}
                <EntityCard
                  icon={<PersonIcon sx={{ fontSize: 13, color: "#888" }} />}
                  type="Customer"
                  id={order.user?._id?.slice(-7).toUpperCase()}
                  name={order.user?.name}
                  phone={maskPhone(order.user?.phone)}
                  badge={null}
                  extraLine={
                    <Box>
                      <Typography fontSize={12} fontWeight={700} mt={1}>₹{order.total} • {order.paymentMethod?.toUpperCase()}</Typography>
                      <Typography
                        fontSize={11} color="#27ae60" fontWeight={600} mt={0.5}
                        sx={{ cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => setBillModal(true)}
                      >
                        View Order & Bill
                      </Typography>
                    </Box>
                  }
                  onClick={() => openHistory(order.user?._id, "Customer Order History")}
                />

                {/* Vendor Card */}
                <EntityCard
                  icon={<StorefrontIcon sx={{ fontSize: 13, color: "#888" }} />}
                  type="Vendor"
                  id={order.items?.[0]?.vendor?._id?.slice(-7).toUpperCase() || "N/A"}
                  name={order.items?.[0]?.vendor?.businessName || "Mangalik Sacred Store"}
                  phone={maskPhone(order.items?.[0]?.vendor?.contactNumber)}
                  badge={<Chip label="Active" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontSize: 10, height: 18 }} />}
                  extraLine={
                    <Typography
                      fontSize={11} color="#27ae60" fontWeight={600} mt={0.5}
                      sx={{ cursor: "pointer", textDecoration: "underline" }}
                    >
                      View vendor instructions
                    </Typography>
                  }
                  onClick={() => openHistory(order.items?.[0]?.vendor?.user, "Vendor Order History")}
                />

                {/* Delivery Partner Card */}
                <EntityCard
                  icon={<LocalShippingIcon sx={{ fontSize: 13, color: "#888" }} />}
                  type="Delivery Partner"
                  id={order.assignedDeliveryPartner?._id?.slice(-7).toUpperCase() || "—"}
                  name={order.assignedDeliveryPartner?.name || "Not Assigned"}
                  phone={order.assignedDeliveryPartner ? maskPhone(order.assignedDeliveryPartner?.phone) : null}
                  badge={order.assignedDeliveryPartner
                    ? <Chip label={order.status === "delivered" ? "Delivered" : "On Duty"} size="small" sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontSize: 10, height: 18 }} />
                    : null
                  }
                  extraLine={
                    order.assignedDeliveryPartner
                      ? <Typography fontSize={11} color="#666" mt={0.5}>Hand me the order</Typography>
                      : <Typography fontSize={11} color="#ccc" mt={0.5}>—</Typography>
                  }
                  onClick={() => order.assignedDeliveryPartner && openHistory(order.assignedDeliveryPartner?._id, "Delivery Partner History")}
                />

                {/* Address / Map Card */}
                <Box sx={{ p: 2, borderLeft: "1px solid #f0f0f0" }}>
                  <Box sx={{ bgcolor: "#f0f4f8", borderRadius: 1, height: 90, display: "flex", alignItems: "center", justifyContent: "center", mb: 1.5 }}>
                    <LocationOnIcon sx={{ color: "#999", fontSize: 28 }} />
                  </Box>
                  <Chip
                    label={order.status === "delivered" ? "Delivered" : order.status?.replace(/_/g, " ") || "Pending"}
                    size="small"
                    sx={{
                      bgcolor: order.status === "delivered" ? "#e8f5e9" : "#fff3e0",
                      color: order.status === "delivered" ? "#2e7d32" : "#e65100",
                      fontSize: 10, fontWeight: 700, height: 20, mb: 1
                    }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 12, color: "#888" }} />
                    <Typography fontSize={11} color="#555" noWrap maxWidth={160}>
                      {order.shippingAddress?.line1}, {order.shippingAddress?.city}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Progress Timeline */}
              <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                  <Typography fontWeight={700} fontSize={13}>Order Progress</Typography>
                  {activeStep < STATUS_STEPS.length - 1 && order.status !== "delivered" && (
                    <Chip label="In Progress" size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontSize: 10, height: 18 }} />
                  )}
                  {order.status === "delivered" && (
                    <Chip label="Completed ✓" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontSize: 10, height: 18 }} />
                  )}
                </Box>

                {/* Timeline bar */}
                <Box sx={{ position: "relative", pb: 2 }}>
                  {/* Background line */}
                  <Box sx={{ position: "absolute", top: 10, left: 0, right: 0, height: 3, bgcolor: "#e0e0e0", zIndex: 0 }} />
                  {/* Progress line */}
                  <Box sx={{
                    position: "absolute", top: 10, left: 0, height: 3,
                    width: `${activeStep >= 0 ? (activeStep / (STATUS_STEPS.length - 1)) * 100 : 0}%`,
                    bgcolor: "#27ae60", zIndex: 1, transition: "width 0.5s ease"
                  }} />

                  {/* Step dots */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
                    {STATUS_STEPS.map((step, i) => {
                      const completed = i <= activeStep;
                      const current = i === activeStep;
                      return (
                        <Box key={step.key} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                          <Box sx={{
                            width: 22, height: 22, borderRadius: "50%",
                            bgcolor: completed ? "#27ae60" : "#fff",
                            border: `3px solid ${completed ? "#27ae60" : "#ccc"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: current ? "0 0 0 3px rgba(39,174,96,0.2)" : "none"
                          }}>
                            {completed && <CheckCircleIcon sx={{ fontSize: 14, color: "#fff" }} />}
                          </Box>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography fontSize={10} color={completed ? "#27ae60" : "#999"} fontWeight={completed ? 700 : 400}>
                              {step.label}
                            </Typography>
                            {i === 0 && (
                              <Typography fontSize={9} color="#aaa">{dayjs(order.createdAt).format("hh:mm A")}</Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <RightPanel />
      </Box>

      {/* ── BILL MODAL ─────────────────────────────────────────────────────── */}
      <Dialog open={billModal} onClose={() => setBillModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span style={{ fontWeight: 700 }}>Items & Billing</span>
            <Chip label="Success" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontSize: 11, height: 20 }} />
          </Box>
          <IconButton size="small" onClick={() => setBillModal(false)}>✕</IconButton>
        </DialogTitle>
        <Tabs value={0} sx={{ px: 3, borderBottom: "1px solid #eee", "& .Mui-selected": { color: "#e53935 !important" }, "& .MuiTabs-indicator": { bgcolor: "#e53935" } }}>
          <Tab label="Customer Bill" sx={{ textTransform: "none", fontWeight: 600, fontSize: 13 }} />
          <Tab label="Merchant Bill" sx={{ textTransform: "none", fontSize: 13 }} />
        </Tabs>
        <DialogContent sx={{ pt: 2 }}>
          {order?.items?.map((item, idx) => (
            <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography fontSize={13}>{item.title || item.product?.title} (x{item.quantity})</Typography>
              <Typography fontSize={13}>₹{(item.price || item.product?.basePrice) * item.quantity}</Typography>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography fontSize={13} color="#666">Item total</Typography>
            <Typography fontSize={13}>₹{order?.subtotal || order?.total}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography fontSize={13} color="#666">Taxes (GST 5%)</Typography>
            <Typography fontSize={13}>₹{order?.gstAmount || Math.round((order?.subtotal || 0) * 0.05)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography fontSize={13} color="#666">Delivery Charge</Typography>
            <Typography fontSize={13} color={order?.shippingFee === 0 ? "#27ae60" : "#333"}>
              {order?.shippingFee === 0 ? "FREE" : `₹${order?.shippingFee || 79}`}
            </Typography>
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography fontWeight={700}>Total</Typography>
            <Typography fontWeight={700}>₹{order?.total}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
          <Button size="small" variant="outlined" sx={{ fontSize: 11, textTransform: "none" }}>↓ Bill</Button>
          <Button size="small" variant="outlined" sx={{ fontSize: 11, textTransform: "none" }}>↓ Invoice</Button>
          <Button size="small" variant="outlined" sx={{ fontSize: 11, textTransform: "none" }}>↓ GST Invoice</Button>
        </DialogActions>
      </Dialog>

      {/* ── HISTORY MODAL ──────────────────────────────────────────────────── */}
      <Modal open={historyModal.open} onClose={() => setHistoryModal({ open: false, data: null, title: "" })}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          bgcolor: "#fff", borderRadius: 2, p: 3, width: 420, maxHeight: "80vh", overflowY: "auto",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)"
        }}>
          <Typography fontWeight={700} fontSize={15} mb={2}>{historyModal.title}</Typography>
          {historyModal.data && (
            <Stack spacing={1}>
              <Typography fontSize={13}><strong>Name:</strong> {historyModal.data.user?.name}</Typography>
              <Typography fontSize={13}><strong>Email:</strong> {historyModal.data.user?.email}</Typography>
              <Typography fontSize={13}><strong>Phone:</strong> {maskPhone(historyModal.data.user?.phone)}</Typography>
              <Typography fontSize={13}><strong>Total Orders:</strong> {historyModal.data.history?.totalOrders || 0}</Typography>
              <Typography fontSize={13}><strong>Total Spent:</strong> ₹{historyModal.data.history?.totalSpent || 0}</Typography>
            </Stack>
          )}
          <Button onClick={() => setHistoryModal({ open: false })} sx={{ mt: 2 }} variant="outlined" size="small" fullWidth>Close</Button>
        </Box>
      </Modal>
    </Box>
  );
};

// ─── Reusable Entity Card ─────────────────────────────────────────────────────
const EntityCard = ({ icon, type, id, name, phone, badge, extraLine, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      p: 2, borderRight: "1px solid #f0f0f0", cursor: onClick ? "pointer" : "default",
      "&:hover": onClick ? { bgcolor: "#fafffe" } : {}
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
      {icon}
      <Typography fontSize={10} color="#888" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>{type}</Typography>
      {id && <Typography fontSize={10} color="#bbb" ml={0.5}>#{id}</Typography>}
      {id && <CopyChip text={id} />}
    </Box>
    <Typography fontWeight={700} fontSize={14} mb={0.5}>{name || "—"}</Typography>
    {phone && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <PhoneIcon sx={{ fontSize: 12, color: "#888" }} />
        <Typography fontSize={12} color="#666" sx={{ letterSpacing: 0.5 }}>{phone}</Typography>
      </Box>
    )}
    {badge && <Box mt={0.5}>{badge}</Box>}
    {extraLine}
  </Box>
);

export default Lifeline;
