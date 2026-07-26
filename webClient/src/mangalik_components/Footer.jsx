import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/Manglik.PNG'
import { 
  Instagram, 
  Threads, 
  Linkedin, 
  TwitterX, 
  Facebook, 
  Phone, 
  Whatsapp 
} from '@boxicons/js'
const Footer = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    
    if (location.pathname !== '/') {
      navigate('/#' + targetId)
    } else {
      const element = document.getElementById(targetId)
      if (element) {
        const yOffset = -80
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset
        window.scrollTo({ top: y, behavior: 'smooth' })
        window.history.pushState(null, '', '/#' + targetId)
      }
    }
  }

  const renderIcon = (iconObj, pack = null) => {
    const p = pack || iconObj.defaultPack;
    const packData = iconObj.packs[p];
    return (
      <svg 
        viewBox={packData.viewBox} 
        fill="currentColor" 
        dangerouslySetInnerHTML={{ __html: packData.content }}
      />
    );
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              <img src={logo} alt="Logo" width={120} style={{filter: 'brightness(0) invert(1)', marginBottom: '20px'}} />
            </Link>
            <p style={{color: 'rgba(255,255,255,0.7)', marginBottom: '20px'}}>Providing the finest pooja essentials for your devotion. Your spiritual journey is our top priority.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/products" onClick={() => window.scrollTo(0,0)}>Shop</Link></li>
              <li><Link to="/products" onClick={() => window.scrollTo(0,0)}>Products</Link></li>
              <li><a href="/#features" onClick={(e) => handleNavClick(e, 'features')} style={{cursor: 'pointer'}}>Features</a></li>
              <li><a href="/#contact" onClick={(e) => handleNavClick(e, 'contact')} style={{cursor: 'pointer'}}>Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Our Policies</h4>
            <ul>
              <li><Link to="/privacy-policy" onClick={() => window.scrollTo(0,0)}>Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" onClick={() => window.scrollTo(0,0)}>Terms & Conditions</Link></li>
              <li><Link to="/shipping-return" onClick={() => window.scrollTo(0,0)}>Shipping & Returns</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul>
              <li style={{marginBottom: '15px'}}>
                <a href="tel:+919999999999" style={{color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none'}}>
                  <span className="social-icon" style={{width: '32px', height: '32px'}}>
                    {renderIcon(Phone, 'filled')}
                  </span>
                  +91 99999 99999
                </a>
              </li>
              <li style={{marginBottom: '15px'}}>
                <a href="#" style={{color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none'}}>
                  <span className="social-icon" style={{width: '32px', height: '32px'}}>
                    {renderIcon(Whatsapp)}
                  </span>
                  WhatsApp Chat
                </a>
              </li>
              <li style={{marginBottom: '10px'}}>
                <a href="mailto:support@manglik.com" style={{color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px'}}>
                  ✉️ Customers: support@manglik.com
                </a>
              </li>
              <li>
                <a href="mailto:business@manglik.com" style={{color: 'rgba(255,255,255,0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px'}}>
                  ✉️ Business: business@manglik.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MANGLIK INDUSTRIES PVT. LTD. - Brand Name: MANGLIK. All rights reserved</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
