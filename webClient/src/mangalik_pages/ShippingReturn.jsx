import React, { useEffect } from 'react'

const ShippingReturn = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="page-container section-padding">
      <div className="container">
        <h1 className="text-center" style={{ marginBottom: '40px' }}>Shipping & Return Policy</h1>
        <div className="policy-content" style={{ maxWidth: '900px', margin: '0 auto', lineHeight: '1.8' }}>
          <p><strong>Last Updated: May 13, 2026</strong></p>
          <br />
          <p>Thank you for choosing MANGLIK, a brand under AGRANEX INDUSTRIES PRIVATE LIMITED. To provide you with the most reliable logistics and customer support, we utilize established third-party marketplaces for all order fulfillment.</p>

          <h3 id="shipping">1. ORDER FULFILLMENT & SHIPPING</h3>
          <p><strong>Third-Party Logistics:</strong> MANGLIK does not ship products directly. All orders are fulfilled, managed, and shipped by our authorized third-party partners, including Amazon, Flipkart, and Meesho.</p>
          <p><strong>Delivery Timelines:</strong> Shipping speeds, costs, and delivery dates are determined by the respective third-party platform at the time of your purchase.</p>
          <p><strong>Tracking:</strong> Once your order is processed by the third-party channel, you will receive tracking information directly from that platform.</p>

          <h3 id="returns">2. RETURNS AND REFUNDS</h3>
          <p><strong>Platform Policies:</strong> Because your transaction is completed through a third-party marketplace, all returns, replacements, and refunds are subject to the specific policies of that platform (e.g., Amazon’s Return Policy).</p>
          <p><strong>Initiating a Return:</strong> To return a product, please log into the account of the marketplace where the purchase was made (Amazon, Flipkart, or Meesho) and follow their "Returns & Orders" process.</p>
          <p><strong>Processing:</strong> The third-party channel is responsible for inspecting returned items and processing your refund or exchange.</p>

          <h3 id="damaged">3. DAMAGED OR DEFECTIVE ITEMS</h3>
          <p><strong>Immediate Support:</strong> If you receive a damaged or incorrect item, we recommend reporting it immediately through the "Customer Support" section of the marketplace used for the purchase to ensure a timely resolution.</p>
          <p><strong>Our Commitment:</strong> While the third party handles the physical return, we are committed to product quality. If you experience recurring issues, please let us know via the contact information below.</p>

          <h3 id="contact">4. CONTACT INFORMATION</h3>
          <p>For any inquiries regarding our products or help navigating third-party channels, please contact:</p>
          <ul>
            <li><strong>Brand:</strong> MANGLIK</li>
            <li><strong>Parent Company:</strong> AGRANEX INDUSTRIES PRIVATE LIMITED</li>
            <li><strong>Email:</strong> support@manglik.com</li>
          </ul>
          <p><em>Please Note: MANGLIK hosts product information on our website for your convenience, but the final purchase agreement and logistical handling are conducted solely through our third-party channel partners.</em></p>
        </div>
      </div>
    </div>
  )
}

export default ShippingReturn
