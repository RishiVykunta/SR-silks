import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../config/api';
import { BRAND_INFO } from '../config/constants';
import { useWishlist } from '../contexts/WishlistContext';

const Collection = () => {
  const { collectionName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceFilter, setPriceFilter] = useState('');
  const { toggleWishlist, isInWishlist } = useWishlist();

  const loadCollection = useCallback(async () => {
    try {
      setLoading(true);
      // Convert URL format (with hyphens) to database format (with spaces)
      // e.g., "Special-Occasions" -> "Special Occasions"
      const collectionParam = collectionName ? collectionName.replace(/-/g, ' ') : collectionName;
      let url = `/products?collection=${encodeURIComponent(collectionParam)}`;
      if (collectionName === 'Celebrate' && priceFilter) {
        url = `/products/celebrate?price_filter=${priceFilter}`;
      } else if (priceFilter) {
        url += `&max_price=${priceFilter === '10' ? '10000' : priceFilter === '20' ? '20000' : priceFilter === '30' ? '30000' : '50000'}`;
      }
      const response = await api.get(url);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  }, [collectionName, priceFilter]);

  useEffect(() => {
    // Scroll to top when collection changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadCollection();
  }, [loadCollection]);

  const handleProductClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="loading">Loading collection...</div>;

  // Format collection name for display (convert hyphens to spaces and capitalize)
  const displayName = collectionName 
    ? collectionName.replace(/-/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    : 'Collection';

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1>{displayName} Collection</h1>

      {collectionName === 'Celebrate' && (
        <div className="price-filters" style={{ margin: '2rem 0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${priceFilter === '10' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setPriceFilter(priceFilter === '10' ? '' : '10')}
          >
            Under ₹10k
          </button>
          <button
            className={`btn ${priceFilter === '20' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setPriceFilter(priceFilter === '20' ? '' : '20')}
          >
            ₹10k - ₹20k
          </button>
          <button
            className={`btn ${priceFilter === '30' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setPriceFilter(priceFilter === '30' ? '' : '30')}
          >
            ₹20k - ₹30k
          </button>
          <button
            className={`btn ${priceFilter === '50' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setPriceFilter(priceFilter === '50' ? '' : '50')}
          >
            Above ₹50k
          </button>
        </div>
      )}

      <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem', marginTop: '2rem', justifyItems: 'center' }}>
        <style>{`
          @media (max-width: 768px) {
            .container {
              padding: 1rem 12px;
              overflow-x: hidden;
              width: 100%;
              max-width: 100%;
            }

            .products-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 12px !important;
              margin-top: 1rem !important;
              padding: 0 !important;
              width: 100% !important;
            }

            .product-card {
              width: 100% !important;
              max-width: 100% !important;
              border-radius: 12px !important;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
            }

            .product-card > a {
              display: block !important;
              width: 100% !important;
              max-height: 200px;
              overflow: hidden;
            }

            .product-card img {
              width: 100% !important;
              max-width: 100% !important;
              aspect-ratio: 4/5 !important;
              object-fit: cover !important;
              display: block !important;
              transition: transform 0.5s ease;
            }

            .product-card > div {
              padding: 0.75rem !important;
              display: flex;
              flex-direction: column;
              gap: 0.25rem;
            }

            .product-card h3 {
              font-size: 0.85rem !important;
              font-weight: 500 !important;
              line-height: 1.3 !important;
              margin-bottom: 0.4rem !important;
              min-height: 2.6em !important;
              color: #333 !important;
            }

            .product-card h3 a {
              font-size: 0.85rem !important;
              color: #333 !important;
            }

            .product-card > div > div:first-of-type {
              margin-bottom: 0.6rem !important;
              display: flex;
              align-items: center;
              gap: 0.4rem !important;
            }

            .product-card > div > div:first-of-type span:first-child {
              font-size: 0.75rem !important;
              opacity: 0.6;
            }

            .product-card > div > div:first-of-type span:last-child {
              font-size: 1rem !important;
              font-weight: 700 !important;
              color: var(--primary-color) !important;
            }

            .product-card > div > div:last-of-type {
              gap: 0.4rem !important;
              margin-top: 0.25rem;
            }

            .product-card button,
            .product-card a:not(.category-card) {
              width: 32px !important;
              height: 32px !important;
              min-width: 32px !important;
              min-height: 32px !important;
              font-size: 14px !important;
              border-width: 1px !important;
            }

            .product-card button svg,
            .product-card a svg {
              width: 14px !important;
              height: 14px !important;
            }

            h1 {
              font-size: 1.5rem !important;
              padding: 0 12px !important;
              text-align: center !important;
              margin-bottom: 0.5rem !important;
              font-family: 'Playfair Display', serif !important;
            }

            .price-filters {
              flex-direction: row !important;
              flex-wrap: wrap;
              gap: 0.4rem !important;
              margin: 1rem 0 !important;
              padding: 0 12px !important;
              justify-content: center;
            }

            .price-filters .btn {
              width: calc(50% - 0.2rem) !important;
              min-height: 38px !important;
              padding: 6px 10px !important;
              font-size: 12px !important;
              border-radius: 6px !important;
            }
          }
        `}</style>
        {products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found in this collection</h3>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="product-card" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column' }}>
              <Link to={`/product/${product.id}`} onClick={handleProductClick}>
                <img
                  src={product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}
                />
              </Link>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ marginBottom: '0.6rem', fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.3', minHeight: '2.6em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  <Link to={`/product/${product.id}`} onClick={handleProductClick} style={{ color: 'var(--text-color)', textDecoration: 'none' }}>{product.name}</Link>
                </h3>
                <div style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.discount_price && <span style={{ textDecoration: 'line-through', color: 'var(--text-light)', fontSize: '0.85rem' }}>₹{parseFloat(product.price || 0).toFixed(2)}</span>}
                  <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--primary-color)' }}>₹{parseFloat(product.discount_price || product.price || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 'auto' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ef4444',
                      color: '#ef4444',
                      background: 'white',
                      fontSize: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                    }} 
                    onClick={() => toggleWishlist(product)}
                  >
                    {isInWishlist(product.id) ? '❤️' : '🤍'}
                  </button>
                  <a
                    href={`https://wa.me/91${BRAND_INFO.contact.whatsapp}?text=${encodeURIComponent(`Hello! I'm interested in ${product.name} - ₹${parseFloat(product.discount_price || product.price || 0).toFixed(2)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      background: '#22c55e',
                      color: 'white',
                      borderRadius: '50%',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#16a34a';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#22c55e';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Collection;