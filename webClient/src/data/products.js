import incenseImg from '../assets/images/pooja/incense.png'
import diyaImg from '../assets/images/pooja/diya.png'
import thaliImg from '../assets/images/pooja/thali.png'

export const poojaProducts = [
  { 
    id: 1, 
    name: 'Premium Sandalwood Agarbatti', 
    desc: 'Experience divine tranquility with our premium sandalwood incense sticks. Handcrafted with pure sandalwood powder and natural essential oils, these agarbattis produce a soothing, long-lasting aroma with minimal smoke.', 
    category: 'Pooja Samagri',
    img: incenseImg,
    images: [incenseImg],
    price: '₹250.00',
    unit: '100g',
    rating: 4.8,
    reviews: 120,
    brand: 'MANGLIK',
    features: [
      'LONG-LASTING AROMA: Fills your space with a calming and spiritual fragrance that lasts for hours.',
      '100% NATURAL: Crafted with pure sandalwood, free from charcoal and harmful chemicals.',
      'SMOKE-FREE EXPERIENCE: Specially formulated to produce minimal smoke, perfect for indoor use.',
      'HOLISTIC WELLNESS: Aids in meditation, stress relief, and purifying the environment.'
    ],
    ingredients: 'Natural Sandalwood Powder, Essential Oils, Bamboo Stick, Natural Resins.',
    nutritionalFacts: ['Burn Time: 45 minutes per stick', 'Length: 9 inches', 'Quantity: 50 sticks', 'Eco-friendly: Yes'],
    feedingGuide: ['Light the coated end and place securely in an incense holder.', 'Keep away from flammable materials.', 'Ensure proper ventilation.', 'Do not leave unattended.'],
    amazonLink: '#',
    flipkartLink: '#'
  },
  { 
    id: 2, 
    name: 'Sacred Brass Akhand Diya', 
    desc: 'Illuminate your pooja room with our beautifully crafted Brass Akhand Diya. Made from premium quality brass, this diya is designed to hold oil for long durations, ensuring an uninterrupted flame for your daily prayers.', 
    category: 'Items',
    img: diyaImg,
    images: [diyaImg],
    price: '₹450.00',
    unit: '1 piece',
    rating: 4.9,
    reviews: 215,
    brand: 'MANGLIK',
    features: [
      'PREMIUM BRASS: Made from heavy-duty, pure brass for durability and a brilliant shine.',
      'LONG-LASTING FLAME: Deep bowl design allows for more oil capacity and longer burn time.',
      'EASY TO CLEAN: Detachable parts make it easy to clean and maintain.',
      'ELEGANT DESIGN: Traditional aesthetics that enhance the beauty of your altar.'
    ],
    ingredients: '100% Pure Brass.',
    nutritionalFacts: ['Weight: 250g', 'Height: 4 inches', 'Capacity: 50ml oil', 'Rust-proof: Yes'],
    feedingGuide: ['Place a cotton wick in the center.', 'Fill with ghee or pooja oil.', 'Light the wick carefully.', 'Clean regularly with pitambari for shine.'],
    amazonLink: '#',
    flipkartLink: '#'
  },
  { 
    id: 3, 
    name: 'Complete Pooja Thali Set', 
    desc: 'Elevate your rituals with our Complete Pooja Thali Set. This exquisitely designed thali includes all the essential components for a perfect offering, featuring a diya, kumkum katori, bell, and incense holder.', 
    category: 'Items',
    img: thaliImg,
    images: [thaliImg],
    price: '₹850.00',
    unit: '1 set',
    rating: 4.7,
    reviews: 89,
    brand: 'MANGLIK',
    features: [
      'ALL-IN-ONE SET: Includes a decorated thali, diya, incense holder, small bell, and kumkum containers.',
      'INTRICATE DESIGN: Features beautiful traditional engravings and a polished finish.',
      'PERFECT FOR FESTIVALS: Ideal for Diwali, Navratri, and daily aarti rituals.',
      'GIFT READY: Comes in a premium packaging, making it a perfect gift for loved ones.'
    ],
    ingredients: 'Premium Stainless Steel / Brass Plating.',
    nutritionalFacts: ['Diameter: 11 inches', 'Components: 6 pieces', 'Weight: 450g', 'Finish: Glossy'],
    feedingGuide: ['Arrange the items on the thali as per your ritual.', 'Wash with mild soap and water.', 'Dry immediately with a soft cloth.', 'Avoid abrasive scrubbers.'],
    amazonLink: '#',
    flipkartLink: '#'
  }
];
