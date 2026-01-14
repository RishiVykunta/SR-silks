import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND_INFO } from '../config/constants';
import './Footer.css';

const Footer = () => {
  const whatsappLink = `https://wa.me/91${BRAND_INFO.contact.whatsapp}`;
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e) => {
    // Scroll to top when any footer link is clicked
    scrollToTop();
  };

  const handleVideoCall = () => {
    window.open(`https://wa.me/91${BRAND_INFO.contact.whatsapp}?video=true`, '_blank');
  };

  const handleVideoChat = () => {
    window.open(whatsappLink, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: BRAND_INFO.name,
        text: 'Check out ' + BRAND_INFO.name,
        url: window.location.href
      }).catch(err => console.log('Error sharing', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <img src={BRAND_INFO.logo} alt={BRAND_INFO.name} />
            </div>
            <p className="footer-description">Discover the finest collection of traditional and contemporary sarees. Each piece is carefully curated to bring you elegance and style.</p>
            <div className="social-links">
              <a href={BRAND_INFO.social.instagram} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
              <li><Link to="/products" onClick={handleLinkClick}>Collection</Link></li>
              <li><Link to="/" onClick={(e) => { e.preventDefault(); handleLinkClick(); const aboutSection = document.querySelector('.about-section'); if (aboutSection) { aboutSection.scrollIntoView({ behavior: 'smooth' }); } }}>Our Story</Link></li>
              <li><Link to="/contact" onClick={handleLinkClick}>Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h4>Shop by Category</h4>
            <ul>
              <li><Link to="/collection/Formal" onClick={handleLinkClick}>Formal</Link></li>
              <li><Link to="/collection/Party" onClick={handleLinkClick}>Party</Link></li>
              <li><Link to="/collection/Casual" onClick={handleLinkClick}>Casual</Link></li>
              <li><Link to="/collection/Traditional" onClick={handleLinkClick}>Traditional</Link></li>
              <li><Link to="/collection/Special-Occasions" onClick={handleLinkClick}>Special Occasions</Link></li>
              <li><Link to="/products" onClick={handleLinkClick}>All Products</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info">
              <p className="contact-item">
                <span className="contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(`${BRAND_INFO.address.line1}, ${BRAND_INFO.address.line2}, ${BRAND_INFO.address.city}, ${BRAND_INFO.address.state} ${BRAND_INFO.address.postalCode}, ${BRAND_INFO.address.country}`)}`} target="_blank" rel="noopener noreferrer" className="contact-value">
                  {BRAND_INFO.address.line1}, {BRAND_INFO.address.line2}, {BRAND_INFO.address.city}, {BRAND_INFO.address.state} {BRAND_INFO.address.postalCode}, {BRAND_INFO.address.country}
                </a>
              </p>
              <p className="contact-item">
                <span className="contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <a href={`tel:+91${BRAND_INFO.contact.phone}`} className="contact-value">{BRAND_INFO.contact.phone}</a>
              </p>
              <p className="contact-item">
                <span className="contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </span>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="contact-value">{BRAND_INFO.contact.whatsapp}</a>
              </p>
              <p className="contact-item">
                <span className="contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <a href={`mailto:${BRAND_INFO.contact.email}`} className="contact-value">{BRAND_INFO.contact.email}</a>
              </p>
            </div>
          </div>

          {/* User Policy */}
          <div className="footer-section">
            <h4>User Policy</h4>
            <ul>
              <li><Link to="/privacy-policy" onClick={handleLinkClick}>Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" onClick={handleLinkClick}>Terms of Service</Link></li>
              <li><Link to="/refund-policy" onClick={handleLinkClick}>Refund & Return Policy</Link></li>
              <li><Link to="/shipping-policy" onClick={handleLinkClick}>Shipping Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; {new Date().getFullYear()} Label by Swathy Reddy. All rights reserved.</p>
          </div>
          <div className="footer-bottom-right">
            <Link to="/privacy-policy" onClick={handleLinkClick}>Privacy Policy</Link>
            <Link to="/terms-of-service" onClick={handleLinkClick}>Terms of Service</Link>
            <Link to="/refund-policy" onClick={handleLinkClick}>Refund & Return Policy</Link>
            <Link to="/shipping-policy" onClick={handleLinkClick}>Shipping Policy</Link>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="floating-buttons">
        <button className="floating-btn floating-btn-scroll" onClick={scrollToTop} aria-label="Scroll to top">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
        <button className="floating-btn floating-btn-video-call" onClick={handleVideoCall} aria-label="WhatsApp Video Call">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </button>
        <button className="floating-btn floating-btn-video-chat" onClick={handleVideoChat} aria-label="WhatsApp Video Chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        <button className="floating-btn floating-btn-share" onClick={handleShare} aria-label="Share">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
      </div>
    </footer>
  );
};

export default Footer;