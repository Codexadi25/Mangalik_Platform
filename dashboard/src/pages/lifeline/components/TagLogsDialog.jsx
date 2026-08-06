import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton, Chip, Box, Typography } from "@mui/material";
import { toast } from "react-toastify";

const TagLogsDialog = ({
  open,
  onClose,
  tagLogs,
  selectedTag,
  expandedLogs,
  setExpandedLogs,
  currentUser,
  setTagLogs,
  order,
  SYSTEM_TAGS
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <span style={{ fontWeight: 700 }}>Tags Log</span>
        <IconButton size="small" onClick={onClose}>✕</IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", border: "1px solid #eee" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Tag</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Issue Details</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Added by</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Agent Role</th>
              <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tagLogs.filter(l => l.tag === selectedTag).length > 0 ? (
              tagLogs.filter(l => l.tag === selectedTag).map((log) => (
                <tr key={log.id}>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee", verticalAlign: "top" }}>
                    <Chip label={log.tag} size="small" sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontSize: 11 }} />
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee", verticalAlign: "top", fontFamily: "monospace", background: "#fafafa" }}>
                    {expandedLogs[log.id] ? (
                      <Box>
                        <span 
                          style={{ color: "#e53935", cursor: "pointer", fontWeight: "bold" }}
                          onClick={() => setExpandedLogs(prev => ({ ...prev, [log.id]: false }))}
                        >
                          Collapse {"{ }"}
                        </span>
                        <pre style={{ margin: "8px 0 0 0", fontSize: "11px", whiteSpace: "pre-wrap", color: "#333" }}>
                          {(() => {
                            let details = log.details || {};
                            if (log.tag === "PG Failed") {
                              details = {
                                action: "submit",
                                action_type: "refunded",
                                delay_in_mins: 35,
                                kpt_delay_in_mins: 21,
                                delight_promo: "96",
                                karma: "Silver"
                              };
                            } else if (log.tag === "LLCancelation" || log.tag === "Order Snatched by Stranger" || log.tag === "Item Out of Stock") {
                              details = {
                                action: "cancellation",
                                action_type: "order_cancelled",
                                reason: order?.rejectionReason || "Customer changed mind / validation failed",
                                refund_status: "none"
                              };
                            } else if (log.tag === "Wrong Address" || log.tag === "Incomplete Cx Address") {
                              details = {
                                action: "update_address",
                                new_address: order?.shippingAddress?.line1 || "N/A",
                                updated_at: order?.updatedAt || new Date().toISOString()
                              };
                            } else if (log.tag === "Refunded") {
                              details = {
                                action: "refund",
                                refund_amount: order?.total || 0,
                                payment_method: order?.paymentMethod || "online"
                              };
                            } else if (log.tag === "Replacement") {
                              details = {
                                action: "replacement",
                                status: "created",
                                original_order_id: order?.orderNumber || order?._id
                              };
                            } else {
                              details = {
                                action: "manual_selection",
                                tag: log.tag,
                                timestamp: log.date
                              };
                            }
                            return JSON.stringify(details, null, 2);
                          })()}
                        </pre>
                      </Box>
                    ) : (
                      <span 
                        style={{ color: "#2575fc", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
                        onClick={() => setExpandedLogs(prev => ({ ...prev, [log.id]: true }))}
                      >
                        {"{ ... }"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee", verticalAlign: "top" }}>
                    <strong>{log.addedBy}</strong>
                    <div style={{ color: "#888", fontSize: "10px" }}>{log.email}</div>
                    <div style={{ color: "#888", fontSize: "10px" }}>{log.date}</div>
                  </td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee", verticalAlign: "top" }}>{log.role || "—"}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee", verticalAlign: "top" }}>
                    {(!SYSTEM_TAGS.includes(log.tag) && log.email === currentUser?.email) ? (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={async () => {
                          setTagLogs(tagLogs.filter(l => l.id !== log.id));
                          toast.success("Tag log entry deleted.");
                        }}
                      >
                        🗑️
                      </IconButton>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#888" }}>Locked</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: "8px", textAlign: "center", color: "#999" }}>No logs available for this tag.</td>
              </tr>
            )}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
};

export default TagLogsDialog;
