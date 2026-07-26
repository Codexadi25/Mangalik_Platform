import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import logo from '../assets/Manglik.PNG'

const Navbar = () => {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    closeMobileMenu()
    
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

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container flex items-center justify-between">
        <Link to="/" className="logo" onClick={() => { closeMobileMenu(); window.scrollTo(0, 0); }}>
          <img src={logo} alt="Manglik Logo" width={154} />
        </Link>
        
        <div className={`nav-toggle ${mobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => { closeMobileMenu(); window.scrollTo(0, 0); }}>Home</Link></li>
          <li><Link to="/products" onClick={closeMobileMenu}>Products</Link></li>
          <li><a href="/#features" onClick={(e) => handleNavClick(e, 'features')}>Features</a></li>
          <li><a href="/#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a></li>
        </ul>
        
        <div className="nav-btns" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to={user ? "/account" : "/login"} className="profile-icon" onClick={closeMobileMenu} style={{ display: 'flex', alignItems: 'center', color: 'var(--secondary)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
          <Link to="/products" className="btn btn-primary shop-now-btn" onClick={closeMobileMenu}>Shop Now</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar