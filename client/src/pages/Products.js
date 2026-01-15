import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../config/api';
import { BRAND_INFO } from '../config/constants';
import { useWishlist } from '../contexts/WishlistContext';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') || 'DESC',
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const { toggleWishlist, isInWishlist } = useWishlist();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="products-page container" style={{ padding: '2rem 0' }}>
      <h1>All Products</h1>
      
      <div className="products-layout">
        <aside className="filters-sidebar">
          <h3>Filters</h3>
          
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search products..."
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Silk">Silk</option>
              <option value="Banarasi">Banarasi</option>
              <option value="Designer">Designer</option>
              <option value="Bridal">Bridal</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.min_price}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={`${filters.sort}-${filters.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                handleFilterChange('sort', sort);
                handleFilterChange('order', order);
              }}
            >
              <option value="created_at-DESC">Newest First</option>
              <option value="price-ASC">Price: Low to High</option>
              <option value="price-DESC">Price: High to Low</option>
              <option value="name-ASC">Name: A to Z</option>
            </select>
          </div>
        </aside>

        <main className="products-content">
          <div className="products-grid">
            {products.length === 0 ? (
              <div className="empty-state">
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onToggleWishlist={() => toggleWishlist(product)}
                  isInWishlist={isInWishlist(product.id)}
                />
              ))
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                Previous
              </button>
              <span>Page {filters.page} of {pagination.totalPages}</span>
              <button
                disabled={filters.page >= pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .products-layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .filters-sidebar {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: var(--shadow);
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .filter-group {
          margin-bottom: 1.5rem;
        }

        .filter-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .filter-group input,
        .filter-group select {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 2rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .pagination button {
          padding: 8px 16px;
          border: 1px solid var(--border-color);
          background: white;
          cursor: pointer;
          border-radius: 4px;
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .products-page {
            padding: 1.5rem 0 !important;
            overflow-x: hidden;
            width: 100%;
            max-width: 100%;
          }

          .products-page h1 {
            font-size: clamp(1.5rem, 5vw, 1.75rem);
            padding: 0 15px;
            margin-bottom: 1.5rem;
          }

          .products-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-top: 1.5rem;
            padding: 0 15px;
          }

          .filters-sidebar {
            position: static;
            padding: 1.25rem;
            border-radius: 8px;
            margin-bottom: 1rem;
          }

          .filters-sidebar h3 {
            font-size: clamp(1.1rem, 4vw, 1.25rem);
            margin-bottom: 1.25rem;
          }

          .filter-group {
            margin-bottom: 1.25rem;
          }

          .filter-group label {
            font-size: clamp(0.9rem, 3.5vw, 1rem);
            margin-bottom: 0.5rem;
          }

          .filter-group input,
          .filter-group select {
            padding: 12px;
            font-size: clamp(14px, 3.5vw, 16px);
            min-height: 44px;
            width: 100%;
          }

          .products-content {
            width: 100%;
            max-width: 100%;
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.5rem !important;
            padding: 0 !important;
          }

          .pagination {
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-top: 1.5rem;
            padding: 0 15px;
          }

          .pagination button {
            padding: 10px 16px;
            font-size: clamp(14px, 3.5vw, 16px);
            min-height: 44px;
            flex: 1;
            min-width: calc(50% - 0.375rem);
          }

          .pagination span {
            font-size: clamp(14px, 3.5vw, 16px);
            width: 100%;
            text-align: center;
          }

          .product-card {
            width: 100%;
            max-width: 100%;
            border-radius: 12px;
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

// Reuse ProductCard from Home.js
const ProductCard = ({ product, onToggleWishlist, isInWishlist }) => {
  const price = parseFloat(product.price || 0);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const finalPrice = discountPrice || price;
  const discountPercentage = discountPrice 
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const whatsappMessage = `Hello! I'm interested in ${product.name} - ₹${finalPrice.toFixed(2)}`;
  const whatsappUrl = `https://wa.me/91${BRAND_INFO.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleProductClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-image-link" onClick={handleProductClick}>
        <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} />
        {discountPercentage > 0 && (
          <span className="discount-badge">{discountPercentage}% OFF</span>
        )}
      </Link>
      <div className="product-info">
        <h3><Link to={`/product/${product.id}`} onClick={handleProductClick}>{product.name}</Link></h3>
        <div className="product-price">
          {discountPrice && <span className="old-price">₹{price.toFixed(2)}</span>}
          <span className="current-price">₹{isNaN(finalPrice) ? '0.00' : finalPrice.toFixed(2)}</span>
        </div>
        <div className="product-actions">
          <button 
            className="wishlist-btn-action" 
            onClick={(e) => { 
              e.preventDefault(); 
              onToggleWishlist(); 
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
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: var(--transition);
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .product-image-link {
          position: relative;
          display: block;
          aspect-ratio: 3/4;
          overflow: hidden;
        }

        .product-image-link img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .discount-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--error-color);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .product-info {
          padding: 1rem;
          display: flex;
          flex-direction: column;
        }

        .product-info h3 {
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .product-info a {
          color: var(--text-color);
          text-decoration: none;
        }

        .product-price {
          margin-bottom: 1rem;
        }

        .old-price {
          text-decoration: line-through;
          color: var(--text-light);
          margin-right: 0.5rem;
        }

        .current-price {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--primary-color);
        }

        .product-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
          align-items: center;
        }

        .wishlist-btn-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: white;
          color: #ef4444;
          border: 2px solid #ef4444;
          border-radius: 50%;
          cursor: pointer;
          font-size: 22px;
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

        .whatsapp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
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
          width: 20px;
          height: 20px;
        }
      `}</style>
    </div>
  );
};

export default Products;