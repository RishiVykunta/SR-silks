import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { BRAND_INFO } from '../config/constants';
import { useWishlist } from '../contexts/WishlistContext';

const Home = () => {
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newArrivals, setNewArrivals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceFilter, setPriceFilter] = useState(null);
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (heroSlides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroSlides.length]);

  const preloadImage = useCallback((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => {
        console.error('Failed to preload image:', src);
        reject(src);
      };
      img.src = src;
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load hero images first (independent of API calls)
      const heroImages = [
        'https://res.cloudinary.com/dbaiaiwkk/image/upload/v1761847331/WhatsApp_Image_2025-10-30_at_23.18.07_aef543c9_nmetje.jpg',
        'https://cliosilks.com/cdn/shop/files/Untitled-1-2.jpg?v=1739348317&width=2400'
      ];
      
      // Preload all hero images
      const loadedImages = await Promise.allSettled(
        heroImages.map(img => preloadImage(img))
      );
      
      // Only add images that loaded successfully
      const validSlides = loadedImages
        .map((result, index) => {
          if (result.status === 'fulfilled') {
            return { id: index + 1, image: result.value };
          }
          return null;
        })
        .filter(slide => slide !== null);
      
      if (validSlides.length > 0) {
        setHeroSlides(validSlides);
        setCurrentSlide(0); // Ensure first slide is active
      } else {
        console.warn('No hero images loaded successfully');
      }

      // Try to load product data (but don't fail if server is down)
      try {
        const [newArrivalsRes, productsRes] = await Promise.all([
          api.get('/products/new-arrivals'),
          api.get('/products?limit=8&is_featured=true')
        ]);

        setNewArrivals(newArrivalsRes.data.products || []);
        setFeaturedProducts(productsRes.data.products || []);
      } catch (apiError) {
        // API errors are expected if server is not running
        console.warn('API calls failed (server may not be running):', apiError.message);
        // Set empty arrays so the page still renders
        setNewArrivals([]);
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  }, [preloadImage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePriceFilter = (maxPrice) => {
    setPriceFilter(maxPrice === priceFilter ? null : maxPrice);
  };

  const filteredNewArrivals = priceFilter
    ? newArrivals.filter(product => {
        const finalPrice = product.discount_price || product.price;
        return finalPrice <= priceFilter;
      })
    : newArrivals;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      {/* Video Call Shopping Banner */}
      <section className="video-call-banner">
        <div className="video-call-wrapper">
          <div className="video-call-content">
            <span className="video-call-label">SHOPPING</span>
            <div className="video-call-items">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="video-call-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF8C00" className="lightning-icon">
                    <path d="M13 1L3 14h8l-1 9 10-13h-8l1-9z"/>
                  </svg>
                  <span>VIDEO CALL SHOPPING</span>
                </div>
              ))}
            </div>
          </div>
          <div className="video-call-content">
            <span className="video-call-label">SHOPPING</span>
            <div className="video-call-items">
              {[...Array(6)].map((_, i) => (
                <div key={`dup-${i}`} className="video-call-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF8C00" className="lightning-icon">
                    <path d="M13 1L3 14h8l-1 9 10-13h-8l1-9z"/>
                  </svg>
                  <span>VIDEO CALL SHOPPING</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Carousel */}
      <section className="hero-section">
        {heroSlides.length > 0 && (
          <>
            {heroSlides.map((slide, index) => (
              <img 
                key={slide.id}
                src={slide.image} 
                alt="Hero" 
                className={`hero-image ${index === currentSlide ? 'active' : ''}`}
                onError={(e) => {
                  console.error('Hero image failed to load:', slide.image);
                  e.target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Hero image loaded:', slide.image);
                }}
                loading="eager"
              />
            ))}
            {heroSlides.length > 1 && (
              <>
                <button 
                  className="hero-nav hero-nav-prev" 
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  aria-label="Previous slide"
                >
                  ‹
                </button>
                <button 
                  className="hero-nav hero-nav-next" 
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                  aria-label="Next slide"
                >
                  ›
                </button>
                <div className="hero-indicators">
                  {heroSlides.map((_, index) => (
                    <button
                      key={index}
                      className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Category Showcase */}
      <section className="category-showcase section">
        <div className="container">
          <h2 className="section-title">SHOP BY CATEGORY</h2>
          <div className="category-grid">
            <Link to="/collection/Formal" className="category-card">
              <div className="category-image">
                <img src="https://res.cloudinary.com/dqcxekzxn/image/upload/c_crop,g_face,h_800,w_800,y_0/v1768423438/download_1_dangr9.jpg" alt="Formal" />
              </div>
              <h3>FORMAL</h3>
            </Link>
            <Link to="/collection/Party" className="category-card">
              <div className="category-image">
                <img src="https://res.cloudinary.com/dqcxekzxn/image/upload/c_crop,g_face,h_800,w_800,y_0/v1768423978/Elegant_Mauve_Embroidered_Saree_Look_Perfect_for_Weddings_or_Editorial_Shoots_ia9aia.jpg" alt="Party" />
              </div>
              <h3>PARTY</h3>
            </Link>
            <Link to="/collection/Casual" className="category-card">
              <div className="category-image">
                <img src="https://res.cloudinary.com/dqcxekzxn/image/upload/c_crop,g_face,h_800,w_800,y_0/v1768424210/Crafts_Moda_Blue_Cotton_Saree_for_women_Hand_Block_Bagru_Print_Floral_Print_Saree_with_Blouse_Piece_x6iu5m.jpg" alt="Casual" />
              </div>
              <h3>CASUAL</h3>
            </Link>
            <Link to="/collection/Traditional" className="category-card">
              <div className="category-image">
                <img src="https://res.cloudinary.com/dqcxekzxn/image/upload/c_crop,g_face,h_800,w_800,y_0/v1768424304/download_1_ucmder.jpg" alt="Traditional" />
              </div>
              <h3>TRADITIONAL</h3>
            </Link>
            <Link to="/collection/Special-Occasions" className="category-card">
              <div className="category-image">
                <img src="https://res.cloudinary.com/dqcxekzxn/image/upload/c_crop,g_face,h_800,w_800,y_-200/v1768424434/download_2_al4ast.jpg" alt="Special Occasions" />
              </div>
              <h3>SPECIAL OCCASIONS</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="featured-products section">
          <div className="container">
            <h2 className="section-title">Featured Products</h2>
            <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product.id)}
              />
            ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="new-arrivals section">
        <div className="container">
          <div className="new-arrivals-header">
            <h2 className="new-arrivals-title">NEW ARRIVALS</h2>
            <div className="new-arrivals-underline"></div>
          </div>
          
          <div className="price-filters">
            <button
              className={`price-filter-btn ${priceFilter === 5000 ? 'active' : ''}`}
              onClick={() => handlePriceFilter(5000)}
            >
              UNDER 5K
            </button>
            <button
              className={`price-filter-btn ${priceFilter === 10000 ? 'active' : ''}`}
              onClick={() => handlePriceFilter(10000)}
            >
              UNDER 10K
            </button>
            <button
              className={`price-filter-btn ${priceFilter === 20000 ? 'active' : ''}`}
              onClick={() => handlePriceFilter(20000)}
            >
              UNDER 20K
            </button>
            <button
              className={`price-filter-btn ${priceFilter === 30000 ? 'active' : ''}`}
              onClick={() => handlePriceFilter(30000)}
            >
              UNDER 30K
            </button>
            <button
              className={`price-filter-btn ${priceFilter === 40000 ? 'active' : ''}`}
              onClick={() => handlePriceFilter(40000)}
            >
              UNDER 40K
            </button>
          </div>

          <div className="products-grid">
            {filteredNewArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product.id)}
              />
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link to="/products" className="btn btn-secondary">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="about-section section">
        <div className="container">
          <h2 className="about-header">OUR STORY</h2>
          <div className="about-content">
            <div className="about-image">
              <img src={BRAND_INFO.founder.image} alt={BRAND_INFO.founder.name} />
            </div>
            <div className="about-text">
              <div className="about-paragraphs">
                <p>Rooted in the vibrant culture of Hyderabad, Swathy Reddy is a designer-led saree brand born from creativity, passion, and a deep respect for Indian craftsmanship.</p>
                <p>Founded 14 years ago by designer Swathy Reddy, the brand began with a simple yet powerful vision—to create sarees that blend timeless tradition with modern design sensibilities. With a trained eye for detail and aesthetics, Swathy personally designs and curates every piece, ensuring each saree carries her signature of elegance and originality.</p>
                <p>For her, a saree is more than fabric—it is a canvas. A canvas where heritage weaves meet contemporary silhouettes, where rich textures, colours, and patterns come together to tell a story of grace and individuality.</p>
                <p>At Swathy Reddy, every creation reflects thoughtful design, premium fabrics, and meticulous craftsmanship. From bespoke bridal drapes to elegant festive and everyday wear, our sarees are designed to make women feel confident, empowered, and timelessly beautiful.</p>
                <p>After eight fulfilling years, the brand continues to evolve—guided by creativity, inspired by tradition, and driven by a commitment to quality and authenticity.</p>
                <p className="about-signature">Welcome to Swathy Reddy — designer sarees crafted with heart, heritage, and style.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section section">
        <div className="container">
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get updates on new collections and exclusive offers</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>

      <style>{`
        .home {
          min-height: 100vh;
          animation: fadeIn 0.6s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-section {
          height: 724px;
          background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #FFD700 100%);
          display: flex;
          align-items: stretch;
          justify-content: center;
          color: white;
          position: relative;
          overflow: hidden;
          padding: 0;
        }

        .hero-image {
          width: 100%;
          height: 724px;
          object-fit: cover;
          object-position: center top;
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
          z-index: 0;
        }

        .hero-image.active {
          opacity: 1;
          z-index: 1;
        }

        .hero-section:hover .hero-image.active {
          transform: scale(1.08);
        }

        .hero-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 2rem;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .hero-nav:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .hero-nav-prev {
          left: 20px;
        }

        .hero-nav-next {
          right: 20px;
        }

        .hero-indicators {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }

        .hero-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        .hero-indicator.active {
          background: white;
        }

        .hero-slide {
          text-align: center;
          position: relative;
          z-index: 1;
          animation: slideUp 0.8s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-content h1 {
          font-family: 'Playfair Display', serif;
          font-size: 4rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          line-height: 1.2;
        }

        .hero-content p {
          font-size: 1.5rem;
          margin-bottom: 2.5rem;
          font-weight: 300;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .section {
          padding: 5rem 0;
          position: relative;
        }

        .section:nth-child(even) {
          background: linear-gradient(to bottom, var(--light-color), white);
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 3rem;
          color: #2c2c2c;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .new-arrivals-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .new-arrivals-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #D4AF37;
          margin-bottom: 0.5rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .new-arrivals-underline {
          width: 100px;
          height: 2px;
          background: #D4AF37;
          margin: 0 auto;
        }

        .price-filters {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .price-filter-btn {
          padding: 0.75rem 1.5rem;
          border: 1px solid #D4AF37;
          background: white;
          color: #666;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .price-filter-btn:hover {
          background: #f9f9f9;
        }

        .price-filter-btn.active {
          background: #22c55e;
          color: white;
          border-color: #22c55e;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 2rem;
          justify-items: center;
        }

        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: var(--text-color);
          transition: var(--transition);
          text-align: center;
        }

        .category-card:hover {
          transform: translateY(-5px);
        }

        .category-image {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: var(--transition);
        }

        .category-card:hover .category-image {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          transform: scale(1.05);
        }

        .category-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .category-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #2c7a7b;
          margin: 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .category-card:hover h3 {
          color: #1a5f5f;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem;
          padding: 1rem 0;
          justify-items: center;
        }

        .text-center {
          text-align: center;
        }

        .about-section {
          background: white;
          padding: 5rem 0 6rem;
        }

        .about-header {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #D4AF37;
          margin-bottom: 4rem;
          position: relative;
          padding-bottom: 1.2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .about-header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #D4AF37, #B8860B);
        }

        .about-content {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 5rem;
          align-items: center;
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .about-image {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
        }

        .about-image img {
          width: 420px;
          height: 420px;
          object-fit: cover;
          border-radius: 50%;
          border: 15px solid white;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          display: block;
          transition: transform 0.3s ease;
        }

        .about-image:hover img {
          transform: scale(1.02);
        }

        .about-text {
          padding-top: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .about-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.85rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 2rem;
          line-height: 1.35;
        }

        .about-paragraphs {
          margin-bottom: 0;
        }

        .about-paragraphs p {
          font-size: 1.05rem;
          line-height: 1.9;
          color: #4a4a4a;
          margin-bottom: 1.8rem;
          text-align: left;
          font-weight: 400;
        }

        .about-paragraphs p:first-child {
          font-size: 1.1rem;
          font-weight: 500;
          color: #2c2c2c;
          margin-bottom: 2rem;
        }

        .about-paragraphs p:last-child {
          margin-bottom: 0;
        }

        .about-signature {
          font-style: italic;
          font-size: 1.1rem !important;
          color: #D4AF37 !important;
          font-weight: 600 !important;
          margin-top: 1.5rem !important;
          text-align: center !important;
          padding-top: 1.5rem;
          border-top: 1px solid #e0e0e0;
        }

        .about-contact {
          display: flex;
          gap: 1.5rem;
          margin-top: 2.5rem;
          padding: 2rem;
          background: white;
          border-radius: 8px;
        }

        .contact-line {
          width: 4px;
          background: #000000;
          flex-shrink: 0;
          border-radius: 2px;
          min-height: 90px;
          align-self: flex-start;
        }

        .contact-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-details p {
          font-size: 0.95rem;
          line-height: 1.7;
          margin: 0;
          display: flex;
          flex-wrap: nowrap;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .contact-label {
          color: #2c2c2c;
          font-weight: 600;
          white-space: nowrap;
          min-width: 100px;
          flex-shrink: 0;
        }

        .contact-value {
          color: #4a4a4a;
          flex: 1;
          word-break: break-word;
        }

        .contact-details a.contact-value {
          color: #4a4a4a;
          text-decoration: none;
          transition: var(--transition);
          display: inline;
        }

        .contact-details a.contact-value:hover {
          color: #dc2626;
          text-decoration: underline;
        }

        .whatsapp-link {
          color: #22c55e !important;
          font-weight: 600;
        }

        .whatsapp-link:hover {
          color: #16a34a !important;
          text-decoration: underline !important;
        }

        .video-call-banner {
          background: linear-gradient(135deg, #8B6914 0%, #B8860B 100%);
          border-top: 2px solid #654321;
          padding: 0.5rem 0;
          overflow: hidden;
          position: relative;
          z-index: 10;
        }

        .video-call-wrapper {
          display: flex;
          width: fit-content;
          animation: scrollBanner 30s linear infinite;
        }

        .video-call-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .video-call-label {
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 1px;
          color: white;
          text-transform: uppercase;
          padding: 0 1rem;
        }

        .video-call-items {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .video-call-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .lightning-icon {
          flex-shrink: 0;
        }

        @keyframes scrollBanner {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .newsletter-section {
          background: #000000;
          text-align: center;
          padding: 4rem 0;
          border-radius: 0;
          margin-top: 3rem;
        }

        .newsletter-section h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          color: #D4AF37;
          margin-bottom: 0.8rem;
          font-weight: 300;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          letter-spacing: 0.5px;
        }

        .newsletter-section p {
          color: #e0e0e0;
          font-size: 1rem;
          margin-bottom: 2rem;
          font-weight: 300;
        }

        .newsletter-form {
          display: flex;
          flex-direction: column;
          max-width: 450px;
          margin: 0 auto;
          gap: 10px;
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .newsletter-form input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          background: white;
          color: #2c2c2c;
          box-sizing: border-box;
        }

        .newsletter-form input::placeholder {
          color: #999;
        }

        .newsletter-form input:focus {
          border-color: #B8860B;
          box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.1);
        }

        .newsletter-form .btn-primary {
          border-radius: 6px;
          padding: 12px 20px;
          white-space: nowrap;
          width: 100%;
          font-size: 14px;
          box-sizing: border-box;
          background: linear-gradient(135deg, #8B6914 0%, #B8860B 50%, #FFD700 100%);
          border: none;
          color: white;
          font-weight: 600;
        }

        .newsletter-form .btn-primary:hover {
          background: linear-gradient(135deg, #654321 0%, #8B6914 50%, #B8860B 100%);
        }

        @media (max-width: 768px) {
          .home {
            overflow-x: hidden;
            width: 100%;
            max-width: 100%;
          }

          .section {
            padding: 3rem 0;
            overflow-x: hidden;
          }

          .video-call-banner {
            padding: 0.4rem 0;
            overflow: hidden;
          }

          .video-call-label {
            font-size: clamp(0.75rem, 2.5vw, 0.9rem);
            padding: 0 0.75rem;
          }

          .video-call-item {
            font-size: clamp(0.7rem, 2.5vw, 0.85rem);
            gap: 0.4rem;
          }

          .video-call-items {
            gap: 1.5rem;
          }

          .hero-section {
            height: 400px;
            max-width: 100%;
            overflow: hidden;
          }

          .hero-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
            object-position: center top;
            max-width: 100%;
          }

          .hero-nav {
            width: 36px;
            height: 36px;
            font-size: 1.25rem;
            min-width: 36px;
            min-height: 36px;
          }

          .hero-nav-prev {
            left: 8px;
          }

          .hero-nav-next {
            right: 8px;
          }

          .hero-indicators {
            bottom: 12px;
            gap: 8px;
          }

          .hero-indicator {
            width: 10px;
            height: 10px;
          }

          .hero-content h1 {
            font-size: clamp(1.75rem, 6vw, 2rem);
            line-height: 1.2;
          }

          .hero-content p {
            font-size: clamp(1rem, 4vw, 1.5rem);
            margin-bottom: 2rem;
          }

          .section-title {
            font-size: clamp(1.5rem, 5vw, 1.8rem);
            margin-bottom: 2rem;
            padding: 0 15px;
          }

          .new-arrivals-title {
            font-size: clamp(1.5rem, 5vw, 2rem);
            margin-bottom: 0.5rem;
          }

          .new-arrivals-underline {
            width: 80px;
          }

          .price-filters {
            gap: 0.75rem;
            margin-bottom: 2rem;
            padding: 0 15px;
            flex-wrap: wrap;
            justify-content: center;
          }

          .price-filter-btn {
            padding: 0.65rem 1.2rem;
            font-size: clamp(0.75rem, 3vw, 0.9rem);
            min-height: 44px;
            flex: 1;
            min-width: calc(50% - 0.375rem);
            max-width: calc(50% - 0.375rem);
          }

          .category-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            padding: 0 15px;
          }

          .category-image {
            width: 120px;
            height: 120px;
            max-width: 100%;
            border-radius: 50%;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .category-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .category-card {
            width: 100%;
          }

          .category-card h3 {
            font-size: clamp(0.8rem, 3vw, 0.9rem);
            margin-top: 0.75rem;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            padding: 1rem 15px;
          }
          
          .product-card {
            max-width: 100%;
          }

          .about-section {
            padding: 3rem 0 4rem;
            overflow-x: hidden;
          }

          .about-header {
            font-size: clamp(1.75rem, 6vw, 2rem);
            margin-bottom: 3rem;
            letter-spacing: 1.5px;
            padding: 0 15px 1rem;
          }

          .about-header::after {
            width: 60px;
            height: 2px;
          }

          .about-content {
            grid-template-columns: 1fr;
            gap: 3rem;
            max-width: 100%;
            padding: 0 15px;
            align-items: center;
          }

          .about-image {
            order: 1;
            display: flex;
            justify-content: center;
            width: 100%;
            margin-bottom: 1rem;
          }

          .about-image img {
            width: min(320px, 100%);
            height: min(320px, 100%);
            max-width: 100%;
            border: 12px solid white;
            aspect-ratio: 1;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          }

          .about-text {
            order: 2;
            padding-top: 0;
            width: 100%;
          }

          .about-title {
            font-size: clamp(1.25rem, 4.5vw, 1.5rem);
            margin-bottom: 1.5rem;
            text-align: left;
            line-height: 1.3;
            padding: 0;
          }

          .about-paragraphs {
            margin-bottom: 0;
          }

          .about-paragraphs p {
            font-size: clamp(0.95rem, 3.5vw, 1rem);
            line-height: 1.8;
            margin-bottom: 1.5rem;
            text-align: left;
          }

          .about-paragraphs p:first-child {
            font-size: clamp(1rem, 4vw, 1.05rem);
            margin-bottom: 1.8rem;
          }

          .about-signature {
            font-size: clamp(1rem, 4vw, 1.05rem) !important;
            margin-top: 1.5rem !important;
            padding-top: 1.5rem !important;
          }

          .about-contact {
            flex-direction: column;
            gap: 1rem;
            margin-top: 2rem;
            padding: 1.5rem;
          }

          .contact-line {
            width: 100%;
            height: 4px;
            min-height: 4px;
          }

          .contact-details {
            gap: 0.9rem;
            width: 100%;
          }

          .contact-details p {
            flex-direction: column;
            gap: 0.4rem;
            align-items: flex-start;
          }

          .contact-label {
            min-width: auto;
            width: 100%;
          }

          .newsletter-section {
            padding: 3rem 15px;
            margin-top: 2rem;
            overflow-x: hidden;
          }

          .newsletter-section h2 {
            font-size: clamp(1.5rem, 5vw, 2rem);
            margin-bottom: 0.8rem;
            padding: 0;
          }

          .newsletter-section p {
            font-size: clamp(0.9rem, 3.5vw, 1rem);
            margin-bottom: 1.5rem;
            padding: 0;
          }

          .newsletter-form {
            max-width: 100%;
            width: 100%;
            padding: 10px;
          }

          .newsletter-form input {
            font-size: clamp(14px, 3.5vw, 16px);
            padding: 14px 16px;
            min-height: 44px;
          }

          .newsletter-form .btn-primary {
            font-size: clamp(14px, 3.5vw, 16px);
            padding: 14px 20px;
            min-height: 44px;
          }

          .text-center {
            padding: 0 15px;
          }

          .text-center .btn {
            width: 100%;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onToggleWishlist, isInWishlist }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const price = parseFloat(product.price || 0);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const finalPrice = discountPrice || price;
  const discountPercentage = discountPrice 
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const whatsappMessage = `Hello! I'm interested in ${product.name} - ₹${finalPrice.toFixed(2)}`;
  const whatsappUrl = `https://wa.me/91${BRAND_INFO.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  // Auto-slide images every 2 seconds
  useEffect(() => {
    if (product.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 2000); // 2 seconds
      return () => clearInterval(interval);
    } else {
      setCurrentImageIndex(0);
    }
  }, [product.images]);

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder.jpg'];

  const handleProductClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-link" onClick={handleProductClick}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={product.name}
            style={{
              display: currentImageIndex === index ? 'block' : 'none'
            }}
          />
        ))}
        {discountPercentage > 0 && (
          <span className="discount-badge">{discountPercentage}% OFF</span>
        )}
      </Link>
      <div className="product-info">
        <h3>
          <Link to={`/product/${product.id}`} onClick={handleProductClick}>{product.name}</Link>
        </h3>
        <div className="product-price">
          {discountPrice && (
            <span className="old-price">₹{price.toFixed(2)}</span>
          )}
          <span className="current-price">₹{isNaN(finalPrice) ? '0.00' : finalPrice.toFixed(2)}</span>
        </div>
        <div className="product-actions">
          <button
            className="wishlist-btn-action"
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product);
            }}
          >
            {isInWishlist ? '❤️' : '🤍'}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: var(--transition);
          border: 1px solid var(--border-color);
          position: relative;
          width: 100%;
          max-width: 280px;
          display: flex;
          flex-direction: column;
        }

        .product-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-primary);
          transform: scaleX(0);
          transition: var(--transition);
        }

        .product-card:hover::before {
          transform: scaleX(1);
        }

        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: var(--shadow-xl);
          border-color: var(--primary-color);
        }

        .product-image-link {
          position: relative;
          display: block;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: var(--light-color);
        }

        .product-image-link {
          position: relative;
        }

        .product-image-link img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
        }

        .product-card:hover .product-image-link img {
          transform: scale(1.08);
        }

        .discount-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          z-index: 2;
          animation: pulse 2s infinite;
        }

        .wishlist-btn-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: white;
          color: #ef4444;
          border: 2px solid #ef4444;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
          padding: 0;
        }

        .wishlist-btn-action:hover {
          background: #ef4444;
          color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .product-info {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-info h3 {
          margin-bottom: 0.6rem;
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.3;
          min-height: 2.6em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-info a {
          color: var(--text-color);
          text-decoration: none;
          transition: var(--transition);
        }

        .product-info a:hover {
          color: var(--primary-color);
        }

        .product-price {
          margin-bottom: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .old-price {
          text-decoration: line-through;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .current-price {
          font-size: 1.15rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .product-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
          align-items: center;
        }

        .whatsapp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #22c55e;
          color: white;
          border-radius: 50%;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        .whatsapp-btn:hover {
          background: #16a34a;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        }

        .whatsapp-btn svg {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 768px) {
          .product-card {
            border-radius: 10px;
            max-width: 100%;
            width: 100%;
            height: auto;
          }

          .product-image-link {
            aspect-ratio: 3/4;
            max-width: 100%;
            overflow: hidden;
          }

          .product-image-link img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            max-width: 100%;
          }

          .product-info {
            padding: 1rem;
          }

          .product-info h3 {
            font-size: clamp(0.9rem, 3.5vw, 1rem);
            min-height: auto;
            margin-bottom: 0.6rem;
            line-height: 1.4;
          }

          .product-price {
            margin-bottom: 1rem;
            gap: 0.6rem;
          }

          .old-price {
            font-size: clamp(0.85rem, 3vw, 0.95rem);
          }

          .current-price {
            font-size: clamp(1.1rem, 4vw, 1.3rem);
          }

          .product-actions {
            gap: 0.5rem;
            margin-top: auto;
          }

          .wishlist-btn-action {
            width: 38px;
            height: 38px;
            min-width: 38px;
            min-height: 38px;
            font-size: 20px;
          }

          .whatsapp-btn {
            width: 38px;
            height: 38px;
            min-width: 38px;
            min-height: 38px;
          }

          .whatsapp-btn svg {
            width: 18px;
            height: 18px;
          }

          .discount-badge {
            top: 10px;
            right: 10px;
            padding: 5px 10px;
            font-size: clamp(10px, 2.5vw, 12px);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
