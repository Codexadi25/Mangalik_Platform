import React, { useState, useRef, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Chip, IconButton, Tooltip, Divider,
  CircularProgress, Stack, Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, Tab, Tabs, Paper, Modal, Menu, MenuItem,
  FormControl, InputLabel, Select, Checkbox, FormControlLabel, Alert
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
import { useSelector } from "react-redux";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import api from "../../services/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import InteractiveMap from "./components/InteractiveMap";
import EntityCard, { CopyChip } from "./components/EntityCard";
import AddressUpdateDialog from "./components/AddressUpdateDialog";
import OrderDocumentsDialog from "./components/OrderDocumentsDialog";
import CommentsDialog from "./components/CommentsDialog";
import TagLogsDialog from "./components/TagLogsDialog";
import DeliveryPartnerDialog from "./components/DeliveryPartnerDialog";

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
  { label: "Create Replacement", icon: "🔄" },
  { label: "Cancel Order", icon: "❌" },
  { label: "Waive Delivery Charge", icon: "🎁" },
  { label: "Contact Customer (Masked)", icon: "📞" },
  { label: "Escalate to Manager", icon: "⬆️" },
  { label: "Generate Invoice", icon: "🧾" },
  { label: "View Complaints / Tickets", icon: "🎫" },
];

const MANUAL_TAGS = [
  "Wrong Order",
  "Wrong Item",
  "Valet not Responding",
  "Unsafe Area",
  "Suspected Fake Order",
  "Unable to Mark Deliver",
  "Poor Quality",
  "FSSAI",
  "Partial Delivery",
  "Promo",
  "SME",
  "Order for Someone Else",
  "DP Behaviour",
  "Incomplete Cx Address",
  "GST Bill",
  "Billing",
  "Customer Unresponsive",
  "DP Abused Cx"
];

const SYSTEM_TAGS = [
  "LLCancelation",
  "Refunded",
  "PG Failed",
  "Valet not Assigned",
  "Wrong Address",
  "Replacement",
  "Order Snatched by Stranger",
  "Incomplete Cx Address"
];

// ─── Progress timeline steps ─────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const getStepIndex = (status) => STATUS_STEPS.findIndex((s) => s.key === status);

// ─── Masked phone display ────────────────────────────────────────────────────
const maskPhone = (phone) => (phone ? `XXXXX${phone.slice(-5)}` : "N/A");



// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
const Lifeline = () => {
  const currentUser = useSelector((state) => state.auth?.user);
  const [searchType, setSearchType] = useState("orderNumber");
  const [searchValue, setSearchValue] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rightTab, setRightTab] = useState(0); // 0 = Report An Issue, 1 = Quick Actions
  const [activeIssue, setActiveIssue] = useState(null);
  const [actionSearch, setActionSearch] = useState("");
  const [comment, setComment] = useState("");
  const [billModal, setBillModal] = useState(false);
  const [activeBillTab, setActiveBillTab] = useState(0);
  const [historyModal, setHistoryModal] = useState({ open: false, data: null, title: "" });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [tagLogsModalOpen, setTagLogsModalOpen] = useState(false);
  const [deliveryPartnerModalOpen, setDeliveryPartnerModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [selectedAddressBookIdx, setSelectedAddressBookIdx] = useState("");
  const [manualAddressForm, setManualAddressForm] = useState({ fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" });
  const [saveToBook, setSaveToBook] = useState(false);
  const [gpsCountdown, setGpsCountdown] = useState(0);
  const [orderComments, setOrderComments] = useState([]);
  const [tagLogs, setTagLogs] = useState([]);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [customerPin, setCustomerPin] = useState({ x: 200, y: 50 });
  const [vendorPin] = useState({ x: 50, y: 120 });
  const [mapSessionTime, setMapSessionTime] = useState(30);
  const [mapActive, setMapActive] = useState(true);
  const [mapFullScreen, setMapFullScreen] = useState(false);
  const [businessSettings, setBusinessSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/business-settings/public");
        if (data.data) {
          setBusinessSettings(data.data);
        }
      } catch (err) {
        console.error("Failed to load business settings", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    let gpsTimer;
    if (gpsCountdown > 0) {
      gpsTimer = setTimeout(() => setGpsCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(gpsTimer);
  }, [gpsCountdown]);

  const openAddressModal = async () => {
    if (!order) return;
    setAddressModalOpen(true);
    setManualAddressForm({
      fullName: order.shippingAddress?.fullName || "",
      phone: order.shippingAddress?.phone || "",
      line1: order.shippingAddress?.line1 || "",
      city: order.shippingAddress?.city || "",
      state: order.shippingAddress?.state || "",
      pincode: order.shippingAddress?.pincode || ""
    });
    try {
      const { data } = await api.get(`/users/${order.user?._id || order.user}`);
      if (data.data && data.data.addresses) {
        setCustomerAddresses(data.data.addresses);
      }
    } catch (err) {
      console.error("Failed to load user addresses", err);
    }
  };

  const handleUpdateAddress = async (addressData, saveToAddressBook = false) => {
    try {
      const { data } = await api.patch(`/orders/${order._id}`, {
        shippingAddress: addressData,
        saveToAddressBook
      });
      if (data.data) {
        setOrder(data.data);
        toast.success("Delivery address updated successfully!");
        setAddressModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to update delivery address.");
    }
  };

  useEffect(() => {
    let timer;
    if (mapActive && mapSessionTime > 0) {
      timer = setInterval(() => {
        setMapSessionTime((prev) => {
          if (prev <= 1) {
            setMapActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mapActive, mapSessionTime]);

  const handleReloadMap = () => {
    setMapSessionTime(30);
    setMapActive(true);
  };
  const searchInputRef = useRef(null);

  // Advanced search pagination states
  const [ordersList, setOrdersList] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const [vendorSales, setVendorSales] = useState(0);

  // Sync mock data when order changes
  useEffect(() => {
    if (order) {
      const realComments = [];
      if (order.notes) {
        order.notes.split("\n").forEach((noteLine, index) => {
          if (noteLine.trim()) {
            realComments.push({
              text: noteLine.trim(),
              author: "Agent / Customer Notes",
              date: dayjs(order.createdAt).add(index * 2, "minute").format("DD MMM'YY hh:mm A")
            });
          }
        });
      }
      if (order.statusHistory) {
        order.statusHistory.forEach(h => {
          if (h.note) {
            realComments.push({
              text: h.note,
              author: h.changedBy?.name || h.changedBy?.email || "System / Staff",
              date: dayjs(h.at).format("DD MMM'YY hh:mm A")
            });
          }
        });
      }

      if (realComments.length === 0) {
        realComments.push({
          text: `Processing order items: ${order.items?.map(i => i.title || i.product?.title).join(", ")}`,
          author: "System Log",
          date: dayjs(order.createdAt).format("DD MMM'YY hh:mm A")
        });
      }
      setOrderComments(realComments);

      const initialLogs = (order.tags || []).map((t, idx) => ({
        id: `log-${idx}`,
        tag: t,
        details: {
          action: "submit",
          action_type: "refunded",
          delay_in_mins: 35,
          kpt_delay_in_mins: 21,
          delight_promo: "96",
          karma: "Silver"
        },
        addedBy: "Aditya Sahu",
        email: "Aditya.Sahu@startek.com",
        date: dayjs(order.createdAt).add(20, "minute").format("MMM DD YYYY, hh:mm A"),
        role: "LIFELINE_CD_AGENT"
      }));
      setTagLogs(initialLogs);
    }
  }, [order]);

  // Fetch vendor sales dynamically when active order changes
  useEffect(() => {
    const fetchVendorSales = async () => {
      const vendorUser = order?.items?.[0]?.vendor?.user;
      if (vendorUser) {
        try {
          const { data } = await api.get(`/users/${vendorUser}/history`);
          setVendorSales(data.data.history?.netSales || 0);
        } catch {
          setVendorSales(0);
        }
      } else {
        setVendorSales(0);
      }
    };
    fetchVendorSales();
  }, [order]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchValue.trim()) return;
    setLoading(true);
    setOrder(null);
    setOrdersList([]);
    setHasMore(false);
    setSkip(0);
    setActiveIssue(null);
    try {
      const limitVal = searchType === "customerId" ? 3 : 20;
      const { data } = await api.get(`/orders/lifeline/search?query=${encodeURIComponent(searchValue.trim())}&type=${searchType}&limit=${limitVal}&skip=0`);
      if (data.data?.length > 0) {
        setOrdersList(data.data);
        setOrder(data.data[0]);
        setTags(data.data[0].tags || []);
        setHasMore(data.hasMore || false);
        setSkip(data.data.length);
      } else {
        toast.warning("No order found matching your search.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to search orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      const nextSkip = skip;
      const limitVal = 3;
      const { data } = await api.get(`/orders/lifeline/search?query=${encodeURIComponent(searchValue.trim())}&type=${searchType}&limit=${limitVal}&skip=${nextSkip}`);
      if (data.data?.length > 0) {
        setOrdersList((prev) => [...prev, ...data.data]);
        setSkip(nextSkip + data.data.length);
        setHasMore(data.hasMore || false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load more orders.");
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

  const handleAddTag = async () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTag = tagInput.trim();
      try {
        const updatedTags = [...tags, newTag];
        const { data } = await api.patch(`/orders/${order._id}`, { tags: updatedTags });
        if (data.data) {
          setOrder(data.data);
          setTags(data.data.tags || []);
          setTagLogs((prev) => [
            ...prev,
            {
              id: `log-${Date.now()}`,
              tag: newTag,
              details: {
                action: "submit",
                action_type: "manual_tag",
                added_at: new Date().toISOString()
              },
              addedBy: currentUser?.name || "Aditya Sahu",
              email: currentUser?.email || "Aditya.Sahu@startek.com",
              date: dayjs().format("MMM DD YYYY, hh:mm A"),
              role: "LIFELINE_CD_AGENT"
            }
          ]);
          toast.success(`Custom tag "${newTag}" added.`);
        }
      } catch (err) {
        toast.error("Failed to add custom tag.");
      }
      setTagInput("");
    }
  };

  const handleAddTagSelect = async (newTag) => {
    if (!order || !newTag || tags.includes(newTag)) return;
    try {
      let updatedStatus = order.status;
      if (newTag === "Unable to Mark Deliver") {
        updatedStatus = "delivered";
        toast.info("Action matched: Marking order as DELIVERED.");
      } else if (newTag === "FSSAI") {
        toast.warning("FSSAI Alert: Notification created for compliance queue.");
      } else if (newTag === "SME") {
        toast.error("SME Alert: Priority subject matter expert review requested.");
      } else if (newTag === "DP Abused Cx") {
        toast.error("⚠️ CRITICAL ALERT: Delivery Partner Abused Customer!");
      }

      const updatedTags = [...tags, newTag];
      const payload = { tags: updatedTags };
      if (updatedStatus !== order.status) {
        payload.status = updatedStatus;
      }

      const { data } = await api.patch(`/orders/${order._id}`, payload);
      if (data.data) {
        setOrder(data.data);
        setTags(data.data.tags || []);
        setTagLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}`,
            tag: newTag,
            details: {
              action: "manual_selection",
              action_type: newTag === "Unable to Mark Deliver" ? "status_change_delivered" : "log_only",
              triggered_at: new Date().toISOString()
            },
            addedBy: currentUser?.name || "Aditya Sahu",
            email: currentUser?.email || "Aditya.Sahu@startek.com",
            date: dayjs().format("MMM DD YYYY, hh:mm A"),
            role: "LIFELINE_CD_AGENT"
          }
        ]);
        toast.success(`Tag "${newTag}" added successfully.`);
      }
    } catch (err) {
      toast.error("Failed to add tag.");
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      const newCommentText = comment.trim();
      const updatedNotes = order.notes ? `${order.notes}\n${newCommentText}` : newCommentText;
      const { data } = await api.patch(`/orders/${order._id}`, { notes: updatedNotes });
      if (data.data) {
        setOrder(data.data);
        toast.success("Comment added and saved to database.");
      }
      setComment("");
    } catch (err) {
      toast.error("Failed to save comment.");
    }
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
        if (data.data) {
          const isStockIssue = reason.toLowerCase().includes("stock") || reason.toLowerCase().includes("out of stock");
          const isStrangerSnatched = reason.toLowerCase().includes("stranger") || reason.toLowerCase().includes("snatched");
          const cancelTag = isStockIssue
            ? "Item Out of Stock"
            : isStrangerSnatched
              ? "Order Snatched by Stranger"
              : "LLCancelation";

          const updatedTags = [...(data.data.tags || []), cancelTag];
          const patchRes = await api.patch(`/orders/${order._id}`, { tags: updatedTags });
          if (patchRes.data.data) setOrder(patchRes.data.data);
        }
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

        const isSlightChange = Math.abs(newAddressLine1.length - (order.shippingAddress?.line1 || "").length) < 6;
        const addressTag = isSlightChange ? "Incomplete Cx Address" : "Wrong Address";
        const updatedTags = [...(order.tags || []), addressTag];

        const { data } = await api.patch(`/orders/${order._id}`, { shippingAddress: updatedAddress, tags: updatedTags });
        if (data.data) setOrder(data.data);
        toast.success(`Shipping address updated. Tagged "${addressTag}".`);
      } catch (err) {
        toast.error("Address update failed.");
      }
      return;
    }

    if (action === "Assign Delivery Partner") {
      setDeliveryPartnerModalOpen(true);
      return;
    }

    if (action === "Issue Full Refund") {
      if (window.confirm("Confirm issuing full refund for this order?")) {
        try {
          const updatedTags = [...(order.tags || []), "Refunded"];
          const { data } = await api.patch(`/orders/${order._id}`, { paymentStatus: "refunded", tags: updatedTags });
          if (data.data) setOrder(data.data);
          toast.success("Full refund processed successfully. Tagged \"Refunded\".");
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
        const updatedTags = [...(order.tags || []), "Refunded"];
        const { data } = await api.patch(`/orders/${order._id}`, { paymentStatus: "partially_refunded", tags: updatedTags });
        if (data.data) setOrder(data.data);
        toast.success(`Partial refund of ₹${amt} registered. Tagged "Refunded".`);
      } catch (err) {
        toast.error("Partial refund failed.");
      }
      return;
    }

    if (action === "Create Replacement") {
      const itemsText = window.prompt("Enter item titles or IDs to replace (separated by commas):");
      if (!itemsText) return;
      try {
        const updatedTags = [...(order.tags || []), "Replacement"];
        const { data } = await api.patch(`/orders/${order._id}`, { tags: updatedTags });
        if (data.data) setOrder(data.data);
        toast.success(`Replacement created for: ${itemsText}. Tagged "Replacement".`);
      } catch (err) {
        toast.error("Replacement failed.");
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

  const handleAssignDeliveryPartnerSubmit = async (details) => {
    try {
      const { data } = await api.put(`/orders/${order._id}/status`, {
        status: "packed",
        ...details
      });
      if (data.data) setOrder(data.data);
      toast.success(`Delivery partner details assigned: ${details.deliveryPartnerName}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign partner.");
    }
  };

  const isCancelled = order?.status === "cancelled";
  let currentSteps = [...STATUS_STEPS];
  let activeStep = order ? getStepIndex(order.status) : -1;

  if (isCancelled && order) {
    const orderHistory = order.statusHistory || [];
    const nonCancelledHistory = orderHistory.filter(h => h.status !== "cancelled");
    const lastActiveStatus = nonCancelledHistory.length > 0 ? nonCancelledHistory[nonCancelledHistory.length - 1].status : "placed";
    const lastActiveIdx = getStepIndex(lastActiveStatus);
    const preservedSteps = STATUS_STEPS.slice(0, lastActiveIdx >= 0 ? lastActiveIdx + 1 : 1);
    currentSteps = [...preservedSteps, { key: "cancelled", label: "Cancelled" }];
    activeStep = currentSteps.length - 1;
  }
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
          onChange={(e) => {
            setSearchType(e.target.value);
            setSearchValue("");
          }}
          style={{
            border: "1px solid #ddd", borderRadius: 6, padding: "7px 12px",
            fontSize: 13, color: "#333", background: "#fafafa", cursor: "pointer", outline: "none"
          }}
        >
          <option value="orderNumber">Order Number</option>
          <option value="phone">Customer Phone</option>
          <option value="orderId">Order ID</option>
          <option value="email">Customer Email</option>
          <option value="customerId">Customer ID</option>
          <option value="vendorId">Vendor ID</option>
          <option value="deliveryPhone">Delivery Partner Number</option>
        </select>

        {/* Search Input */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", gap: 8, maxWidth: 700 }}>
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={
              searchType === "orderNumber" ? "Enter Order Number..." :
                searchType === "phone" ? "Enter Customer Phone..." :
                  searchType === "orderId" ? "Enter Order ID..." :
                    searchType === "customerId" ? "Enter Customer ID..." :
                      searchType === "vendorId" ? "Enter Vendor ID..." :
                        searchType === "deliveryPhone" ? "Enter Delivery Partner Phone..." :
                          "Search..."
            }
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 3.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer", color: "#555", "&:hover": { color: "#e53935" } }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} />
            <Typography fontSize={12} fontWeight={600}>Chat History</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer", color: "#555", "&:hover": { color: "#e53935" } }}>
            <PhoneIcon sx={{ fontSize: 16 }} />
            <Typography fontSize={12} fontWeight={600}>Call Logs</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer", color: "#555", "&:hover": { color: "#e53935" } }}>
            <HelpOutlineIcon sx={{ fontSize: 16 }} />
            <Typography fontSize={12} fontWeight={600}>Help</Typography>
          </Box>
          <IconButton size="small" onClick={handleSearch} sx={{ color: "#555", "&:hover": { color: "#e53935" } }}>
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: "#555" }}>
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1, borderLeft: "1px solid #eee", pl: 2 }}>
            <Avatar sx={{ width: 30, height: 30, bgcolor: "#e3f2fd", color: "#1565c0", fontSize: 12, fontWeight: 700 }}>
              {currentUser?.name?.charAt(0).toUpperCase() || "A"}
            </Avatar>
            <Typography fontSize={13} fontWeight={600} color="#333" sx={{ whiteSpace: "nowrap" }}>
              {currentUser?.name || "Aditya Sa..."}
            </Typography>
          </Box>
        </Box>
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
            <Box>
              {/* Horizontal List of Matched Orders */}
              {(ordersList.length > 1 || searchType === "customerId" || searchType === "vendorId") && (
                <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, p: 2, bgcolor: "#fdfdfd", borderRadius: 2, border: "1px dashed #ccc" }}>
                  <Typography fontSize={13} fontWeight={700} color="#555">Matched Orders:</Typography>
                  {ordersList.map((o) => {
                    const isActive = order?._id === o._id;
                    return (
                      <Paper
                        key={o._id}
                        elevation={isActive ? 2 : 0}
                        onClick={() => {
                          setOrder(o);
                          setTags(o.tags || []);
                        }}
                        style={{
                          padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
                          border: `1px solid ${isActive ? "#e53935" : "#e0e0e0"}`,
                          background: isActive ? "#ffebee" : "#fff",
                          display: "flex", flexDirection: "column", gap: "2px"
                        }}
                      >
                        <Typography fontSize={12} fontWeight={700} color={isActive ? "#e53935" : "#333"}>
                          Order #{o.orderNumber || o._id?.slice(-8).toUpperCase()}
                        </Typography>
                        <Typography fontSize={10} color="#888">
                          {dayjs(o.createdAt).format("MMM DD, YYYY")} • ₹{o.total}
                        </Typography>
                      </Paper>
                    );
                  })}
                  {hasMore && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={handleLoadMore}
                      sx={{ textTransform: "none", fontSize: 11, borderRadius: 1.5, px: 2, py: 0.8 }}
                    >
                      Load More
                    </Button>
                  )}
                </Box>
              )}

              <Box sx={{ bgcolor: "#fff", borderRadius: 2, border: "1px solid #e8e8e8", overflow: "hidden" }}>
                {/* Order Header */}
                <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #f0f0f0" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {tags.includes("DP Abused Cx") && (
                        <Tooltip title="CRITICAL: Delivery Partner Abused Customer!">
                          <span style={{ fontSize: 18, color: "#e53935", cursor: "help" }}>⚠️</span>
                        </Tooltip>
                      )}
                      <Typography fontWeight={700} fontSize={14} color="#e53935">
                        Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                      </Typography>
                      <CopyChip text={order.orderNumber || order._id} />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setBillModal(true)}
                        sx={{
                          borderColor: "#ff4e3a", color: "#ff4e3a", borderRadius: "20px", px: 1.5, py: 0.2,
                          textTransform: "none", fontSize: 11, fontWeight: 600, ml: 1,
                          "&:hover": { borderColor: "#d83a28", bgcolor: "#fff5f4" }
                        }}
                      >
                        📄 View & Print Docs
                      </Button>
                      <Typography fontSize={12} color="#999" ml={1}>
                        {dayjs(order.createdAt).format("MMM DD YYYY, hh:mm A")}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Refresh"><IconButton size="small" onClick={handleSearch}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton size="small" onClick={handleMenuOpen}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      PaperProps={{
                        style: {
                          width: 720,
                          padding: "16px",
                        },
                      }}
                    >
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2.5 }}>
                        {/* Column 1 */}
                        <Stack spacing={1.5}>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.success("Delivery partner notified!"); }}>Notify Delivery Partner</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("No active promos for this customer."); }}>Customer's Promos</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info(`Phone: ${order.user?.phone || "N/A"}`); }}>Phone Number Details</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("Redirecting to XpressD panel..."); }}>View on Runnr</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("Opening support chat history..."); }}>TR chat history</Typography>
                        </Stack>
                        {/* Column 2 */}
                        <Stack spacing={1.5}>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.success("Order escalated to supervisor."); }}>Escalate Order</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("Opening email templates..."); }}>Email Escalations</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("Opening promo search tool..."); }}>Search Promo</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("Opening vendor chat logs..."); }}>O2 chat history</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("Opening rider chat logs..."); }}>Rider chat history</Typography>
                        </Stack>
                        {/* Column 3 */}
                        <Stack spacing={1.5}>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("Mangalik Credits balance: ₹0.00"); }}>Mangalik credits & gift cards</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("Searching linked duplicate accounts..."); }}>Linked Customers</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("No subscription history found."); }}>Gold Subscription History</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("Opening dining support chat history..."); }}>Dining chat history</Typography>
                          <Typography fontSize={13} sx={{ cursor: "pointer", "&:hover": { color: "#e53935" } }} onClick={() => { handleMenuClose(); toast.info("Opening customer-rider chat history..."); }}>Customer-Rider chat history</Typography>
                        </Stack>
                      </Box>
                    </Menu>
                  </Box>

                  {/* Comments / Transactions Tab Row */}
                  <Box sx={{ display: "flex", gap: 3, mt: 1.5, borderBottom: "1px solid #f0f0f0" }}>
                    <Typography
                      onClick={() => setCommentsModalOpen(true)}
                      sx={{
                        fontSize: 13, fontWeight: 700, pb: 1, cursor: "pointer",
                        color: "#666", "&:hover": { color: "#e53935" }
                      }}
                    >
                      Comments ({orderComments.length})
                    </Typography>
                    <Typography
                      onClick={() => setTxnModalOpen(true)}
                      sx={{
                        fontSize: 13, fontWeight: 700, pb: 1, cursor: "pointer",
                        color: "#666", "&:hover": { color: "#e53935" }
                      }}
                    >
                      Transactions
                    </Typography>
                  </Box>

                  {/* Tags */}
                  <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                    <Typography fontSize={12} color="#666" fontWeight={600}>Order Tags •</Typography>
                    {tags.map((t) => {
                      const logEntry = tagLogs.find(l => l.tag === t);
                      const isSystemTag = SYSTEM_TAGS.includes(t);
                      const isCreator = !logEntry || logEntry.email === currentUser?.email;
                      const canDelete = !isSystemTag && isCreator;

                      return (
                        <Chip
                          key={t}
                          label={t}
                          size="small"
                          onClick={() => { setSelectedTag(t); setTagLogsModalOpen(true); }}
                          onDelete={canDelete ? async () => {
                            const updatedTags = tags.filter(x => x !== t);
                            try {
                              const { data } = await api.patch(`/orders/${order._id}`, { tags: updatedTags });
                              if (data.data) {
                                setOrder(data.data);
                                setTags(data.data.tags || []);
                                setTagLogs(tagLogs.filter(x => x.tag !== t));
                                toast.info(`Tag "${t}" removed.`);
                              }
                            } catch {
                              toast.error("Failed to remove tag.");
                            }
                          } : undefined}
                          sx={{ fontSize: 11, cursor: "pointer" }}
                        />
                      );
                    })}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            handleAddTagSelect(val);
                            e.target.value = "";
                          }
                        }}
                        style={{ border: "1px solid #ccc", borderRadius: "12px", padding: "3px 10px", fontSize: 11, outline: "none", cursor: "pointer", background: "#fcfcfc" }}
                      >
                        <option value="">+ Add Action Tag</option>
                        {MANUAL_TAGS.map((t) => (
                          <option key={t} value={t} disabled={tags.includes(t)}>{t}</option>
                        ))}
                      </select>
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                        placeholder="Or custom tag..."
                        style={{ border: "1px dashed #ccc", borderRadius: 12, padding: "3px 10px", fontSize: 11, outline: "none", width: 90 }}
                      />
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
                      <Box mt={1}>
                        <Typography fontSize={11} color="#555">
                          <strong>Lifetime Sales:</strong> ₹{vendorSales}
                        </Typography>
                        {order.couponCode && (
                          <Typography fontSize={11} color="#e53935" mt={0.5}>
                            <strong>Promo Used:</strong> {order.couponCode} ({order.referredVendor?.businessName || "Platform"})
                          </Typography>
                        )}
                        <Typography
                          fontSize={11} color="#27ae60" fontWeight={600} mt={0.5}
                          sx={{ cursor: "pointer", textDecoration: "underline" }}
                        >
                          View vendor instructions
                        </Typography>
                      </Box>
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
                  <Box sx={{ p: 2, borderLeft: "1px solid #f0f0f0", flex: 1, minWidth: 200 }}>
                    <Box sx={{ position: "relative", mb: 1.5 }}>
                      <InteractiveMap
                        width="100%"
                        height={90}
                        zoom={mapZoom}
                        setZoom={setMapZoom}
                        pan={mapPan}
                        setPan={setMapPan}
                        customerPin={customerPin}
                        setCustomerPin={setCustomerPin}
                        vendorPin={vendorPin}
                        mapActive={mapActive}
                        mapSessionTime={mapSessionTime}
                        handleReloadMap={handleReloadMap}
                        onExpand={() => setMapFullScreen(true)}
                        order={order}
                        businessSettings={businessSettings}
                      />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Chip
                        label={order.status === "delivered" ? "Delivered" : order.status?.replace(/_/g, " ") || "Pending"}
                        size="small"
                        sx={{
                          bgcolor: order.status === "delivered" ? "#e8f5e9" : "#fff3e0",
                          color: order.status === "delivered" ? "#2e7d32" : "#e65100",
                          fontSize: 10, fontWeight: 700, height: 20
                        }}
                      />
                      <IconButton size="small" onClick={() => setMapFullScreen(true)} sx={{ color: "#e53935" }}>
                        <LocationOnIcon fontSize="small" />
                      </IconButton>
                    </Box>
                     <Box 
                       sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1, cursor: "pointer", "&:hover": { color: "#e53935", textDecoration: "underline" } }}
                       onClick={openAddressModal}
                     >
                       <LocationOnIcon sx={{ fontSize: 12, color: "#888" }} />
                       <Typography fontSize={11} color="inherit" noWrap maxWidth={160}>
                         {order.shippingAddress?.line1}, {order.shippingAddress?.city} ✏️
                       </Typography>
                     </Box>
                  </Box>
                </Box>

                {/* Progress Timeline */}
                <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
                    <Typography fontWeight={700} fontSize={13}>Order Progress</Typography>
                    {order.status === "cancelled" ? (
                      <Chip label="Cancelled ✖" size="small" sx={{ bgcolor: "#ffebee", color: "#d32f2f", fontSize: 10, height: 18, fontWeight: 700 }} />
                    ) : (
                      <>
                        {activeStep < STATUS_STEPS.length - 1 && order.status !== "delivered" && (
                          <Chip label="In Progress" size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontSize: 10, height: 18 }} />
                        )}
                        {order.status === "delivered" && (
                          <Chip label="Completed ✓" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontSize: 10, height: 18 }} />
                        )}
                      </>
                    )}
                  </Box>

                  {/* Timeline bar */}
                  <Box sx={{ position: "relative", pb: 2 }}>
                    {/* Background line */}
                    <Box sx={{ position: "absolute", top: 10, left: 0, right: 0, height: 3, bgcolor: "#e0e0e0", zIndex: 0 }} />
                    {/* Progress line */}
                    <Box sx={{
                      position: "absolute", top: 10, left: 0, height: 3,
                      width: `${activeStep >= 0 ? (activeStep / (currentSteps.length - 1)) * 100 : 0}%`,
                      bgcolor: isCancelled ? "#e53935" : "#27ae60", zIndex: 1, transition: "width 0.5s ease"
                    }} />

                    {/* Step dots */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
                      {currentSteps.map((step, i) => {
                        const completed = i <= activeStep;
                        const current = i === activeStep;
                        const isCancelledStep = step.key === "cancelled";
                        const t = (() => {
                          if (!order) return null;
                          if (step.key === "placed") {
                            const hist = order.statusHistory?.find(h => h.status === "placed" || h.status === "pending");
                            return hist ? hist.at : order.createdAt;
                          }
                          const hist = order.statusHistory?.find(h => h.status === step.key);
                          return hist ? hist.at : null;
                        })();
                        const formattedTime = t ? dayjs(t).format("hh:mm A") : "—";

                        return (
                          <Box key={step.key} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                            <Box sx={{
                              width: 22, height: 22, borderRadius: "50%",
                              bgcolor: isCancelledStep ? "#e53935" : (completed ? "#27ae60" : "#fff"),
                              border: `3px solid ${isCancelledStep ? "#e53935" : (completed ? "#27ae60" : "#ccc")}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              boxShadow: current ? `0 0 0 3px ${isCancelled ? "rgba(229,57,53,0.2)" : "rgba(39,174,96,0.2)"}` : "none"
                            }}>
                              {isCancelledStep ? (
                                <span style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>✕</span>
                              ) : (
                                completed && <CheckCircleIcon sx={{ fontSize: 14, color: "#fff" }} />
                              )}
                            </Box>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography fontSize={10} color={isCancelledStep ? "#e53935" : (completed ? "#27ae60" : "#999")} fontWeight={completed ? 700 : 400}>
                                {step.label} {isCancelledStep && order.rejectionReason && (
                                  <Tooltip title={`Reason: ${order.rejectionReason}`}>
                                    <span style={{ cursor: "pointer", marginLeft: 4 }}>ⓘ</span>
                                  </Tooltip>
                                )}
                              </Typography>
                              <Typography fontSize={9} color="#aaa">{formattedTime}</Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <RightPanel />
      </Box>

      <OrderDocumentsDialog
        open={billModal}
        onClose={() => setBillModal(false)}
        order={order}
        activeBillTab={activeBillTab}
        setActiveBillTab={setActiveBillTab}
        businessSettings={businessSettings}
      />

      {/* ── HISTORY MODAL ──────────────────────────────────────────────────── */}
      <Modal open={historyModal.open} onClose={() => setHistoryModal({ open: false, data: null, title: "" })}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          bgcolor: "#fff", borderRadius: 2, p: 3,
          width: (historyModal.title?.toLowerCase()?.includes("customer") || historyModal.title?.toLowerCase()?.includes("vendor")) ? 680 : 420,
          maxHeight: "80vh", overflowY: "auto",
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)"
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography fontWeight={700} fontSize={16}>{historyModal.title}</Typography>
              {historyModal.title?.toLowerCase()?.includes("customer") && (
                <Chip label="SILVER" size="small" sx={{ bgcolor: "#e0e0e0", color: "#666", fontWeight: "bold", fontSize: 10 }} />
              )}
            </Box>
            <IconButton size="small" onClick={() => setHistoryModal({ open: false, data: null, title: "" })}>✕</IconButton>
          </Box>

          {historyModal.data && historyModal.title?.toLowerCase()?.includes("vendor") && (
            <Box sx={{ border: "1px solid #f0f0f0", borderRadius: 2, p: 2, mb: 3, bgcolor: "#fafafa" }}>
              <Typography fontWeight={700} fontSize={15} textAlign="center" mb={2}>
                32 orders in last 30 days
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                {/* Left Column */}
                <Stack spacing={1.5}>
                  <Box>
                    <Typography fontSize={10} color="#888" fontWeight={700} textTransform="uppercase">Account Manager</Typography>
                    <Typography fontSize={12} color="#333" fontWeight={600}>karthik.md@mangalik.com</Typography>
                    <Typography fontSize={11} color="text.secondary">9449173798</Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={10} color="#888" fontWeight={700} textTransform="uppercase">Team Lead</Typography>
                    <Typography fontSize={12} color="#333" fontWeight={600}>gupta.tanishka@mangalik.com</Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={10} color="#888" fontWeight={700} textTransform="uppercase">FSSAI</Typography>
                    <Typography fontSize={12} color="#333" fontWeight={600}>Expires on 05 May, 2028</Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={10} color="#888" fontWeight={700} textTransform="uppercase">Last 10 orders</Typography>
                    <Typography fontSize={12} color="#333" fontWeight={600}>10 Delivered</Typography>
                  </Box>
                </Stack>

                {/* Right Column */}
                <Stack spacing={1.5}>
                  <Box>
                    <Typography fontSize={10} color="#888" fontWeight={700} textTransform="uppercase" mb={0.5}>Issue breakdown</Typography>
                    <Typography fontSize={12} color="#333">Poor Quality: 0/32 orders</Typography>
                    <Typography fontSize={12} color="#333">Missing Items: 0/32 orders</Typography>
                    <Typography fontSize={12} color="#333">Packaging & Spillage: 0/32 orders</Typography>
                    <Typography fontSize={12} color="#333">Wrong Order: 0/32 orders</Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={10} color="#888" fontWeight={700} textTransform="uppercase" mb={0.5}>Last 5 rejections (24 hours)</Typography>
                    <Typography fontSize={12} color="text.secondary">No rejections in the last 24 hours.</Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          )}

          {historyModal.data && historyModal.title?.toLowerCase()?.includes("customer") && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#f9f9f9", borderRadius: 2, p: 2, mb: 3, border: "1px solid #f0f0f0" }}>
              <Typography fontSize={11} color="text.secondary">Previous orders data (Last 4 months)</Typography>
              <Box sx={{ display: "flex", gap: 2.5 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography fontSize={16} fontWeight={700} color="#333">{historyModal.data.history?.totalOrders || 6}</Typography>
                  <Typography fontSize={9} color="text.secondary">Placed</Typography>
                </Box>
                <Box sx={{ textAlign: "center", borderLeft: "1px solid #ddd", pl: 2.5 }}>
                  <Typography fontSize={16} fontWeight={700} color="#333">{historyModal.data.history?.deliveredOrders || 6}</Typography>
                  <Typography fontSize={9} color="text.secondary">Delivered</Typography>
                </Box>
                <Box sx={{ textAlign: "center", borderLeft: "1px solid #ddd", pl: 2.5 }}>
                  <Typography fontSize={16} fontWeight={700} color="#333">{historyModal.data.history?.canceledOrders || 0}</Typography>
                  <Typography fontSize={9} color="text.secondary">Rejected</Typography>
                </Box>
                <Box sx={{ textAlign: "center", borderLeft: "1px solid #ddd", pl: 2.5 }}>
                  <Typography fontSize={16} fontWeight={700} color="#333">0</Typography>
                  <Typography fontSize={9} color="text.secondary">User Cancelled</Typography>
                </Box>
                <Box sx={{ textAlign: "center", borderLeft: "1px solid #ddd", pl: 2.5 }}>
                  <Typography fontSize={16} fontWeight={700} color="#2e7d32">0/10</Typography>
                  <Typography fontSize={9} color="#2e7d32">Refunded</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {historyModal.data && (
            <Stack spacing={1.5}>
              <Typography fontSize={13}><strong>Name:</strong> {historyModal.data.user?.name}</Typography>
              <Typography fontSize={13}><strong>Email:</strong> {historyModal.data.user?.email || "N/A"}</Typography>
              <Typography fontSize={13}><strong>Phone:</strong> {maskPhone(historyModal.data.user?.phone)}</Typography>
              <Typography fontSize={13}><strong>Role:</strong> {historyModal.data.user?.role?.toUpperCase()}</Typography>

              {historyModal.data.user?.role === "user" && (
                <>
                  <Typography fontSize={13}><strong>Total Orders:</strong> {historyModal.data.history?.totalOrders || 0}</Typography>
                  <Typography fontSize={13}><strong>Canceled Orders:</strong> {historyModal.data.history?.canceledOrders || 0}</Typography>
                  <Typography fontSize={13}><strong>Total Spent:</strong> ₹{historyModal.data.history?.totalSpent || 0}</Typography>
                  <Typography fontSize={13} color="primary" fontWeight={700}>
                    <strong>Net Margin (NM Value):</strong> ₹{historyModal.data.history?.netMargin || 0}
                  </Typography>
                </>
              )}

              {(historyModal.data.user?.role === "vendor" || historyModal.data.user?.vendorProfile) && (
                <>
                  <Typography fontSize={13}><strong>Total Orders:</strong> {historyModal.data.history?.vendorOrders || 0}</Typography>
                  <Typography fontSize={13}><strong>Net Sales:</strong> ₹{historyModal.data.history?.netSales || 0}</Typography>
                  <Typography fontSize={13}><strong>Net Commission (Platform Share):</strong> ₹{historyModal.data.history?.netCommission || 0}</Typography>
                  <Typography fontSize={13} color="success.main" fontWeight={700}>
                    <strong>Outstanding Payment (Vendor Share):</strong> ₹{historyModal.data.history?.outstandingPayment || 0}
                  </Typography>
                  <Typography fontSize={13} color="primary" fontWeight={700}>
                    <strong>Net Margin:</strong> ₹{historyModal.data.history?.netMargin || 0}
                  </Typography>
                </>
              )}

              {historyModal.data.user?.role === "deliveryPartner" && (
                <Typography fontSize={13}><strong>Delivered Orders:</strong> {historyModal.data.history?.deliveredOrders || 0}</Typography>
              )}
            </Stack>
          )}
          <Button onClick={() => setHistoryModal({ open: false })} sx={{ mt: 3 }} variant="outlined" size="small" fullWidth>Close</Button>
        </Box>
      </Modal>

      {/* ── TRANSACTION DETAILS MODAL ─────────────────────────────────────── */}
      <Dialog open={txnModalOpen} onClose={() => setTxnModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <span style={{ fontWeight: 700 }}>Transaction Details</span>
          <IconButton size="small" onClick={() => setTxnModalOpen(false)}>✕</IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* Table 1: Payments */}
          <Typography fontSize={13} fontWeight={700} color="#333" mb={1}>Payments</Typography>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", fontSize: "12px", border: "1px solid #eee" }}>
            <thead>
              <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Total Paid amount</th>
                <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Status</th>
                <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Txn. ref. ID</th>
                <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Payment mode(s)</th>
                <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const txns = [];
                if (order) {
                  if (order.transactions && order.transactions.length > 0) {
                    txns.push(...order.transactions);
                  } else {
                    if (order.paymentStatus === "paid" || order.status !== "placed") {
                      txns.push({
                        txnType: "payment",
                        amount: order.total,
                        status: "Success",
                        txnRefId: order.razorpay?.paymentId || "2026080321053000029115\n4974089088575",
                        paymentMode: order.paymentMethod?.toUpperCase() === "RAZORPAY" ? "BANK" : "COD",
                        remark: "-",
                        at: order.createdAt
                      });
                    }
                  }
                }
                const payments = txns.filter(t => t.txnType === "payment");
                if (payments.length > 0) {
                  return payments.map((txn, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                        <strong>₹{Number(txn.amount).toFixed(2)}</strong>
                        <div style={{ color: "#888", fontSize: "10px" }}>{dayjs(txn.at).format("MMM DD YYYY, hh:mm A")}</div>
                      </td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                        <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                          {txn.status}
                        </span>
                      </td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #eee", whiteSpace: "pre-wrap" }}>{txn.txnRefId}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{txn.paymentMode}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{txn.remark || "-"}</td>
                    </tr>
                  ));
                }
                return (
                  <tr>
                    <td colSpan={5} style={{ padding: "8px", textAlign: "center", color: "#999" }}>No payment data available.</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>

          {order && (order.status === "cancelled" || order.paymentStatus === "refunded" || order.tags?.includes("Refunded") || order.rejectionReason) && (
            <>
              {/* Table 2: Refunds */}
              <Typography fontSize={13} fontWeight={700} color="#333" mb={1} mt={3}>Refunds</Typography>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px", fontSize: "12px", border: "1px solid #eee" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                    <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Refunded amount</th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Status</th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Return Ref. No.</th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Refunded to</th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Reason</th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Refunded by</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const isCOD = order.paymentMethod?.toLowerCase() === "cod";
                    const refundAmt = order.total;
                    const refundDate = dayjs(order.updatedAt || order.createdAt).add(3, "hour").format("MMM DD YYYY, hh:mm A");

                    return (
                      <>
                        <tr>
                          <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                            <span style={{ color: "#2e7d32", marginRight: 4, fontWeight: "bold" }}>▲</span>
                            <strong>₹{Number(refundAmt).toFixed(2)}</strong>
                            <div style={{ color: "#888", fontSize: "10px" }}>{refundDate}</div>
                          </td>
                          <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                            {isCOD ? (
                              <span style={{ background: "#e8f5e9", color: "#2e7d32", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                                Success
                              </span>
                            ) : (
                              <span style={{ background: "#fff3e0", color: "#e65100", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                                Pending
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                            {isCOD ? (
                              <strong style={{ letterSpacing: 0.5 }}>OZAOI9LNEFA</strong>
                            ) : (
                              <Chip
                                label="Get rrn"
                                size="small"
                                onClick={() => toast.success("Retrieving return reference number...")}
                                sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontSize: 10, height: 20, cursor: "pointer", fontWeight: "bold" }}
                              />
                            )}
                          </td>
                          <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{isCOD ? "Promo" : "BANK"}</td>
                          <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{order.rejectionReason || "Order Delayed"}</td>
                          <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>ZIA</td>
                        </tr>
                        {!isCOD && (
                          <tr>
                            <td colSpan={6} style={{ padding: "8px 24px" }}>
                              {/* Stages Subtable */}
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", border: "1px solid #e0e0e0" }}>
                                <thead>
                                  <tr style={{ background: "#f9f9f9", textAlign: "left" }}>
                                    <th style={{ padding: "6px", borderBottom: "1px solid #ccc" }}>Stage</th>
                                    <th style={{ padding: "6px", borderBottom: "1px solid #ccc" }}>Date/Time Started</th>
                                    <th style={{ padding: "6px", borderBottom: "1px solid #ccc" }}>Details</th>
                                    <th style={{ padding: "6px", borderBottom: "1px solid #ccc" }}>Status</th>
                                    <th style={{ padding: "6px", borderBottom: "1px solid #ccc" }}>Customer communication</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>1</td>
                                    <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>{dayjs(order.createdAt).add(2, "hour").format("MMM DD YYYY, hh:mm A")}</td>
                                    <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>Refund initiated</td>
                                    <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}><span style={{ color: "#2e7d32", fontWeight: 700 }}>Success</span></td>
                                    <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>Refund of ₹{Number(refundAmt).toFixed(0)} 📄</td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>2</td>
                                    <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>{dayjs(order.createdAt).add(2.5, "hour").format("MMM DD YYYY, hh:mm A")}</td>
                                    <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>Refund processed by Bank</td>
                                    <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}><span style={{ color: "#2e7d32", fontWeight: 700 }}>Success</span></td>
                                    <td style={{ padding: "6px", borderBottom: "1px solid #eee" }}>The refund req 📄</td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: "6px" }}>3</td>
                                    <td style={{ padding: "6px" }}>—</td>
                                    <td style={{ padding: "6px" }}>Refund completed</td>
                                    <td style={{ padding: "6px" }}><span style={{ color: "#e65100", fontWeight: 700 }}>Pending</span></td>
                                    <td style={{ padding: "6px" }}>— 📄</td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>

              {/* Table 3: Refunded items */}
              <Typography fontSize={13} fontWeight={700} color="#333" mb={1}>Refunded item</Typography>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", border: "1px solid #eee" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                    <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Refunded item</th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Item ID</th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Quantity</th>
                    <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Refunded by</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} style={{ padding: "10px", textAlign: "center", color: "#888" }}>No data available.</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── COMMENTS DIALOG ───────────────────────────────────────────────── */}
      <CommentsDialog
        open={commentsModalOpen}
        onClose={() => setCommentsModalOpen(false)}
        orderComments={orderComments}
        comment={comment}
        setComment={setComment}
        handleAddComment={handleAddComment}
      />

      {/* ── TAG LOGS DIALOG ────────────────────────────────────────────────── */}
      <TagLogsDialog
        open={tagLogsModalOpen}
        onClose={() => setTagLogsModalOpen(false)}
        tagLogs={tagLogs}
        selectedTag={selectedTag}
        expandedLogs={expandedLogs}
        setExpandedLogs={setExpandedLogs}
        currentUser={currentUser}
        setTagLogs={setTagLogs}
        order={order}
        SYSTEM_TAGS={SYSTEM_TAGS}
      />

      {/* ── FULL SCREEN INTERACTIVE MAP DIALOG ─────────────────────────────── */}
      <Dialog open={mapFullScreen} onClose={() => setMapFullScreen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <span style={{ fontWeight: 700 }}>Interactive Delivery Map</span>
          <IconButton size="small" onClick={() => setMapFullScreen(false)}>✕</IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography fontSize={12} color="text.secondary" mb={2}>
            Drag the red pin to set the customer delivery location. You can pan, shrink, or zoom the map.
          </Typography>
          <Box sx={{ width: "100%", height: 400, position: "relative" }}>
            <InteractiveMap
              width="100%"
              height="100%"
              zoom={mapZoom}
              setZoom={setMapZoom}
              pan={mapPan}
              setPan={setMapPan}
              customerPin={customerPin}
              setCustomerPin={(coords) => {
                setCustomerPin(coords);
                toast.info(`Updated Delivery Pin: [X: ${Math.round(coords.x)}, Y: ${Math.round(coords.y)}]`);
              }}
              vendorPin={vendorPin}
              mapActive={mapActive}
              mapSessionTime={mapSessionTime}
              handleReloadMap={handleReloadMap}
              order={order}
              businessSettings={businessSettings}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", mt: 2 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" variant="outlined" onClick={() => setMapPan({ x: mapPan.x - 20, y: mapPan.y })}>◀</Button>
              <Button size="small" variant="outlined" onClick={() => setMapPan({ x: mapPan.x, y: mapPan.y - 20 })}>▲</Button>
              <Button size="small" variant="outlined" onClick={() => setMapPan({ x: mapPan.x, y: mapPan.y + 20 })}>▼</Button>
              <Button size="small" variant="outlined" onClick={() => setMapPan({ x: mapPan.x + 20, y: mapPan.y })}>▶</Button>
              <Button size="small" variant="outlined" onClick={() => setMapPan({ x: 0, y: 0 })}>Center</Button>
            </Box>
            <Button size="small" variant="contained" color="error" onClick={() => setMapFullScreen(false)}>Done</Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ── DELIVERY PARTNER DIALOG ───────────────────────────────────────── */}
      <DeliveryPartnerDialog
        open={deliveryPartnerModalOpen}
        onClose={() => setDeliveryPartnerModalOpen(false)}
        onSubmit={handleAssignDeliveryPartnerSubmit}
      />

      {/* ── ADDRESS UPDATE DIALOG ─────────────────────────────────────────── */}
      <AddressUpdateDialog
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        order={order}
        customerAddresses={customerAddresses}
        selectedAddressBookIdx={selectedAddressBookIdx}
        setSelectedAddressBookIdx={setSelectedAddressBookIdx}
        manualAddressForm={manualAddressForm}
        setManualAddressForm={setManualAddressForm}
        saveToBook={saveToBook}
        setSaveToBook={setSaveToBook}
        gpsCountdown={gpsCountdown}
        setGpsCountdown={setGpsCountdown}
        handleUpdateAddress={handleUpdateAddress}
      />
    </Box>
  );
};

export default Lifeline;
