import React from 'react'
const defaultAvatar = "https://placehold.co/50x50/ccc/white?text=User";

const reviews = [
  { id: 1, name: 'Aarav Sharma', rating: 5, review: 'The quality of the pooja samagri is excellent. Highly recommended!', img: defaultAvatar },
  { id: 2, name: 'Isha Patel', rating: 5, review: 'Beautifully crafted diyas. Perfect for my daily prayers.', img: defaultAvatar },
  { id: 3, name: 'Rahul Verma', rating: 4, review: 'Good packaging and timely delivery. Very satisfied.', img: defaultAvatar },
  { id: 4, name: 'Ananya Reddy', rating: 5, review: 'I finally found authentic pooja items that feel pure. Thank you Mangalik!', img: defaultAvatar },
]

const Reviews = () => {
  return (
    <section className="reviews-section section-padding">
      <div className="container">
        <div className="text-center">
          <h2 style={{fontSize: '3rem', marginBottom: '15px'}}>What our <span className="highlight" style={{color: 'var(--primary)'}}>Customers Say</span></h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '50px'}}>Real stories from happy pet parents across India.</p>
        </div>
        
        <div className="reviews-grid">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-img">
                  <img src={review.img} alt={review.name} />
                </div>
                <div className="review-info">
                  <h4>{review.name}</h4>
                  <div className="stars">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i} style={{ color: '#FFD700' }}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="review-text">"{review.review}"</p>
            </div>
          ))}
        </div>

        <div className="text-center" style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <a href="#" className="btn btn-primary">Submit a Review</a>
        </div>
      </div>
    </section>
  )
}

export default Reviews
