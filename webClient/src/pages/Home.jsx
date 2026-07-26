import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { fetchProducts } from "../redux/slices/productSlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { getProductImageUrl } from "../utils/imageHelper";

import incenseImg from "../assets/images/pooja/incense.png";
import diyaImg from "../assets/images/pooja/diya.png";
import thaliImg from "../assets/images/pooja/thali.png";

const whyChooseUsData = [
  {
    id: 1,
    title: "Smoke-Free & Pure Fragrance",
    content: "When it comes to the aroma, we strictly select what is healthy for you. Therefore, we managed to create a special formulation method that makes our products shadow-free and smoke-free in delivering a pure fragrance. You can enjoy your prayers without worrying about smoke and irritants.",
  },
  {
    id: 2,
    title: "Sacred Quality You Can Trust",
    content: "Our pooja items cannot be compromised on any level, especially when it comes to the core of the materials used. We ensure that every product, from agarbattis to diyas, is made with pure and sacred ingredients. Your devotion deserves the most premium quality essentials.",
  },
  {
    id: 3,
    title: "Designed for a Long-Lasting Experience",
    content: "While the majority of incense and dhoop sticks currently available burn out quickly, we strive to create a more durable product that gives you enough time for your prayers. Our unique manufacturing methods offer high-quality items that encourage a peaceful, long-lasting aroma.",
  },
];

const features = [
  { id: 1, title: "100% Organic", desc: "No artificial chemicals or synthetic additives.", icon: "🌿" },
  { id: 2, title: "Premium Quality", desc: "Handpicked and crafted by expert artisans.", icon: "🙏" },
  { id: 3, title: "Pure & Sacred", desc: "Perfect for all your devotional needs.", icon: "🪔" },
  { id: 4, title: "Made In India", desc: "Proudly Indian for every devotee.", icon: "🇮🇳" },
];

