import React, { useEffect } from 'react'

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="page-container section-padding">
      <div className="container">
        <h1 className="text-center" style={{ marginBottom: '40px' }}>Privacy Policy</h1>
        <div className="policy-content" style={{ maxWidth: '900px', margin: '0 auto', lineHeight: '1.8' }}>
          <p><strong>Last updated May 13, 2026</strong></p>
          <br />
          <p>This Privacy Notice for AGRANEX INDUSTRIES PRIVATE LIMITED ('we', 'us', or 'our') describes how and why we might access, collect, store, use, and/or share ('process') your personal information when you use our services ('Services'), including when you:</p>
          <ul>
            <li>Visit our website at https://manglik.com/ or any website of ours that links to this Privacy Notice</li>
            <li>Engage with us in other related ways, including any marketing or events</li>
          </ul>

          <div className="policy-summary" style={{ backgroundColor: 'var(--bg-light)', padding: '30px', borderRadius: 'var(--border-radius-md)', marginTop: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: 'var(--secondary)' }}>SUMMARY OF KEY POINTS</h2>
            <p>This summary provides key points from our Privacy Notice. You can find more details by using the table of contents below.</p>
            <ul>
              <li><strong>What personal information do we process?</strong> We may process personal information depending on how you interact with our Services, the choices you make, and the features you use.</li>
              <li><strong>Do we process any sensitive personal information?</strong> We do not process sensitive personal information.</li>
              <li><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</li>
              <li><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with the law.</li>
              <li><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties.</li>
              <li><strong>How do we keep your information safe?</strong> We have organizational and technical processes in place; however, no electronic transmission can be guaranteed 100% secure.</li>
              <li><strong>What are your rights?</strong> Depending on your location, you may have certain rights regarding your personal information.</li>
            </ul>
          </div>

          <h2 style={{ marginTop: '50px', fontSize: '1.8rem', color: 'var(--secondary)' }}>TABLE OF CONTENTS</h2>
          <ol style={{ paddingLeft: '20px', marginBottom: '40px' }}>
            <li>WHAT INFORMATION DO WE COLLECT?</li>
            <li>HOW DO WE PROCESS YOUR INFORMATION?</li>
            <li>WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</li>
            <li>WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</li>
            <li>HOW LONG DO WE KEEP YOUR INFORMATION?</li>
            <li>HOW DO WE KEEP YOUR INFORMATION SAFE?</li>
            <li>WHAT ARE YOUR PRIVACY RIGHTS?</li>
            <li>CONTROLS FOR DO-NOT-TRACK FEATURES</li>
            <li>DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</li>
            <li>DO WE MAKE UPDATES TO THIS NOTICE?</li>
            <li>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</li>
            <li>HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</li>
          </ol>

          <h3 id="collect">1. WHAT INFORMATION DO WE COLLECT?</h3>
          <p><strong>Personal information you disclose to us</strong></p>
          <p><em>In Short: We collect personal information that you provide to us.</em></p>
          <p>We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise contact us.</p>
          <p>The personal information we collect may include:</p>
          <ul>
            <li>Names</li>
            <li>Email addresses</li>
            <li>Phone numbers</li>
          </ul>
          <p><strong>Sensitive Information.</strong> We do not process sensitive information.</p>

          <h3 id="process">2. HOW DO WE PROCESS YOUR INFORMATION?</h3>
          <p><em>In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</em></p>
          <p>We process your personal information for several reasons, including:</p>
          <ul>
            <li><strong>To fulfill and manage your orders:</strong> We may process your information to manage payments, returns, and exchanges.</li>
            <li><strong>To save or protect an individual's vital interest:</strong> To prevent harm when necessary.</li>
          </ul>

          <h3 id="legal">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h3>
          <p><em>In Short: We only process your personal information when we believe it is necessary and we have a valid legal reason under applicable law.</em></p>
          <p><strong>For EU or UK users:</strong> We rely on legal bases such as Consent, Performance of a Contract, Legal Obligations, and Vital Interests.</p>
          <p><strong>For Canadian users:</strong> We may process your information with express or implied consent, or in exceptional cases where legal permission is granted (e.g., fraud prevention, business transactions, or legal requirements).</p>

          <h3 id="share">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h3>
          <p><em>In Short: We may share information in specific situations described in this section.</em></p>
          <p>We may need to share your personal information in the following situations:</p>
          <ul>
            <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of our business.</li>
          </ul>

          <h3 id="keep">5. HOW LONG DO WE KEEP YOUR INFORMATION?</h3>
          <p><em>In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this notice unless otherwise required by law.</em></p>
          <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this notice (such as tax or accounting requirements). When we have no ongoing legitimate business need, we will either delete or anonymize the information.</p>

          <h3 id="safe">6. HOW DO WE KEEP YOUR INFORMATION SAFE?</h3>
          <p><em>In Short: We aim to protect your personal information through organizational and technical security measures.</em></p>
          <p>We have implemented reasonable technical and organizational security measures. However, transmission of personal information to and from our Services is at your own risk.</p>

          <h3 id="rights">7. WHAT ARE YOUR PRIVACY RIGHTS?</h3>
          <p><em>In Short: Depending on your region, you have rights that allow you greater access to and control over your personal information.</em></p>
          <p>In regions like the EEA, UK, Switzerland, and Canada, you may have the right to request access, rectification, erasure, or to object to processing. You can withdraw your consent at any time, which will not affect the lawfulness of processing before its withdrawal.</p>
          <p><strong>Opting out of marketing:</strong> You can unsubscribe from marketing emails or reply 'STOP' to SMS messages. Note that no mobile information will be shared with third parties for marketing purposes.</p>

          <h3 id="dnt">8. CONTROLS FOR DO-NOT-TRACK FEATURES</h3>
          <p>Most web browsers include a Do-Not-Track ('DNT') feature. We do not currently respond to DNT browser signals as no uniform technology standard has been finalized.</p>

          <h3 id="us-rights">9. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h3>
          <p><em>In Short: Residents of specific states (e.g., California, Colorado, Texas, Virginia) have rights to access, correct, delete, or obtain a copy of their personal data.</em></p>
          <p>We have not disclosed, sold, or shared any personal information to third parties for commercial purposes in the preceding 12 months. California residents may also request information about categories of data shared for direct marketing under the 'Shine The Light' law.</p>

          <h3 id="updates">10. DO WE MAKE UPDATES TO THIS NOTICE?</h3>
          <p><em>In Short: Yes, we will update this notice as necessary to stay compliant with laws.</em></p>
          <p>The updated version will be indicated by a 'Revised' date. We encourage you to review this notice frequently.</p>

          <h3 id="contact">11. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h3>
          <p>If you have questions or comments, contact us by post at: <strong>AGRANEX INDUSTRIES PRIVATE LIMITED</strong>, Plot No 61, 88/74 Hindustan Compound, Jajmau, Kanpur, Uttar Pradesh, 208010.</p>

          <h3 id="review">12. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h3>
          <p>Based on applicable laws, you may have the right to request access to, correct, or delete your personal information. To make a request, please fill out and submit a data subject access request.</p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy

