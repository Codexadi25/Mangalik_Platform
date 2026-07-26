import React, { useState } from 'react'
import contactImg from '../assets/images/pooja/thali.png'
import { Whatsapp } from '@boxicons/js'

const Contact = () => {
  const [status, setStatus] = useState(''); // '', 'sending', 'success', 'error'
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    
    const form = e.target;
    const formData = new FormData(form);
    
    try {
      // REPLACE 'YOUR_FORM_ID' with your actual Formspree ID
      const response = await fetch('https://formspree.io/f/mpqbgvld', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const renderIcon = (iconObj, pack = null) => {
    const p = pack || iconObj.defaultPack;
    const packData = iconObj.packs[p];
    return (
      <svg 
        viewBox={packData.viewBox} 
        fill="currentColor" 
        style={{ width: '100%', height: '100%' }}
        dangerouslySetInnerHTML={{ __html: packData.content }}
      />
    );
  };

  return (
    <section id="contact" className="contact-section section-padding">
      <div className="container flex items-center" style={{ justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
        <div className="contact-card">
          <h2>Get in <span className="highlight">Touch</span></h2>
          <p>Have questions? Send us a message and we'll get back to you shortly.</p>
          
          <form className="contact-form" onSubmit={handleSubmit}>
            {status === 'success' ? (
              <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '20px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', border: '1px solid #c3e6cb' }}>
                <h3 style={{ margin: 0 }}>Message Sent!</h3>
                <p style={{ margin: '10px 0 0' }}>Thank you for reaching out. We'll get back to you shortly.</p>
                <button onClick={() => setStatus('')} className="btn btn-outline" style={{ marginTop: '15px', padding: '5px 15px', fontSize: '0.8rem' }}>Send another message</button>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" name="firstName" placeholder="John" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" name="lastName" placeholder="Doe" required />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="john@example.com" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Contact No.</label>
                    <input type="tel" id="phone" name="phone" placeholder="+91 99999 99999" required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows="4" placeholder="How can we help?"></textarea>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary w-full" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending...' : 'Send Response'}
                  </button>
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>- or -</div>
                  <a 
                    href="#" 
                    className="btn" 
                    style={{ 
                      backgroundColor: '#25D366', 
                      color: '#fff', 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      gap: '10px', 
                      border: 'none', 
                      borderRadius: '50px', 
                      boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center' }}>
                      {renderIcon(Whatsapp)}
                    </span>
                    WhatsApp Chat
                  </a>
                </div>
                {status === 'error' && (
                  <p style={{ color: '#721c24', fontSize: '0.8rem', textAlign: 'center', marginTop: '10px' }}>
                    Oops! There was a problem. Please try again or use WhatsApp.
                  </p>
                )}
              </>
            )}
          </form>
        </div>
        
        <div className="contact-image">
          <img src={contactImg} alt="Contact Us" style={{ mixBlendMode: 'multiply' }} />
        </div>
      </div>
    </section>
  )
}

export default Contact
