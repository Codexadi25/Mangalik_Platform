import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { poojaProducts } from '../data/products'
  const Products = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const isPaused = useRef(false);
  const timeoutRef = useRef(null);

  const combinedProducts = [...poojaProducts];

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
    let step = window.innerWidth <= 768 ? 1.2 : 1; // 20% faster on mobile
    const intervalTime = 20; // ms

    const handleResize = () => {
      step = window.innerWidth <= 768 ? 1.2 : 1;
    };
    window.addEventListener('resize', handleResize);

    const scrollInterval = setInterval(() => {
      if (isPaused.current) return;
      
      scrollAmount += step;
      if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollAmount = 0;
      }
      scrollContainer.scrollTo({
        left: scrollAmount,
        behavior: 'auto'
      });
    }, intervalTime);

    return () => {
      clearInterval(scrollInterval);
      window.removeEventListener('resize', handleResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <section id="products" className="section-padding products-section">
      <div className="container">
        <div className="text-center">
          <h2 style={{fontSize: '3rem', marginBottom: '15px'}}>Our top <span style={{color: 'var(--primary)'}}>Products</span></h2>
          <p style={{color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '40px'}}>the best sellers in our each category</p>
        </div>
        <div className="products-scroll-container" ref={scrollRef}>
          <div className="products-track">
            {/* Duplicate products for a smoother infinite-looking scroll */}
            {[...combinedProducts, ...combinedProducts].map((product, index) => (
              <div 
                key={`${product.id}-${index}`} 
                className="product-card"
                onMouseEnter={handleMouseEnter}
              >
                <img src={product.img} alt={product.name} />
                <h3>{product.name}</h3>
                <button className="btn btn-outline" onClick={() => navigate(`/product/${product.id}`)} style={{marginTop: '20px', width: '100%'}}>Buy now</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Products
