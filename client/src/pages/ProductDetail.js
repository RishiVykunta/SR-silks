import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../config/api';
import { BRAND_INFO } from '../config/constants';
import { useWishlist } from '../contexts/WishlistContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { toggleWishlist, isInWishlist } = useWishlist();

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
      setRelatedProducts(response.data.relatedProducts || []);
      if (response.data.product?.images?.length > 0) {
        setSelectedImage(0);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
    // Scroll to top when product page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadProduct]);


  if (loading) return <div className="loading">Loading product...</div>;
  if (!product) return <div className="error">Product not found</div>;

  const finalPrice = product.discount_price || product.price;
  const discountPercentage = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const sizeText = selectedSize ? `Size: ${selectedSize}` : '';
  const colorText = selectedColor ? `Color: ${selectedColor}` : '';
  const sizeColorText = [sizeText, colorText].filter(Boolean).join(', ');
  const productImageUrl = product.images?.[0] || product.images?.[selectedImage] || '';
  const productUrl = `${window.location.origin}/product/${product.id}`;
  
  // Enhanced WhatsApp message with product details and image URL
  const whatsappMessage = `Hello! 👋

I would like to buy this saree:

*Product Name:* ${product.name}
${sizeColorText ? `*${sizeColorText}*\n` : ''}*Price:* ₹${parseFloat(finalPrice).toFixed(2)}
${product.discount_price ? `*Original Price:* ₹${parseFloat(product.price).toFixed(2)}\n*Discount:* ${discountPercentage}% OFF\n` : ''}
*Product Image:* ${productImageUrl}
*View Product:* ${productUrl}

I would like to customize/purchase this saree. Please let me know the availability and customization options.

Thank you! 😊`;

  const whatsappUrl = `https://wa.me/91${BRAND_INFO.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="product-detail container" style={{ padding: '2rem 0' }}>
      <div className="product-detail-layout">
        {/* Image Gallery */}
        <div className="product-images">
          <div className="main-image">
            <img
              src={product.images?.[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-images">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h1>{product.name}</h1>
          
          <div className="product-price-section">
            {product.discount_price && (
              <span className="old-price">₹{product.price}</span>
            )}
            <span className="current-price">₹{finalPrice}</span>
            {discountPercentage > 0 && (
              <span className="discount-badge">{discountPercentage}% OFF</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="product-stock">
            {product.stock !== undefined && product.stock !== null ? (
              product.stock > 0 ? (
                <span className="stock-in">In Stock ({product.stock} available)</span>
              ) : (
                <span className="stock-out">Out of Stock</span>
              )
            ) : null}
          </div>

          {product.description && (
            <div className="product-description">
              <p>{product.description}</p>
            </div>
          )}

          {/* Size Selection */}
          {product.size && product.size.length > 0 && (
            <div className="product-option">
              <label>Size:</label>
              <div className="option-buttons">
                {product.size.map((size) => (
                  <button
                    key={size}
                    className={selectedSize === size ? 'active' : ''}
                    onClick={() => setSelectedSize(size)}
                    disabled={product.stock === 0}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.color && product.color.length > 0 && (
            <div className="product-option">
              <label>Color:</label>
              <div className="option-buttons">
                {product.color.map((color) => (
                  <button
                    key={color}
                    className={selectedColor === color ? 'active' : ''}
                    onClick={() => setSelectedColor(color)}
                    disabled={product.stock === 0}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="product-actions">
            {product.stock !== undefined && product.stock !== null && product.stock === 0 ? (
              <button
                className="btn btn-outline"
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              >
                Out of Stock
              </button>
            ) : (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary whatsapp-purchase-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Purchase via WhatsApp
              </a>
            )}
            <button
              className="btn btn-outline wishlist-btn-detail"
              onClick={() => toggleWishlist(product)}
            >
              {isInWishlist(product.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
            </button>
          </div>

          {/* Product Features */}
          {product.features && product.features.length > 0 && (
            <div className="product-features">
              <h3>Features</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Shipping Info */}
          {product.shipping_info && (
            <div className="shipping-info">
              <h3>Shipping Information</h3>
              <p>{product.shipping_info}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products section">
          <h2 className="section-title">Related Products</h2>
          <div className="related-products-grid">
            {relatedProducts.map((relatedProduct) => {
              const finalPrice = parseFloat(relatedProduct.discount_price || relatedProduct.price || 0);
              const originalPrice = relatedProduct.discount_price ? parseFloat(relatedProduct.price || 0) : null;
              const discountPercentage = relatedProduct.discount_price && relatedProduct.price
                ? Math.round(((relatedProduct.price - relatedProduct.discount_price) / relatedProduct.price) * 100)
                : 0;
              
              return (
                <Link 
                  key={relatedProduct.id} 
                  to={`/product/${relatedProduct.id}`} 
                  className="related-product-card"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <div className="related-product-image-wrapper">
                    <img 
                      src={relatedProduct.images?.[0] || '/placeholder.jpg'} 
                      alt={relatedProduct.name}
                      className="related-product-image"
                    />
                    {discountPercentage > 0 && (
                      <span className="related-product-discount-badge">{discountPercentage}% OFF</span>
                    )}
                  </div>
                  <div className="related-product-info">
                    <h3 className="related-product-name">{relatedProduct.name}</h3>
                    <div className="related-product-price">
                      {originalPrice && (
                        <span className="related-product-old-price">₹{originalPrice.toFixed(2)}</span>
                      )}
                      <span className="related-product-current-price">₹{finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <style>{`
        .product-detail-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }

        .main-image {
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumbnail-images {
          display: flex;
          gap: 1rem;
        }

        .thumbnail-images img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .thumbnail-images img.active {
          border-color: var(--primary-color);
        }

        .product-price-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1rem 0;
        }

        .old-price {
          text-decoration: line-through;
          color: var(--text-light);
          font-size: 1.2rem;
        }

        .current-price {
          font-size: 2rem;
          font-weight: 600;
          color: var(--primary-color);
        }

        .discount-badge {
          background: var(--error-color);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .product-option {
          margin: 1.5rem 0;
        }

        .product-stock {
          margin: 1rem 0;
          padding: 0.75rem;
          border-radius: 6px;
          font-weight: 600;
        }

        .stock-in {
          color: var(--success-color);
          background: rgba(16, 185, 129, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          display: inline-block;
        }

        .stock-out {
          color: var(--error-color);
          background: rgba(239, 68, 68, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          display: inline-block;
        }

        .product-option label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .option-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .option-buttons button {
          padding: 8px 16px;
          border: 1px solid var(--border-color);
          background: white;
          cursor: pointer;
          border-radius: 4px;
          transition: var(--transition);
        }

        .option-buttons button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-buttons button.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .product-quantity {
          margin: 1.5rem 0;
        }

        .product-quantity label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .quantity-controls button {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-color);
          background: white;
          cursor: pointer;
          border-radius: 4px;
          font-size: 1.2rem;
        }

        .product-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin: 2rem 0;
        }

        .product-actions .btn {
          width: 100%;
        }

        .whatsapp-purchase-btn {
          background: #22c55e !important;
          color: white !important;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .whatsapp-purchase-btn:hover {
          background: #16a34a !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        }

        .wishlist-btn-detail {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-features,
        .shipping-info {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        .related-products {
          margin-top: 4rem;
          padding-top: 3rem;
          border-top: 2px solid var(--border-color);
        }

        .related-products .section-title {
          text-align: center;
          margin-bottom: 2.5rem;
          font-size: 2rem;
          color: var(--text-color);
          font-weight: 600;
        }

        .related-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .related-product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .related-product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .related-product-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          overflow: hidden;
          background: #f9fafb;
        }

        .related-product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .related-product-card:hover .related-product-image {
          transform: scale(1.05);
        }

        .related-product-discount-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--error-color);
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 1;
        }

        .related-product-info {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .related-product-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0 0 0.75rem 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 2.8em;
        }

        .related-product-price {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: auto;
        }

        .related-product-old-price {
          text-decoration: line-through;
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .related-product-current-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-color);
        }

        @media (max-width: 768px) {
          .product-detail {
            padding: 1.5rem 0;
            overflow-x: hidden;
            width: 100%;
            max-width: 100%;
          }

          .product-detail-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 0 15px;
          }

          .product-images {
            width: 100%;
            max-width: 100%;
          }

          .main-image {
            width: 100%;
            max-width: 100%;
            aspect-ratio: 1;
            margin-bottom: 1rem;
          }

          .main-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            max-width: 100%;
          }

          .thumbnail-images {
            gap: 0.75rem;
            flex-wrap: wrap;
            justify-content: center;
          }

          .thumbnail-images img {
            width: 70px;
            height: 70px;
            min-width: 70px;
            min-height: 70px;
          }

          .product-info-section {
            width: 100%;
            max-width: 100%;
          }

          .product-info-section h1 {
            font-size: clamp(1.5rem, 5vw, 1.75rem);
            line-height: 1.3;
            margin-bottom: 1rem;
          }

          .product-price-section {
            flex-wrap: wrap;
            gap: 0.75rem;
            margin: 1rem 0;
          }

          .old-price {
            font-size: clamp(1rem, 3.5vw, 1.2rem);
          }

          .current-price {
            font-size: clamp(1.5rem, 5vw, 1.8rem);
          }

          .discount-badge {
            font-size: clamp(11px, 3vw, 12px);
            padding: 4px 8px;
          }

          .product-description {
            font-size: clamp(0.9rem, 3.5vw, 1rem);
            line-height: 1.7;
          }

          .product-option {
            margin: 1.25rem 0;
          }

          .product-option label {
            font-size: clamp(0.9rem, 3.5vw, 1rem);
            margin-bottom: 0.75rem;
          }

          .option-buttons {
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .option-buttons button {
            padding: 10px 16px;
            font-size: clamp(0.85rem, 3vw, 0.9rem);
            min-height: 44px;
            flex: 1;
            min-width: calc(50% - 0.25rem);
          }

          .product-actions {
            gap: 0.75rem;
            margin: 1.5rem 0;
          }

          .product-actions .btn {
            width: 100%;
            min-height: 48px;
            font-size: clamp(14px, 3.5vw, 16px);
            padding: 14px 20px;
          }

          .whatsapp-purchase-btn {
            font-size: clamp(14px, 3.5vw, 16px) !important;
          }

          .wishlist-btn-detail {
            font-size: clamp(14px, 3.5vw, 16px) !important;
          }

          .product-features,
          .shipping-info {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
          }

          .product-features h3,
          .shipping-info h3 {
            font-size: clamp(1.1rem, 4vw, 1.25rem);
            margin-bottom: 1rem;
          }

          .product-features ul {
            padding-left: 1.5rem;
          }

          .product-features li {
            font-size: clamp(0.9rem, 3.5vw, 1rem);
            line-height: 1.7;
            margin-bottom: 0.5rem;
          }

          .shipping-info p {
            font-size: clamp(0.9rem, 3.5vw, 1rem);
            line-height: 1.7;
          }

          .related-products {
            margin-top: 3rem;
            padding-top: 2rem;
            padding: 0 15px;
          }

          .related-products .section-title {
            font-size: clamp(1.5rem, 5vw, 1.8rem);
            margin-bottom: 1.5rem;
            padding: 0;
          }

          .related-products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            padding: 0;
          }

          .related-product-card {
            border-radius: 10px;
          }

          .related-product-image-wrapper {
            aspect-ratio: 3/4;
          }

          .related-product-info {
            padding: 1rem;
          }

          .related-product-name {
            font-size: clamp(0.85rem, 3vw, 0.95rem);
            min-height: 2.6em;
            margin-bottom: 0.5rem;
          }

          .related-product-price {
            gap: 0.5rem;
          }

          .related-product-old-price {
            font-size: clamp(0.8rem, 2.5vw, 0.85rem);
          }

          .related-product-current-price {
            font-size: clamp(1rem, 3.5vw, 1.15rem);
          }

          .related-product-discount-badge {
            font-size: clamp(0.65rem, 2vw, 0.7rem);
            padding: 3px 8px;
            top: 8px;
            right: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;