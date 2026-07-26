import React, { useState, useEffect } from 'react'
import comparisonImg from '../assets/images/pooja/diya.png'

const cardData = [
  {
    id: 1,
    title: 'Sacred Quality You Can Trust',
    content: "Our pooja items cannot be compromised on any level, especially when it comes to the core of the materials used. We ensure that every product, from agarbattis to diyas, is made with pure and sacred ingredients. Your devotion deserves the most premium quality essentials."
  },
  {
    id: 2,
    title: 'Designed for a Long-Lasting Experience',
    content: 'While the majority of incense and dhoop sticks currently available burn out quickly, we strive to create a more durable product that gives you enough time for your prayers. Our unique manufacturing methods offer high-quality items that encourage a peaceful, long-lasting aroma.'
  },
  {
    id: 3,
    title: 'Smoke-Free & Pure Fragrance',
    content: "When it comes to the aroma, we know how important it is for you. Therefore, we managed to develop a special preparation method that makes our products produce less smoke while delivering a pure, divine fragrance. You can enjoy your prayers without worrying about a harsh environment."
  }
]

const WhyChooseUs = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    let interval;
    if (!isHovered) {
      interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % cardData.length)
      }, 5000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isHovered])

  return (
    <section id="why-us" className="why-choose-us section-padding">
      <div className="container">
        <div className="text-center" style={{marginBottom: '60px'}}>
          <h2 style={{fontSize: '3rem', marginBottom: '15px'}}>What makes <span style={{color: 'var(--primary)'}}>us</span> different?</h2>
        </div>

        <div className="wcu-layout">
          <div className="wcu-cards-wrapper">
            <div 
              className="wcu-cards-container"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Invisible dummy card to force container height dynamically based on longest text + stack offset */}
              <div className="wcu-card" style={{ position: 'relative', visibility: 'hidden', zIndex: -1, marginBottom: '50px' }}>
                <h3>{cardData[0].title}</h3>
                <p>{cardData[0].content}</p>
              </div>

              {cardData.map((card, index) => {
                const diff = (index - activeIndex + cardData.length) % cardData.length
                
                const cardStyle = {
                  filter: diff === 0 ? 'none' : `blur(${diff * 1}px)`,
                  opacity: diff === 0 ? 1 : 0.95 - diff * 0.05,
                  cursor: 'pointer'
                }

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
                )
              })}
            </div>
            
            {/* Navigation Dots - Now outside the card container */}
            <div className="wcu-dots">
              {cardData.map((_, index) => (
                <div 
                  key={index} 
                  className={`wcu-dot ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>
          <div className="wcu-image">
            <img src={comparisonImg} alt="Comparison" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
