import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import "./AccountDashboard.css";

import { fetchProfile, updateProfile, toggleWishlist } from "../redux/slices/userSlice";
import { fetchMyOrders } from "../redux/slices/orderSlice";
import { getProductImageUrl } from "../utils/imageHelper";

// Inline Lightweight SVGs to replace Material UI Icons
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const OrdersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const WishlistIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const AccountDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, wishlist } = useSelector((s) => s.user);
  const { orders } = useSelector((s) => s.order);

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "orders";

  const tabIndexMap = { home: 0, orders: 1, overview: 1, profile: 2, wishlist: 3 };
  const [tabValue, setTabValue] = useState(tabIndexMap[initialTab] || 1);

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const handleTabChange = (newValue) => {
    if (newValue === 0) {
      navigate("/");
      return;
    }
    setTabValue(newValue);
    const reverseMap = ["home", "orders", "profile", "wishlist"];
    navigate(`/account?tab=${reverseMap[newValue]}`, { replace: true });
  };

  // Editable Profile States
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWhatsApp, setEditWhatsApp] = useState("");

  useEffect(() => {
    if (profile) {
      setEditName(profile.name || "");
      setEditPhone(profile.phone || "");
      setEditEmail(profile.email || "");
      setEditWhatsApp(profile.whatsApp || "");
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    try {
      await dispatch(updateProfile({ name: editName, phone: editPhone, email: editEmail, whatsApp: editWhatsApp })).unwrap();
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err || "Failed to update profile");
    }
  };

  // Address Management State
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddressIdx, setEditingAddressIdx] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false, latitude: "", longitude: ""
  });

  const handleOpenAddressDialog = (idx = null) => {
    if (idx !== null && profile.addresses?.[idx]) {
      setEditingAddressIdx(idx);
      setAddressForm({
        label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false, latitude: "", longitude: "",
        ...profile.addresses[idx]
      });
    } else {
      setEditingAddressIdx(null);
      setAddressForm({ label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: profile.addresses?.length === 0, latitude: "", longitude: "" });
    }
    setAddressDialogOpen(true);
  };

  const handleAutoFetchAddressLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAddressForm(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          toast.success("Location coordinates fetched successfully!");
        },
        (error) => {
          const mockLat = (26.4499 + (Math.random() - 0.5) * 0.05).toFixed(4);
          const mockLng = (80.3319 + (Math.random() - 0.5) * 0.05).toFixed(4);
          setAddressForm(prev => ({
            ...prev,
            latitude: parseFloat(mockLat),
            longitude: parseFloat(mockLng)
          }));
          toast.info("Location permission denied. Simulated standard drop coordinates loaded.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const handleCloseAddressDialog = () => {
    setAddressDialogOpen(false);
  };

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async () => {
    if (!addressForm.fullName || !addressForm.phone || !addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      return toast.error("Please fill all required address fields.");
    }
    if (!addressForm.latitude || !addressForm.longitude) {
      return toast.error("Please confirm your delivery drop location (Geo-coordinates) via 'Auto-Fetch'.");
    }
    
    let newAddresses = [...(profile.addresses || [])];
    if (editingAddressIdx !== null) {
      newAddresses[editingAddressIdx] = addressForm;
    } else {
      newAddresses.push(addressForm);
    }
    
    if (addressForm.isDefault) {
      newAddresses = newAddresses.map((a, i) => i === (editingAddressIdx !== null ? editingAddressIdx : newAddresses.length - 1) ? { ...a, isDefault: true } : { ...a, isDefault: false });
    }

    try {
      await dispatch(updateProfile({ addresses: newAddresses })).unwrap();
      toast.success(editingAddressIdx !== null ? "Address updated!" : "Address added!");
      handleCloseAddressDialog();
    } catch (err) {
      toast.error(err || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (idx) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    const newAddresses = profile.addresses.filter((_, i) => i !== idx);
    try {
      await dispatch(updateProfile({ addresses: newAddresses })).unwrap();
      toast.success("Address deleted.");
    } catch (err) {
      toast.error(err || "Failed to delete address");
    }
  };

  if (!profile) {
    return (
      <div className="account-dashboard" style={{ textAlign: "center", padding: "100px 0" }}>
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="account-dashboard">
      <h2 className="account-title">My Account</h2>

      <div className="account-layout">
        {/* Navigation Sidebar / Sticky Bottom Bar on Mobile */}
        <aside className="account-sidebar">
          <nav className="account-menu">
            <button className={`account-menu-item ${tabValue === 0 ? "active" : ""}`} onClick={() => handleTabChange(0)}>
              <HomeIcon /> <span>Home</span>
            </button>
            <button className={`account-menu-item ${tabValue === 1 ? "active" : ""}`} onClick={() => handleTabChange(1)}>
              <OrdersIcon /> <span>Orders</span>
            </button>
            <button className={`account-menu-item ${tabValue === 2 ? "active" : ""}`} onClick={() => handleTabChange(2)}>
              <ProfileIcon /> <span>Profile Details</span>
            </button>
            <button className={`account-menu-item ${tabValue === 3 ? "active" : ""}`} onClick={() => handleTabChange(3)}>
              <WishlistIcon /> <span>Wishlist</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="account-content">
          
          {/* Tab 1: Orders (Overview + Order History merged) */}
          {tabValue === 1 && (
            <div>
              <h3 className="account-panel-title">My Orders</h3>
              
              {/* Stat Cards */}
              <div className="stat-grid">
                <div className="stat-card primary">
                  <h3>{orders.length}</h3>
                  <p>Total Orders</p>
                </div>
                <div className="stat-card secondary">
                  <h3>{wishlist.length}</h3>
                  <p>Favorites</p>
                </div>
              </div>

              {/* Order list */}
              <div className="orders-list">
                {orders.map((o) => (
                  <div key={o._id} className="order-card">
                    <div className="order-header">
                      <div className="order-header-col">
                        <span className="order-label">Order Placed</span>
                        <span className="order-val">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="order-header-col">
                        <span className="order-label">Total</span>
                        <span className="order-val">₹{o.total}</span>
                      </div>
                      <div className="order-header-col">
                        <span className="order-label">Order #</span>
                        <span className="order-val">{o.orderNumber}</span>
                      </div>
                      <RouterLink to={`/orders/${o._id}`} className="order-details-link">
                        View Details
                      </RouterLink>
                    </div>
                    <div className="order-body">
                      <div className="order-images">
                        {o.items.slice(0, 3).map((item) => (
                          <img key={item.product} src={item.image || "/placeholder-product.png"} alt="Product" className="order-img" />
                        ))}
                      </div>
                      <span className={`order-status-badge ${o.status === "delivered" ? "status-delivered" : o.status === "pending" ? "status-pending" : "status-other"}`}>
                        {o.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p style={{ color: "var(--text-muted)" }}>You haven't placed any orders yet.</p>}
              </div>
            </div>
          )}

          {/* Tab 2: Profile & Addresses */}
          {tabValue === 2 && (
            <div>
              <h3 className="account-panel-title">Profile Details</h3>
              <div className="profile-form">
                <div className="form-group-custom">
                  <label>Full Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter full name" />
                </div>
                <div className="form-group-custom">
                  <label>Email Address</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Enter email address" />
                </div>
                <div className="form-group-custom">
                  <label>Phone Number</label>
                  <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Enter phone number" />
                </div>
                <div className="form-group-custom">
                  <label>WhatsApp Number</label>
                  <input type="tel" value={editWhatsApp} onChange={(e) => setEditWhatsApp(e.target.value)} placeholder="Enter WhatsApp number" />
                </div>
                <button className="auth-btn" onClick={handleUpdateProfile} style={{ marginTop: "10px", maxWidth: "200px" }}>
                  Save Changes
                </button>
              </div>

              {/* Shipped addresses moved inside profile */}
              <div className="addresses-section">
                <div className="addresses-header">
                  <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>Manage Addresses</h3>
                  <button className="auth-btn-outline" onClick={() => handleOpenAddressDialog()} style={{ padding: "8px 16px", fontSize: "0.9rem", width: "auto" }}>
                    + Add New Address
                  </button>
                </div>
                
                <div className="addresses-list">
                  {(profile.addresses || []).map((addr, idx) => (
                    <div key={idx} className={`address-card ${addr.isDefault ? "default" : ""}`}>
                      <div className="address-actions">
                        <button className="address-action-btn edit" onClick={() => handleOpenAddressDialog(idx)}>
                          <EditIcon />
                        </button>
                        <button className="address-action-btn delete" onClick={() => handleDeleteAddress(idx)}>
                          <TrashIcon />
                        </button>
                      </div>
                      <h4>
                        {addr.fullName} 
                        <span className="badge-label" style={{ marginLeft: "8px" }}>{addr.label}</span>
                        {addr.isDefault && <span className="badge-default" style={{ marginLeft: "8px" }}>Default</span>}
                      </h4>
                      <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>{addr.line1}, {addr.line2}</p>
                      <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>Phone: {addr.phone}</p>
                    </div>
                  ))}
                  {(!profile.addresses || profile.addresses.length === 0) && (
                    <p style={{ color: "var(--text-muted)" }}>No addresses saved yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Wishlist */}
          {tabValue === 3 && (
            <div>
              <h3 className="account-panel-title">My Wishlist</h3>
              <div className="wishlist-grid">
                {wishlist.map((p) => (
                  <div key={p._id} className="wishlist-card">
                    <button className="wishlist-remove-btn" onClick={() => dispatch(toggleWishlist(p._id))}>
                      <TrashIcon />
                    </button>
                    <img src={getProductImageUrl(p.images?.[0]?.url) || "/placeholder-product.png"} alt={p.title} className="wishlist-img" />
                    <div className="wishlist-info">
                      <h4>{p.title}</h4>
                      <div className="wishlist-price">₹{p.basePrice}</div>
                      <RouterLink to={`/products/${p.slug}`} className="auth-btn-outline" style={{ display: "block", textDecoration: "none", textAlign: "center", padding: "10px 0" }}>
                        View Details
                      </RouterLink>
                    </div>
                  </div>
                ))}
                {wishlist.length === 0 && <p style={{ color: "var(--text-muted)" }}>Your wishlist is empty.</p>}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Address Edit Dialog Overlay */}
      {addressDialogOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <h3>{editingAddressIdx !== null ? "Edit Address" : "Add New Address"}</h3>
              <button className="modal-close-btn" onClick={handleCloseAddressDialog}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div className="form-group-custom">
                  <label>Full Name</label>
                  <input type="text" name="fullName" value={addressForm.fullName} onChange={handleAddressChange} required />
                </div>
                <div className="form-group-custom">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={addressForm.phone} onChange={handleAddressChange} required />
                </div>
                <div className="form-group-custom">
                  <label>Flat, House no., Building, Company</label>
                  <input type="text" name="line1" value={addressForm.line1} onChange={handleAddressChange} required />
                </div>
                <div className="form-group-custom">
                  <label>Area, Street, Sector, Village</label>
                  <input type="text" name="line2" value={addressForm.line2} onChange={handleAddressChange} />
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                  <div className="form-group-custom" style={{ flex: 1 }}>
                    <label>City</label>
                    <input type="text" name="city" value={addressForm.city} onChange={handleAddressChange} required />
                  </div>
                  <div className="form-group-custom" style={{ flex: 1 }}>
                    <label>State</label>
                    <input type="text" name="state" value={addressForm.state} onChange={handleAddressChange} required />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "15px" }}>
                  <div className="form-group-custom" style={{ flex: 1 }}>
                    <label>Pincode</label>
                    <input type="text" name="pincode" value={addressForm.pincode} onChange={handleAddressChange} required />
                  </div>
                  <div className="form-group-custom" style={{ flex: 1 }}>
                    <label>Label</label>
                    <select name="label" value={addressForm.label} onChange={handleAddressChange}>
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "15px", alignItems: "center", marginTop: "10px" }}>
                  <input 
                    type="checkbox" 
                    id="isDefaultCheckbox"
                    checked={addressForm.isDefault} 
                    onChange={() => setAddressForm({ ...addressForm, isDefault: !addressForm.isDefault })} 
                    style={{ width: "20px", height: "20px", cursor: "pointer" }} 
                  />
                  <label htmlFor="isDefaultCheckbox" style={{ fontWeight: 600, cursor: "pointer" }}>Set as Default Address</label>
                </div>
                
                <div style={{ marginTop: "10px" }}>
                  <button className="auth-btn-outline" onClick={handleAutoFetchAddressLocation} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    📍 {addressForm.latitude && addressForm.longitude ? "Drop Location Confirmed!" : "Auto-Fetch Delivery Drop Location"}
                  </button>
                  {addressForm.latitude && addressForm.longitude && (
                    <p style={{ textAlign: "center", color: "#28a745", fontWeight: "bold", fontSize: "0.85rem", marginTop: "8px" }}>
                      Geo-coordinates: {addressForm.latitude}, {addressForm.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="auth-btn-outline" onClick={handleCloseAddressDialog} style={{ width: "auto", padding: "10px 20px" }}>
                Cancel
              </button>
              <button className="auth-btn" onClick={handleSaveAddress} style={{ width: "auto", padding: "10px 20px", marginTop: 0 }}>
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountDashboard;