const reviews = [
  { id: 1, name: "Aarav Sharma", rating: 5, review: "The purity of the incense is matchless. Highly recommended!" },
  { id: 2, name: "Isha Patel", rating: 5, review: "Beautiful crafting and design. Perfect for my daily prayers." },
  { id: 3, name: "Rahul Verma", rating: 5, review: "Loved packaging and fast delivery. Very reliable." },
  { id: 4, name: "Ananya Reddy", rating: 5, review: "Finally found genuine pooja items that feel authentic. Thank you, Mangalik!" },
];

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: categories, status: catStatus } = useSelector((state) => state.category);
  const { items: products, status: prodStatus } = useSelector((state) => state.products);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [contactStatus, setContactStatus] = useState(""); // '', 'sending', 'success', 'error'

  const scrollRef = useRef(null);
  const isPaused = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (catStatus === "idle") {
      dispatch(fetchCategories());
    }
    dispatch(fetchProducts());
  }, [dispatch, catStatus]);

  // Auto-scroll products track logic
  const handleMouseEnter = () => {
    isPaused.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isPaused.current = false;
    }, 1500);
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollAmount = 0;
    let step = window.innerWidth <= 768 ? 1.2 : 1;
    const intervalTime = 20;

    const handleResize = () => {
      step = window.innerWidth <= 768 ? 1.2 : 1;
    };
    window.addEventListener("resize", handleResize);

    const scrollInterval = setInterval(() => {
      if (isPaused.current) return;

      scrollAmount += step;
      if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollAmount = 0;
      }
      scrollContainer.scrollTo({
        left: scrollAmount,
        behavior: "auto",
      });
    }, intervalTime);

    return () => {
      clearInterval(scrollInterval);
      window.removeEventListener("resize", handleResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [products]);

  // Stack slider rotation logic
  useEffect(() => {
    let interval;
    if (!isHovered) {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % whyChooseUsData.length);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus("sending");
    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mpqbgvld", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setContactStatus("success");
        form.reset();
      } else {
        setContactStatus("error");
      }
    } catch (error) {
      setContactStatus("error");
    }
  };

  // Helper to fallback to static items if no products are fetched from backend
  const displayProducts = products && products.length > 0 ? products : [
    { _id: "1", title: "Premium Sandalwood Agarbatti", slug: "premium-sandalwood-agarbatti", images: [{ url: incenseImg }] },
    { _id: "2", title: "Complete Pooja Thali Set", slug: "complete-pooja-thali-set", images: [{ url: thaliImg }] },
    { _id: "3", title: "Premium Sandalwood Agarbatti", slug: "premium-sandalwood-agarbatti-2", images: [{ url: incenseImg }] },
    { _id: "4", title: "Complete Pooja Thali Set", slug: "complete-pooja-thali-set-2", images: [{ url: thaliImg }] },
  ];

  return (
    <>
      <Helmet>
        <title>Mangalik — Bring Devotion to Your Home | A-Z Poojan Samagri</title>
        <meta
          name="description"
          content="Shop authentic poojan samagri online at Mangalik — Rudra Abhishek kits, hawan items, idols, incense, and festival specials. Fast, trusted, doorstep delivery across India."
        />
        <link rel="canonical" href="https://www.mangalik.store/" />
      </Helmet>

      {/* ---------- Hero Section ---------- */}
      <section className="hero" style={{ display: "flex", alignItems: "center", minHeight: "80vh" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center" }}>
          <div className="hero-content" style={{ flex: "1 1 500px" }}>
            <h1 style={{ fontWeight: 700, marginBottom: "20px" }}>
              Bring Devotion to Your <span style={{ color: "var(--primary)" }}>Home.</span>
            </h1>
            <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "40px", lineHeight: "1.6" }}>
              Because your spiritual journey deserves the best. Give your pooja space the purity they deserve with our 100% natural, handcrafted essentials.
            </p>
            <div className="hero-btns" style={{ display: "flex", gap: "20px" }}>
              <RouterLink to="/products" className="btn btn-primary">
                Shop Now
              </RouterLink>
              <a href="#features" className="btn btn-outline">
                Learn More
              </a>
            </div>
          </div>
          <div className="hero-image" style={{ flex: "1 1 400px", display: "flex", justifyContent: "center" }}>
            <img
              src={incenseImg}
              alt="Pooja Altar Devotion"
              style={{
                width: "100%",
                maxWidth: "500px",
                borderRadius: "24px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ---------- Products Section ---------- */}
      <section id="products" className="section-padding products-section">
        <div className="container">
          <div className="text-center">
            <h2 style={{ fontSize: "3rem", marginBottom: "15px" }}>
              Our top <span style={{ color: "var(--primary)" }}>Products</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.2rem", marginBottom: "40px" }}>
              The best sellers in our store category
            </p>
          </div>
          <div className="products-scroll-container" ref={scrollRef}>
            <div className="products-track">
              {/* Duplicate products for smooth looping */}
              {[...displayProducts, ...displayProducts].map((product, index) => (
                <div key={`${product._id}-${index}`} className="product-card" onMouseEnter={handleMouseEnter}>
                  <img src={getProductImageUrl(product.images?.[0]?.url)} alt={product.title} />
                  <h3>{product.title}</h3>
                  <button className="btn btn-outline" onClick={() => navigate(`/products/${product.slug}`)} style={{ marginTop: "20px", width: "100%" }}>
                    Buy now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Why Choose Us Section ---------- */}
      <section id="features" className="features-section section-padding">
        <div className="container">
          <div className="text-center">
            <h2 style={{ fontSize: "3rem", marginBottom: "15px" }}>
              Why Choose <span style={{ color: "var(--primary)" }}>Us?</span>
            </h2>
            <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 50px" }}>
              We are committed to providing the highest quality pooja products for your devotion.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature) => (
              <div key={feature.id} className="feature-item">
                <div className="feature-icon" style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p style={{ color: "var(--text-muted)" }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- What Makes Us Different Section ---------- */}
      <section id="why-us" className="why-choose-us section-padding" style={{ backgroundColor: "var(--white)" }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: "60px" }}>
            <h2 style={{ fontSize: "3rem", marginBottom: "15px" }}>
              What makes <span style={{ color: "var(--primary)" }}>us</span> different?
            </h2>
          </div>

          <div className="wcu-layout" style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "center" }}>
            <div className="wcu-cards-wrapper" style={{ flex: "1 1 500px" }}>
              <div
                className="wcu-cards-container"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ position: "relative", minHeight: "250px" }}
              >
                {/* Dummy card to keep height dynamic */}
                <div className="wcu-card" style={{ position: "relative", visibility: "hidden", zIndex: -1, marginBottom: "30px" }}>
                  <h3>{whyChooseUsData[0].title}</h3>
                  <p>{whyChooseUsData[0].content}</p>
                </div>

                {whyChooseUsData.map((card, index) => {
                  const diff = (index - activeIndex + whyChooseUsData.length) % whyChooseUsData.length;
                  const cardStyle = {
                    filter: diff === 0 ? "none" : `blur(${diff * 1.5}px)`,
                    opacity: diff === 0 ? 1 : 0.9 - diff * 0.1,
                    cursor: "pointer",
                  };

                  return (
                    <div
                      key={card.id}
                      className={`wcu-card card-slot-${diff}`}
                      style={cardStyle}
                      onClick={() => setActiveIndex(index)}
                    >
                      <h3>{card.title}</h3>
                      <p>{card.content}</p>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Dots */}
              <div className="wcu-dots" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                {whyChooseUsData.map((_, index) => (
                  <div
                    key={index}
                    className={`wcu-dot ${index === activeIndex ? "active" : ""}`}
                    onClick={() => setActiveIndex(index)}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: index === activeIndex ? "var(--primary)" : "#ccc",
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="wcu-image" style={{ flex: "1 1 400px", display: "flex", justifyContent: "center" }}>
              <img src={diyaImg} alt="Pooja Diya" style={{ width: "100%", maxWidth: "450px", borderRadius: "24px" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Reviews Section ---------- */}
      <section className="reviews-section section-padding" style={{ backgroundColor: "var(--bg-light)" }}>
        <div className="container">
          <div className="text-center">
            <h2 style={{ fontSize: "3rem", marginBottom: "15px" }}>
              What our <span style={{ color: "var(--primary)" }}>Customers Say</span>
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "50px" }}>Real stories from happy and satisfied devotees across India.</p>
          </div>

          <div className="reviews-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" }}>
            {reviews.map((review) => (
              <div key={review.id} className="review-card" style={{ backgroundColor: "var(--white)", padding: "30px", borderRadius: "var(--border-radius-lg)" }}>
                <div className="review-header" style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                  <div
                    className="review-img"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      backgroundColor: "#ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {review.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="review-info">
                    <h4 style={{ margin: 0 }}>{review.name}</h4>
                    <div className="stars" style={{ color: "#FFD700" }}>
                      {"★".repeat(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="review-text" style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
                  "{review.review}"
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "50px", display: "flex", justifyContent: "center" }}>
            <button className="btn btn-primary">Submit a Review</button>
          </div>
        </div>
      </section>

      {/* ---------- Contact / Get In Touch Section ---------- */}
      <section id="contact" className="contact-section section-padding">
        <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: "80px", alignItems: "center" }}>
          <div className="contact-card" style={{ flex: "1 1 450px", maxWidth: "550px" }}>
            <h2>
              Get in <span style={{ color: "var(--primary)" }}>Touch</span>
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "40px" }}>
              Have questions? Write to us, and we'll get back to you as soon as possible.
            </p>

            <form className="contact-form" onSubmit={handleContactSubmit}>
              {contactStatus === "success" ? (
                <div
                  style={{
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    padding: "20px",
                    borderRadius: "10px",
                    textAlign: "center",
                    marginBottom: "20px",
                    border: "1px solid #c3e6cb",
                  }}
                >
                  <h3 style={{ margin: 0 }}>Message Sent!</h3>
                  <p style={{ margin: "10px 0 0" }}>Thank you for reaching out. We will get back to you shortly.</p>
                  <button onClick={() => setContactStatus("")} className="btn btn-outline" style={{ marginTop: "15px", padding: "5px 15px", fontSize: "0.8rem" }}>
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="form-row" style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="firstName">First Name</label>
                      <input type="text" id="firstName" name="firstName" placeholder="John" required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="lastName">Last Name</label>
                      <input type="text" id="lastName" name="lastName" placeholder="Doe" required />
                    </div>
                  </div>

                  <div className="form-row" style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="email">Email</label>
                      <input type="email" id="email" name="email" placeholder="john@example.com" required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label htmlFor="phone">Contact No.</label>
                      <input type="tel" id="phone" name="phone" placeholder="+91 99999 99999" required />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" rows="4" placeholder="How can we help?"></textarea>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px" }} disabled={contactStatus === "sending"}>
                      {contactStatus === "sending" ? "Sending..." : "Send Message"}
                    </button>
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>- or -</div>
                    <a
                      href="https://wa.me/919999999999"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        backgroundColor: "#25D366",
                        color: "#fff",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px",
                        border: "none",
                        borderRadius: "50px",
                        boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)",
                        textDecoration: "none",
                        fontSize: "1rem",
                        fontWeight: "600",
                        padding: "14px",
                      }}
                    >
                      💬 WhatsApp Chat
                    </a>
                  </div>
                  {contactStatus === "error" && (
                    <p style={{ color: "#721c24", fontSize: "0.85rem", textAlign: "center", marginTop: "10px" }}>
                      Oops! There was a problem. Please try again.
                    </p>
                  )}
                </>
              )}
            </form>
          </div>

          <div className="contact-image" style={{ flex: "1 1 400px", display: "flex", justifyContent: "center" }}>
            <img src={thaliImg} alt="Pooja Thali" style={{ width: "100%", maxWidth: "450px", borderRadius: "24px" }} />
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
