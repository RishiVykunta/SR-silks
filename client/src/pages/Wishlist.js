import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Your wishlist is empty</h2>
        <p>Add products to your wishlist to save them for later!</p>
        <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Wishlist ({wishlistItems.length})</h1>
        <button className="btn btn-outline" onClick={clearWishlist}>
          Clear Wishlist
        </button>
      </div>

      <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
        {wishlistItems.map((item) => {
          const product = item.product || item;
          const finalPrice = product.discount_price || product.price || item.discount_price || item.price;
          
          return (
            <div key={item.id} className="product-card" style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <Link to={`/product/${product.id || item.product_id}`}>
                <img
                  src={product.images?.[0] || item.images?.[0] || '/placeholder.jpg'}
                  alt={product.name || item.name}
                  style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}
                />
              </Link>
              <div style={{ padding: '1rem' }}>
                <h3>
                  <Link to={`/product/${product.id || item.product_id}`} style={{ color: 'var(--text-color)', textDecoration: 'none' }}>
                    {product.name || item.name}
                  </Link>
                </h3>
                <p style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--primary-color)', margin: '1rem 0' }}>
                  ₹{finalPrice}
                </p>
                <button
                  className="btn btn-outline"
                  style={{ width: '100%', color: 'var(--error-color)' }}
                  onClick={async () => {
                    const result = await removeFromWishlist(item.id || item.product_id);
                    if (!result.success) {
                      alert(result.error || 'Failed to remove from wishlist');
                    }
                  }}
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .container {
            padding: 1.5rem 15px !important;
            overflow-x: hidden;
            width: 100%;
            max-width: 100%;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.5rem !important;
          }

          .product-card {
            width: 100%;
            max-width: 100%;
            border-radius: 12px;
          }

          .product-card img {
            width: 100%;
            max-width: 100%;
            aspect-ratio: 3/4;
            object-fit: cover;
          }

          .product-card > div {
            padding: 1rem !important;
          }

          .product-card h3 {
            font-size: clamp(0.9rem, 3.5vw, 1rem);
            line-height: 1.4;
            margin-bottom: 0.75rem;
          }

          .product-card h3 a {
            font-size: clamp(0.9rem, 3.5vw, 1rem);
          }

          .product-card p {
            font-size: clamp(1rem, 4vw, 1.2rem) !important;
            margin: 0.75rem 0 !important;
          }

          .product-card button {
            min-height: 44px;
            font-size: clamp(14px, 3.5vw, 16px);
            padding: 12px 20px;
          }

          h1 {
            font-size: clamp(1.5rem, 5vw, 1.75rem);
            padding: 0;
          }

          h2 {
            font-size: clamp(1.5rem, 5vw, 1.75rem);
          }

          .container > div:first-child {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
            margin-bottom: 1.5rem;
          }

          .container > div:first-child button {
            width: 100%;
            min-height: 44px;
            font-size: clamp(14px, 3.5vw, 16px);
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;