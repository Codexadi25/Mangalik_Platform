import React, { useEffect } from 'react'

const TermsConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="page-container section-padding">
      <div className="container">
        <h1 className="text-center" style={{ marginBottom: '40px' }}>Terms and Conditions</h1>
        <div className="policy-content" style={{ maxWidth: '900px', margin: '0 auto', lineHeight: '1.8' }}>
          <p><strong>Last Updated: May 13, 2026</strong></p>
          <br />
          <p>Welcome to MANGLIK, a brand operated and incorporated under AGRANEX INDUSTRIES PRIVATE LIMITED. By accessing our website at https://manglik.com/ or purchasing our products, you agree to be bound by the following terms and conditions.</p>

          <h3 id="general">1. GENERAL PROVISIONS</h3>
          <p><strong>Ownership:</strong> The website and its original content, features, and functionality are owned by AGRANEX INDUSTRIES PRIVATE LIMITED and are protected by international copyright, trademark, and other intellectual property laws.</p>
          <p><strong>Eligibility:</strong> By using this site, you represent that you are at least the age of majority in your state or province of residence.</p>

          <h3 id="products">2. PRODUCTS AND SALES</h3>
          <p><strong>Accuracy:</strong> We attempt to be as accurate as possible with product descriptions and pricing. However, we do not warrant that product descriptions or other content are error-free.</p>
          <p><strong>Order Fulfillment:</strong> We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase or inaccuracies in product or pricing information.</p>

          <h3 id="billing">3. PAYMENTS AND BILLING</h3>
          <p><strong>Payment Methods:</strong> We process payments through secure third-party gateways. You agree to provide current, complete, and accurate purchase and account information for all purchases.</p>
          <p><strong>Taxes:</strong> You are responsible for all applicable taxes associated with your purchase.</p>

          <h3 id="property">4. INTELLECTUAL PROPERTY</h3>
          <p>The MANGLIK name, logos, and all related product and service names are trademarks of AGRANEX INDUSTRIES PRIVATE LIMITED.</p>
          <p>You may not use, reproduce, or distribute any content from the site without express written permission.</p>

          <h3 id="liability">5. LIMITATION OF LIABILITY</h3>
          <p>AGRANEX INDUSTRIES PRIVATE LIMITED shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services or products.</p>
          <p>Our Services are provided on an "as is" and "as available" basis without any warranties of any kind.</p>

          <h3 id="termination">6. TERMINATION</h3>
          <p>We reserve the right to terminate your access to the site or your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business.</p>

          <h3 id="law">7. GOVERNING LAW</h3>
          <p>These Terms and Conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>

          <h3 id="contact">8. CONTACT INFORMATION</h3>
          <p>For questions about these Terms, please contact us at:</p>
          <p><strong>Email:</strong> support@manglik.com</p>
          <p><strong>Address:</strong> AGRANEX INDUSTRIES PRIVATE LIMITED, Plot No 61, 88/74 Hindustan Compound, Jajmau, Kanpur, Uttar Pradesh, 208010.</p>
        </div>
      </div>
    </div>
  )
}

export default TermsConditions

