import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../services/api";

const OrderPrintDocs = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const docType = searchParams.get("type") || "bill"; // "bill" | "invoice" | "gst"
  const [order, setOrder] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.data))
      .catch(err => console.error(err));

    api.get("/business-settings/public")
      .then(({ data }) => setBusinessSettings(data.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!order) {
    return <div style={{ padding: "40px", fontFamily: "sans-serif", textAlign: "center" }}>Loading document details...</div>;
  }

  // Calculate detailed GST breakups for whatsInTheBox items
  const getGstBreakdown = () => {
    let itemSubtotal = 0;
    const rows = [];

    order.items.forEach(item => {
      // If we have snapshotted whatsInTheBox items, calculate individual rows
      if (item.whatsInTheBox && item.whatsInTheBox.length > 0) {
        item.whatsInTheBox.forEach(boxItem => {
          const qty = boxItem.quantity * item.quantity;
          const grossValue = boxItem.itemValue * qty;
          const netValue = grossValue; // assuming net is gross for simple tax invoice
          const gstPercent = boxItem.gstRate || 5;
          const cgstRate = gstPercent / 2;
          const sgstRate = gstPercent / 2;
          const cgstAmount = (netValue * cgstRate) / 100;
          const sgstAmount = (netValue * sgstRate) / 100;
          const total = netValue + cgstAmount + sgstAmount;

          rows.push({
            itemName: boxItem.itemName,
            qty,
            grossValue,
            discount: 0,
            netValue,
            cgstRate,
            cgstAmount,
            sgstRate,
            sgstAmount,
            total
          });
        });
      } else {
        // Fallback to base product snapshot
        const grossValue = item.price * item.quantity;
        const netValue = grossValue;
        const gstPercent = item.gstPercent || 5;
        const cgstRate = gstPercent / 2;
        const sgstRate = gstPercent / 2;
        const cgstAmount = (netValue * cgstRate) / 100;
        const sgstAmount = (netValue * sgstRate) / 100;
        const total = netValue + cgstAmount + sgstAmount;

        rows.push({
          itemName: item.title,
          qty: item.quantity,
          grossValue,
          discount: 0,
          netValue,
          cgstRate,
          cgstAmount,
          sgstRate,
          sgstAmount,
          total
        });
      }
    });

    return rows;
  };

  const gstRows = getGstBreakdown();
  const totalNetValue = gstRows.reduce((sum, r) => sum + r.netValue, 0);
  const totalCgst = gstRows.reduce((sum, r) => sum + r.cgstAmount, 0);
  const totalSgst = gstRows.reduce((sum, r) => sum + r.sgstAmount, 0);
  const invoiceGrandTotal = totalNetValue + totalCgst + totalSgst;

  // Print automatically once opened
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "30px", border: "1px solid #ccc", background: "#fff", fontFamily: "Arial, sans-serif", color: "#333", fontSize: "14px", lineHeight: "1.5" }}>
      {/* Print Button (hidden during print) */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; margin: 0; padding: 0; }
        }
      `}</style>
      
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "10px", borderBottom: "1px solid #eee" }}>
        <button onClick={handlePrint} style={{ padding: "10px 20px", background: "#E33C24", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          🖨️ Print / Save as PDF
        </button>
        <span style={{ fontSize: "12px", color: "#666", alignSelf: "center" }}>
          Tip: Set destination as "Save as PDF" in print options.
        </span>
      </div>

      {/* DOCUMENT 1: RECEIPT / BILL */}
      {docType === "bill" && (
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: "bold", textAlign: "center", borderBottom: "2px solid #333", pb: "10px", mb: "20px" }}>
            Mangalik Order: Summary and Receipt
          </h2>
          
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold", width: "180px" }}>Order ID:</td>
                <td style={{ padding: "4px 0" }}>{order.orderNumber}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Order Time:</td>
                <td style={{ padding: "4px 0" }}>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Customer Name:</td>
                <td style={{ padding: "4px 0" }}>{order.shippingAddress?.fullName}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold", verticalAlign: "top" }}>Delivery Address:</td>
                <td style={{ padding: "4px 0" }}>
                  {order.shippingAddress?.line1}, {order.shippingAddress?.line2 && order.shippingAddress.line2 + ","} {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Attributed Vendor:</td>
                <td style={{ padding: "4px 0" }}>DHAN LAXMI ENTERPRISES (Guidance / Governance)</td>
              </tr>
            </tbody>
          </table>

          <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
            <thead>
              <tr style={{ background: "#eee", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Item Description</th>
                <th style={{ padding: "10px", textAlign: "center" }}>Quantity</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Unit Price</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>
                    <strong>{item.title}</strong>
                    {item.whatsInTheBox && item.whatsInTheBox.length > 0 && (
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
                        Includes: {item.whatsInTheBox.map(b => `${b.itemName} (x${b.quantity})`).join(", ")}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>₹{item.price}</td>
                  <td style={{ padding: "10px", textAlign: "right" }}>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ float: "right", width: "300px", marginTop: "20px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "6px 0" }}>Subtotal:</td>
                  <td style={{ padding: "6px 0", textAlign: "right" }}>₹{order.subtotal}</td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td style={{ padding: "6px 0", color: "green" }}>Coupon Discount ({order.couponCode || "Ref"}):</td>
                    <td style={{ padding: "6px 0", textAlign: "right", color: "green" }}>-₹{order.discount}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ padding: "6px 0" }}>Estimated Taxes (GST):</td>
                  <td style={{ padding: "6px 0", textAlign: "right" }}>₹{order.gstAmount}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 0" }}>Delivery Charges:</td>
                  <td style={{ padding: "6px 0", textAlign: "right" }}>₹{order.shippingFee}</td>
                </tr>
                <tr style={{ borderTop: "2px solid #333", fontSize: "16px", fontWeight: "bold" }}>
                  <td style={{ padding: "10px 0" }}>Grand Total:</td>
                  <td style={{ padding: "10px 0", textAlign: "right" }}>₹{order.total}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ clear: "both" }}></div>

          <div style={{ marginTop: "40px", fontSize: "11px", color: "#666", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
            <p><strong>Terms & Conditions:</strong> All items delivered are subject to verification at the time of unboxing. Handcrafted elements are designed under governance of Dhanlaxmi Enterprises. In case of discrepancies, contact help@mangalik.store.</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <span>Dhanlaxmi Enterprises</span>
              <span>www.mangalik.store</span>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT 2: VENDOR TAX INVOICE */}
      {docType === "invoice" && (
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", textAlign: "center", mb: "5px" }}>Tax Invoice</h2>
          <div style={{ textAlign: "center", fontSize: "12px", fontWeight: "bold", mb: "20px", textTransform: "uppercase" }}>
            ORIGINAL FOR RECIPIENT
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #333", paddingTop: "15px", marginBottom: "20px" }}>
            <div style={{ width: "48%" }}>
              <strong>Tax Invoice on behalf of -</strong>
              <p style={{ margin: "5px 0 0 0" }}>
                <strong>Legal Entity Name:</strong> {order.items?.[0]?.vendor?.businessName || businessSettings?.businessName?.toUpperCase() || "DHAN LAXMI ENTERPRISES"}<br />
                <strong>Address:</strong> {order.items?.[0]?.vendor?.businessAddress || businessSettings?.billingAddress || "26, Yogendra Vihar, Naubasta, Kanpur Nagar, Uttar Pradesh - 208021"}<br />
                <strong>GSTIN:</strong> {order.items?.[0]?.vendor?.gstNumber || businessSettings?.gstNumber || "29AADCD4946L1Z6"}<br />
                <strong>FSSAI License:</strong> {order.items?.[0]?.vendor?.fssaiNumber || businessSettings?.fssaiLicenseNumber || "12726055000219"}
              </p>
            </div>
            <div style={{ width: "48%", textAlign: "right" }}>
              <p style={{ margin: 0 }}>
                <strong>Invoice No:</strong> INV-{order.orderNumber}<br />
                <strong>Invoice Date:</strong> {new Date(order.createdAt).toLocaleDateString()}<br />
                <strong>Place of Supply:</strong> {order.shippingAddress?.state}
              </p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: "10px", marginBottom: "20px" }}>
            <strong>Customer Details</strong>
            <p style={{ margin: "5px 0 0 0" }}>
              <strong>Name:</strong> {order.shippingAddress?.fullName}<br />
              <strong>Delivery Address:</strong> {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: "12px" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Particulars</th>
                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>Gross Value (₹)</th>
                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>Net Value (₹)</th>
                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>CGST (%)</th>
                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>CGST (₹)</th>
                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>SGST (%)</th>
                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>SGST (₹)</th>
                <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {gstRows.map((row, idx) => (
                <tr key={idx} style={{ fontSize: "12px" }}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{row.itemName}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{row.grossValue.toFixed(2)}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{row.qty}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{row.netValue.toFixed(2)}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>{row.cgstRate}%</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{row.cgstAmount.toFixed(2)}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>{row.sgstRate}%</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{row.sgstAmount.toFixed(2)}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{row.total.toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ background: "#f8fafc", fontWeight: "bold", fontSize: "12px" }}>
                <td colSpan={3} style={{ padding: "8px", border: "1px solid #ddd" }}>Total</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{totalNetValue.toFixed(2)}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}></td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{totalCgst.toFixed(2)}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}></td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{totalSgst.toFixed(2)}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "right" }}>₹{invoiceGrandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
            <p style={{ margin: "5px 0" }}><strong>Amount in words:</strong> {invoiceGrandTotal.toFixed(0)} Rupees Only</p>
            <p style={{ margin: "5px 0" }}><strong>Payment Mode:</strong> Settled digitally against Order ID: {order.orderNumber}</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "50px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#666" }}>
                Supply attracts reverse charge : No
              </p>
            </div>
            <div style={{ textAlign: "center", borderTop: "1px solid #333", width: "200px", paddingTop: "5px" }}>
              <strong>Authorised Signatory</strong>
              <p style={{ fontSize: "10px", margin: "2px 0" }}>DHAN LAXMI ENTERPRISES</p>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT 3: PLATFORM GST INVOICE */}
      {docType === "gst" && (
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", mb: "5px", textAlign: "center" }}>Tax Invoice</h2>
          <div style={{ textAlign: "center", fontSize: "12px", fontWeight: "bold", mb: "20px", textTransform: "uppercase" }}>
            ORIGINAL FOR RECIPIENT
          </div>

          <div style={{ borderTop: "1px solid #333", paddingTop: "15px", marginBottom: "20px" }}>
            <strong>{businessSettings?.businessName?.toUpperCase() || "MANGALIK STORE"} (Governance: Dhanlaxmi Enterprises)</strong>
            <p style={{ margin: "5px 0 0 0" }}>
              <strong>Billing Address:</strong> {businessSettings?.billingAddress || "26, Yogendra Vihar, Naubasta, Kanpur Nagar, Uttar Pradesh - 208021"}<br />
              <strong>PAN:</strong> AADCD4946L<br />
              <strong>CIN:</strong> L93030DL2010PLC198141<br />
              <strong>FSSAI License:</strong> {businessSettings?.fssaiLicenseNumber || "12726055000219"}<br />
              <strong>GSTIN:</strong> {businessSettings?.gstNumber || "29AADCD4946L1Z6"}<br />
              <strong>Invoice No:</strong> MGL-{order.orderNumber}<br />
              <strong>Invoice Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div style={{ borderTop: "1px solid #eee", paddingTop: "10px", marginBottom: "20px" }}>
            <strong>Customer Details</strong>
            <p style={{ margin: "5px 0 0 0" }}>
              <strong>Name:</strong> {order.shippingAddress?.fullName}<br />
              <strong>Address:</strong> {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Sr.No</th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>Particulars</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>Taxable Amount (₹)</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>CGST (9%) (₹)</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>SGST (9%) (₹)</th>
                <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>1</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>Platform Service Fee & Delivery Charges</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>₹{order.shippingFee.toFixed(2)}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>₹{(order.shippingFee * 0.09).toFixed(2)}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>₹{(order.shippingFee * 0.09).toFixed(2)}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>₹{(order.shippingFee * 1.18).toFixed(2)}</td>
              </tr>
              <tr style={{ fontWeight: "bold", background: "#f8fafc" }}>
                <td colSpan={2} style={{ padding: "10px", border: "1px solid #ddd" }}>Total</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>₹{order.shippingFee.toFixed(2)}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>₹{(order.shippingFee * 0.09).toFixed(2)}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>₹{(order.shippingFee * 0.09).toFixed(2)}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "right" }}>₹{(order.shippingFee * 1.18).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "60px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#666" }}>
                Tax is not payable on reverse charge basis.
              </p>
            </div>
            <div style={{ textAlign: "center", borderTop: "1px solid #333", width: "200px", paddingTop: "5px" }}>
              <strong>Authorized Signatory</strong>
              <p style={{ fontSize: "10px", margin: "2px 0" }}>MANGALIK STORE</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPrintDocs;
