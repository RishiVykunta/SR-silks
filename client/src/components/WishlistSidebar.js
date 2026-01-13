import React from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useWishlist } from '../contexts/WishlistContext';

const WishlistSidebar = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();

  return (
    <div className="wishlist-sidebar">
      <div className="wishlist-sidebar-header">
        <h3>Wishlist ({wishlistItems.length})</h3>
        <button>
          <XMarkIcon />
        </button>
      </div>

      <div className="wishlist-sidebar-content">
        {wishlistItems.length === 0 ? (
          <div className="empty-state">
            <p>Your wishlist is empty</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="wishlist-items">
            {wishlistItems.map((item) => (
              <div key={item.id} className="wishlist-item">
                <Link to={`/product/${item.product_id || item.product?.id}`}>
                  <img
                    src={item.images?.[0] || item.product?.images?.[0] || '/placeholder.jpg'}
                    alt={item.name || item.product?.name}
                  />
                  <div className="wishlist-item-details">
                    <h4>{item.name || item.product?.name}</h4>
                    <p>₹{item.final_price || item.discount_price || item.price}</p>
                  </div>
                </Link>
                <div className="wishlist-item-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .wishlist-sidebar {
          position: fixed;
          top: 0;
          right: -400px;
          width: 400px;
          height: 100vh;
          background: white;
          box-shadow: var(--shadow-lg);
          z-index: 1001;
          transition: right 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .wishlist-sidebar.open {
          right: 0;
        }

        .wishlist-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .wishlist-sidebar-header h3 {
          margin: 0;
        }

        .wishlist-sidebar-header button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px;
        }

        .wishlist-sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .wishlist-item {
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .wishlist-item a {
          display: flex;
          gap: 1rem;
          text-decoration: none;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .wishlist-item img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }

        .wishlist-item-details h4 {
          margin: 0 0 0.5rem 0;
          font-size: 14px;
        }

        .wishlist-item-actions {
          display: flex;
          gap: 0.5rem;
        }

        .wishlist-item-actions button {
          flex: 1;
          font-size: 12px;
          padding: 8px;
        }

        @media (max-width: 768px) {
          .wishlist-sidebar {
            width: 100%;
            right: -100%;
          }
        }
      `}</style>
    </div>
  );
};

export default WishlistSidebar;