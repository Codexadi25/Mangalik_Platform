import React from 'react'
const makeInIndiaImg = "https://placehold.co/90x90/white/black?text=Make+In+India";

const features = [
  { id: 1, title: '100% Organic', desc: 'No artificial chemicals or synthetic additives.', icon: '🌿' },
  { id: 2, title: 'Premium Quality', desc: 'Handpicked and crafted by expert artisans.', icon: '🙏' },
  { id: 3, title: 'Pure & Sacred', desc: 'Perfect for all your devotional needs.', icon: '🪔' },
  { id: 4, title: 'Make in India', desc: 'Proudly Indian for every devotee.', icon: <img src={makeInIndiaImg} alt="Make in India" style={{width: '90px', height: 'auto', objectFit: 'contain'}} /> },
]

const Features = () => {
  return (
    <section id="features" className="features-section section-padding">
      <div className="container">
        <div className="text-center">
          <h2 style={{fontSize: '2.5rem', marginBottom: '15px'}}>Why Choose <span style={{color: 'var(--primary)'}}>Us?</span></h2>
          <p style={{color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto'}}>We are committed to providing the highest quality pooja essentials for your devotion.</p>
        </div>
        <div className="features-grid">
          {features.map(feature => (
            <div key={feature.id} className="feature-item">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p style={{color: 'var(--text-muted)'}}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
