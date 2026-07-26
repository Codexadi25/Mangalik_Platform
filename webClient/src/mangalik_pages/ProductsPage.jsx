import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { poojaProducts } from '../data/products';

const ProductsPage = () => {
  const [activeTab, setActiveTab] = useState('Pooja Samagri');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProducts = poojaProducts.filter(p => p.category === activeTab);

  return (
    <div className="products-page section-padding" style={{ minHeight: '80vh', paddingTop: '120px' }}>
      <div className="container">
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '15px' }}>Our <span style={{ color: 'var(--primary)' }}>Products</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Browse our premium selection of devotional essentials.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
          <button 
            className={`btn ${activeTab === 'Pooja Samagri' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('Pooja Samagri')}
          >
            Pooja Samagri
          </button>
          <button 
            className={`btn ${activeTab === 'Items' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('Items')}
          >
            Items
          </button>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <img src={product.img} alt={product.name} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', marginTop: 'auto' }}>{product.name}</h3>
              <p style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '15px', fontSize: '1.1rem' }}>{product.price}</p>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate(`/product/${product.id}`)} 
                style={{ width: '100%' }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center" style={{ padding: '40px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
