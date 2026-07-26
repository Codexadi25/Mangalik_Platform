import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../../redux/slices/authSlice";

const MainLayout = ({ children }) => {
  const dispatch = useDispatch();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showSearchButton, setShowSearchButton] = useState(true);

  const cartCount = useSelector((s) => s.cart.items?.length || 0);
  const user = useSelector((s) => s.auth.user);

  const [logo, setLogo] = useState("/Mangalik.png");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || "https://api.mangalik.store/api"}/business-settings/public`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data?.logoUrl) {
          setLogo(resData.data.logoUrl);
        }
      })
      .catch(() => {
        setLogo("/Mangalik.png");
      });
  }, []);

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
        setShowSearchButton(false);
      } else {
        setScrolled(false);
        setShowSearchButton(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetch(`${import.meta.env.VITE_API_BASE_URL || "https://api.mangalik.store/api"}/products?q=${encodeURIComponent(searchQuery)}&limit=5`)
        .then(res => res.json())
        .then(res => {
          if (res.success && res.data) {
            setSuggestions(res.data);
          }
        })
        .catch(err => console.error("Search suggestion error", err));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".search-container")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    closeMobileMenu();

    if (location.pathname !== "/") {
      navigate("/#" + targetId);
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        window.history.pushState(null, "", "/#" + targetId);
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ---------- Header / Navbar ---------- */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container flex items-center justify-between">
          <RouterLink to="/" className="logo" onClick={() => { closeMobileMenu(); window.scrollTo(0, 0); }}>
            <img 
              src={logo} 
              alt="Mangalik Logo" 
              width={154} 
              onError={(e) => {
                e.target.src = "/Mangalik.png";
              }}
            />
          </RouterLink>

          {/* SearchBar with Auto-Suggestions hints */}
          <div className="search-container desktop-search-container" style={{ position: "relative", flex: "0 1 350px", margin: "0 20px" }}>
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <input
                type="text"
                placeholder="Search items, description, or tags..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                style={{
                  width: "100%",
                  padding: "8px 36px 8px 16px",
                  borderRadius: "20px",
                  border: "1.5px solid var(--border-color, #e2e8f0)",
                  outline: "none",
                  fontSize: "0.9rem",
                  backgroundColor: "var(--light-bg, #f8fafc)",
                  color: "#334155"
                }}
              />
              <button type="submit" style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--primary)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="search-suggestions" style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                border: "1.5px solid #e2e8f0",
                borderRadius: "8px",
                marginTop: "6px",
                padding: "6px 0",
                listStyle: "none",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                zIndex: 1100
              }}>
                {suggestions.map((item) => (
                  <li key={item._id}>
                    <RouterLink
                      to={`/products/${item.slug}`}
                      onClick={() => { setShowSuggestions(false); setSearchQuery(""); }}
                      style={{
                        display: "block",
                        padding: "8px 16px",
                        fontSize: "0.85rem",
                        color: "#334155",
                        textDecoration: "none",
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = "#f1f5f9"}
                      onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      {item.title}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={`nav-toggle ${mobileMenuOpen ? "active" : ""}`} onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <li>
              <RouterLink to="/" onClick={() => { closeMobileMenu(); window.scrollTo(0, 0); }}>
                Home
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/products" onClick={closeMobileMenu}>
                Products
              </RouterLink>
            </li>
            <li>
              <a href="/#features" onClick={(e) => handleNavClick(e, "features")}>
                Features
              </a>
            </li>
            <li>
              <a href="/#contact" onClick={(e) => handleNavClick(e, "contact")}>
                Contact
              </a>
            </li>
          </ul>

          <div className="nav-btns" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <RouterLink
              to={user ? "/account" : "/login"}
              className="profile-icon"
              onClick={closeMobileMenu}
              style={{ display: "flex", alignItems: "center", color: "var(--secondary)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </RouterLink>

            {user && (
              <button
                className="logout-nav-btn"
                onClick={handleLogout}
                title="Logout"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                  marginLeft: "8px"
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            )}

            <RouterLink
              to="/cart"
              className="cart-icon-btn"
              onClick={closeMobileMenu}
              style={{ display: "flex", alignItems: "center", color: "var(--secondary)", position: "relative" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-10px",
                    backgroundColor: "var(--primary)",
                    color: "white",
                    borderRadius: "50%",
                    padding: "2px 6px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </RouterLink>

            <RouterLink to="/products" className="btn btn-primary shop-now-btn" onClick={closeMobileMenu}>
              Shop Now
            </RouterLink>
          </div>
        </div>

        {/* Mobile Search Bar (Expands below brand logo) */}
        <div className={`mobile-search-bar-expanded ${mobileSearchOpen ? "open" : ""}`}>
          <div className="search-container" style={{ position: "relative", width: "100%" }}>
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <input
                type="text"
                placeholder="Search items, description, or tags..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                style={{
                  width: "100%",
                  padding: "8px 36px 8px 16px",
                  borderRadius: "20px",
                  border: "1.5px solid var(--border-color, #e2e8f0)",
                  outline: "none",
                  fontSize: "0.9rem",
                  backgroundColor: "#f8fafc",
                  color: "#334155"
                }}
              />
              <button type="submit" style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--primary)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="search-suggestions" style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                border: "1.5px solid #e2e8f0",
                borderRadius: "8px",
                marginTop: "6px",
                padding: "6px 0",
                listStyle: "none",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                zIndex: 1100
              }}>
                {suggestions.map((item) => (
                  <li key={item._id}>
                    <RouterLink
                      to={`/products/${item.slug}`}
                      onClick={() => { setShowSuggestions(false); setSearchQuery(""); setMobileSearchOpen(false); }}
                      style={{
                        display: "block",
                        padding: "8px 16px",
                        fontSize: "0.85rem",
                        color: "#334155",
                        textDecoration: "none",
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = "#f1f5f9"}
                      onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
                    >
                      {item.title}
                    </RouterLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </nav>

      {/* ---------- Main Content ---------- */}
      <main style={{ flex: 1, paddingTop: scrolled ? "80px" : "100px" }}>
        {children}
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <RouterLink to="/" onClick={() => window.scrollTo(0, 0)}>
                <img 
                  src={logo} 
                  alt="Mangalik Logo" 
                  width={154} 
                  style={{ marginBottom: "20px" }} 
                  onError={(e) => {
                    e.target.src = "/Mangalik.png";
                  }}
                />
              </RouterLink>
              <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>
                Providing the finest pooja essentials for your devotion. Your spiritual journey is our priority.
              </p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <RouterLink to="/products" onClick={() => window.scrollTo(0, 0)}>
                    Shop
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/products" onClick={() => window.scrollTo(0, 0)}>
                    Products
                  </RouterLink>
                </li>
                <li>
                  <a href="/#features" onClick={(e) => handleNavClick(e, "features")} style={{ cursor: "pointer" }}>
                    Features
                  </a>
                </li>
                <li>
                  <a href="/#contact" onClick={(e) => handleNavClick(e, "contact")} style={{ cursor: "pointer" }}>
                    Contact
                  </a>
                </li>
                <li>
                  <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" style={{ cursor: "pointer", color: "var(--primary)", fontWeight: "bold" }}>
                    Open Dashboard
                  </a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Our Policies</h4>
              <ul>
                <li>
                  <RouterLink to="/privacy-policy" onClick={() => window.scrollTo(0, 0)}>
                    Privacy Policy
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/terms-and-conditions" onClick={() => window.scrollTo(0, 0)}>
                    Terms & Conditions
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/shipping-policy" onClick={() => window.scrollTo(0, 0)}>
                    Shipping & Returns
                  </RouterLink>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact Us</h4>
              <ul>
                <li style={{ marginBottom: "15px" }}>
                  <a
                    href="tel:+919999999999"
                    style={{ color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}
                  >
                    <span className="social-icon" style={{ width: "32px", height: "32px" }}>
                      📞
                    </span>
                    +91 99999 99999
                  </a>
                </li>
                <li style={{ marginBottom: "15px" }}>
                  <a
                    href="https://wa.me/919999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}
                  >
                    <span className="social-icon" style={{ width: "32px", height: "32px" }}>
                      💬
                    </span>
                    WhatsApp Chat
                  </a>
                </li>
                <li style={{ marginBottom: "10px" }}>
                  <a href="mailto:customersupport@mangalik.com" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                    ✉️ Customers: customersupport@mangalik.com
                  </a>
                </li>
                <li>
                  <a href="mailto:businessrelations@mangalik.com" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                    ✉️ Business: businessrelations@mangalik.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} MANGLIK INDUSTRIES PVT. LTD. - Brand Name: MANGLIK. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating search button for mobile screens */}
      {showSearchButton && (
        <div className="mobile-search-trigger-btn" onClick={() => setMobileSearchOpen(!mobileSearchOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
