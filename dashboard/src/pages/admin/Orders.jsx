import React, { useEffect, useState } from "react";
import api from "../../services/api";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useHeader } from "../../context/HeaderContext";
import "./OrdersDashboard.css";

const Orders = () => {
  const { setHeaderData } = useHeader();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    setHeaderData({
      title: "Customer Orders",
      searchPlaceholder: "Search by ID, customer name, email...",
      searchValue: searchQuery,
      onSearchChange: setSearchQuery
    });
    return () => setHeaderData({ title: "", subtitle: "", searchPlaceholder: "", searchValue: "", onSearchChange: null, actionComponent: null });
  }, [searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      setOrders(data.data || []);
    } catch (err) {
      toast.error("Failed to load orders");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated");
      
      const updated = orders.map((order) => {
        if (order._id === orderId) {
          const u = { ...order, status: newStatus };
          if (selectedOrder && selectedOrder._id === orderId) setSelectedOrder(u);
          return u;
        }
        return order;
      });
      setOrders(updated);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const acceptOrder = (orderId) => {
    updateOrderStatus(orderId, "processing");
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm(`Are you sure you want to delete order?`)) {
      try {
        await api.delete(`/orders/${orderId}`);
        toast.success("Order deleted");
        setOrders(orders.filter((o) => o._id !== orderId));
        setSelectedOrder(null);
      } catch (err) {
        toast.error("Failed to delete order");
      }
    }
  };

  const activeOrders = orders.filter((o) => o.status !== "cancelled" && o.status !== "returned");
  const totalRevenue = activeOrders.reduce((acc, curr) => acc + curr.total, 0);
  const pendingCount = orders.filter((o) => o.status === "placed").length;
  const completedCount = orders.filter((o) => o.status === "delivered").length;

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    const term = searchQuery.toLowerCase().trim();
    if (!term) return matchesStatus;

    const matchesId = order.orderNumber.toLowerCase().includes(term);
    const matchesCustomer = 
      order.user?.name?.toLowerCase().includes(term) || 
      order.user?.email?.toLowerCase().includes(term) ||
      (order.shippingAddress?.phone || "").includes(term);
    const matchesProduct = order.items.some((item) => item.title.toLowerCase().includes(term));

    return matchesStatus && (matchesId || matchesCustomer || matchesProduct);
  });

  return (
    <div className="admin-dashboard-container">
      
      <div className="container">


        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon revenue">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="admin-stat-info">
              <h3>Total Sales</h3>
              <p>₹{totalRevenue.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon orders">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <div className="admin-stat-info">
              <h3>Orders Count</h3>
              <p>{orders.length}</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon pending">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="admin-stat-info">
              <h3>Pending Fulfill</h3>
              <p>{pendingCount}</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon completed">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="admin-stat-info">
              <h3>Delivered</h3>
              <p>{completedCount}</p>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="admin-controls">


          <div className="admin-filter-tabs">
            {["All", "placed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
              <button 
                key={status}
                className={`admin-filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
                style={{ textTransform: 'capitalize' }}
              >
                {status === "placed" ? "Pending" : status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-table-wrapper">
          {filteredOrders.length === 0 ? (
            <div className="admin-empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <h3>No orders found</h3>
              <p>There are no orders that match your current filters.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer Details</th>
                  <th>Items Placed</th>
                  <th>Total Amount</th>
                  <th>Fulfillment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const itemsSummary = order.items.map((i) => `${i.title} (${i.quantity}x)`).join(", ");
                  
                  // Map statuses to CSS classes
                  let badgeClass = order.status;
                  if (order.status === "placed") badgeClass = "pending";
                  
                  return (
                    <tr key={order._id} onClick={() => setSelectedOrder(order)}>
                      <td className="order-id-cell">{order.orderNumber}</td>
                      <td>{dayjs(order.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
                      <td>
                        <div className="customer-cell">
                          <span className="customer-name">{order.shippingAddress?.fullName || order.user?.name || "Guest"}</span>
                          <span className="customer-email">{order.user?.email || "-"}</span>
                        </div>
                      </td>
                      <td className="items-cell" title={itemsSummary}>{itemsSummary}</td>
                      <td style={{ fontWeight: "700" }}>₹{order.total.toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`status-badge ${badgeClass}`}>
                          {order.status === 'placed' ? 'Pending' : order.status}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {order.status === "placed" ? (
                          <button 
                            className="accept-order-btn"
                            style={{ 
                              padding: '6px 12px', background: '#3b82f6', color: '#fff', 
                              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' 
                            }}
                            onClick={() => acceptOrder(order._id)}
                          >
                            Accept Order
                          </button>
                        ) : (
                          <select
                            className="status-select"
                            style={{ padding: "6px 10px", fontSize: "0.85rem", width: "auto" }}
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          >
                            {["placed", "processing", "shipped", "delivered", "cancelled"].filter(opt => {
                              const orderArray = ["placed", "processing", "shipped", "delivered"];
                              const currIdx = orderArray.indexOf(order.status);
                              const optIdx = orderArray.indexOf(opt);
                              if (opt === "cancelled") return currIdx < 2; // can cancel if placed or processing
                              if (currIdx === -1) return true; // fallback
                              return optIdx >= currIdx;
                            }).map(opt => (
                              <option key={opt} value={opt}>
                                {opt === "placed" ? "Pending" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected Order Details Drawer Overlay */}
      {selectedOrder && (
        <div className="admin-drawer-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <h2>Order Details</h2>
              <button className="close-drawer-btn" onClick={() => setSelectedOrder(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="admin-drawer-body">
              {/* General */}
              <div>
                <div className="drawer-section-title">Overview</div>
                <div className="drawer-detail-grid">
                  <div>
                    <div className="drawer-detail-label">Order ID</div>
                    <div className="drawer-detail-value order-id-cell">{selectedOrder.orderNumber}</div>
                  </div>
                  <div>
                    <div className="drawer-detail-label">Date &amp; Time</div>
                    <div className="drawer-detail-value">{dayjs(selectedOrder.createdAt).format("DD MMM YYYY, hh:mm A")}</div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <div className="drawer-section-title">Customer Information</div>
                <div className="drawer-detail-grid">
                  <div className="drawer-detail-item full-width">
                    <div className="drawer-detail-label">Full Name</div>
                    <div className="drawer-detail-value">{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name}</div>
                  </div>
                  <div>
                    <div className="drawer-detail-label">Email Address</div>
                    <div className="drawer-detail-value" style={{ wordBreak: "break-all" }}>{selectedOrder.user?.email || "-"}</div>
                  </div>
                  <div>
                    <div className="drawer-detail-label">Phone Number</div>
                    <div className="drawer-detail-value">{selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone}</div>
                  </div>
                  <div className="drawer-detail-item full-width">
                    <div className="drawer-detail-label">Shipping Address</div>
                    <div className="drawer-detail-value" style={{ lineHeight: "1.4" }}>
                      {selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.line2 && selectedOrder.shippingAddress?.line2 + ', '} 
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Placed */}
              <div>
                <div className="drawer-section-title">Items Placed</div>
                <div className="drawer-items-list">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="drawer-item-row">
                      {item.image && <img src={item.image} alt={item.title} className="drawer-item-img" />}
                      <div className="drawer-item-info">
                        <div className="drawer-item-name">{item.title}</div>
                        <div className="drawer-item-meta">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                      <div className="drawer-item-price">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="drawer-total-box">
                <span className="drawer-total-label">Grand Total</span>
                <span className="drawer-total-value">₹{selectedOrder.total.toLocaleString("en-IN")}</span>
              </div>

              {/* Status Update */}
              <div className="status-update-box">
                <div className="drawer-section-title">Fulfillment Status</div>
                {selectedOrder.status === "placed" ? (
                  <button 
                    className="admin-btn admin-btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => acceptOrder(selectedOrder._id)}
                  >
                    Accept Order
                  </button>
                ) : (
                  <select 
                    className="status-select"
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                  >
                    {["placed", "processing", "shipped", "delivered", "cancelled"].filter(opt => {
                      const orderArray = ["placed", "processing", "shipped", "delivered"];
                      const currIdx = orderArray.indexOf(selectedOrder.status);
                      const optIdx = orderArray.indexOf(opt);
                      if (opt === "cancelled") return currIdx < 2; // can cancel if placed or processing
                      if (currIdx === -1) return true; // fallback
                      return optIdx >= currIdx;
                    }).map(opt => (
                      <option key={opt} value={opt}>
                        {opt === "placed" ? "Pending" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="admin-drawer-footer">
              <button className="admin-btn admin-btn-danger" onClick={() => deleteOrder(selectedOrder._id)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete Order
              </button>
              <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
