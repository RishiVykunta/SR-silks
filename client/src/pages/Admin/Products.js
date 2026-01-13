import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadProducts();
  }, [isAdmin, navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      await api.put(`/admin/products/${productId}/toggle-status`);
      loadProducts();
    } catch (error) {
      alert('Failed to update product status');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/admin/products/${productId}`);
      loadProducts();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  if (!isAdmin) return null;
  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Manage Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">Add New Product</Link>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No products found. <Link to="/admin/products/new">Add your first product</Link>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category || '-'}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock || 0}</td>
                  <td>
                    <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/admin/products/${product.id}/edit`} className="btn btn-outline">Edit</Link>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleToggleStatus(product.id)}
                      >
                        {product.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleDelete(product.id)}
                        style={{ color: 'var(--error-color)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .products-table {
          background: white;
          border-radius: 8px;
          box-shadow: var(--shadow);
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        th {
          background: var(--light-color);
          font-weight: 600;
        }

        .status-badge {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.active {
          background: #efe;
          color: var(--success-color);
        }

        .status-badge.inactive {
          background: #fee;
          color: var(--error-color);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .action-buttons .btn {
          padding: 5px 10px;
          font-size: 12px;
        }

        @media (max-width: 768px) {
          .products-table {
            font-size: 12px;
          }

          th, td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminProducts;