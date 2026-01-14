import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { CATEGORIES, COLLECTIONS } from '../../config/constants';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category: '',
    occasion_type: '',
    collection_name: '',
    images: [],
    size: [],
    color: [],
    material: '',
    features: [],
    specifications: {},
    shipping_info: '',
    stock: 0,
    is_active: true,
    is_new_arrival: false,
    is_featured: false
  });

  const [newFeature, setNewFeature] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/products`);
      const product = response.data.products.find(p => p.id === parseInt(id));
      
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          discount_price: product.discount_price || '',
          category: product.category || '',
          occasion_type: product.occasion_type || '',
          collection_name: product.collection_name || '',
          images: product.images || [],
          size: product.size || [],
          color: product.color || [],
          material: product.material || '',
          features: product.features || [],
          specifications: typeof product.specifications === 'string' 
            ? JSON.parse(product.specifications || '{}') 
            : (product.specifications || {}),
          shipping_info: product.shipping_info || '',
          stock: product.stock || 0,
          is_active: product.is_active !== undefined ? product.is_active : true,
          is_new_arrival: product.is_new_arrival || false,
          is_featured: product.is_featured || false
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }

    if (isEditMode) {
      loadProduct();
    }
  }, [isAdmin, navigate, isEditMode, loadProduct]);

  // Auto-slide images every 0.6 seconds
  useEffect(() => {
    if (formData.images && formData.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % formData.images.length);
      }, 600);
      return () => clearInterval(interval);
    } else {
      setCurrentImageIndex(0);
    }
  }, [formData.images]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await api.post('/upload/images', formData);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...response.data.images.map(img => img.url)]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addSize = () => {
    if (newSize.trim()) {
      setFormData(prev => ({
        ...prev,
        size: [...prev.size, newSize.trim()]
      }));
      setNewSize('');
    }
  };

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      size: prev.size.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    if (newColor.trim()) {
      setFormData(prev => ({
        ...prev,
        color: [...prev.color, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      color: prev.color.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert('Name and price are required');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock) || 0,
        specifications: Object.keys(formData.specifications).length > 0 
          ? formData.specifications 
          : null
      };

      if (isEditMode) {
        await api.put(`/admin/products/${id}`, submitData);
        alert('Product updated successfully!');
      } else {
        await api.post('/admin/products', submitData);
        alert('Product created successfully!');
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;
  if (loading && isEditMode) return <div className="loading">Loading product...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '900px' }}>
      <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
      
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
        {/* Basic Information */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Basic Information</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Discount Price (₹)
              </label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Occasion Type
              </label>
              <select
                name="occasion_type"
                value={formData.occasion_type || ''}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              >
                <option value="">Select Occasion Type</option>
                <option value="Formal">Formal</option>
                <option value="Party">Party</option>
                <option value="Special Occasions">Special Occasions</option>
                <option value="Casual">Casual</option>
                <option value="Traditional">Traditional</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Collection
              </label>
              <select
                name="collection_name"
                value={formData.collection_name}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              >
                <option value="">Select Collection</option>
                {COLLECTIONS.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Material
            </label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Shipping Info
            </label>
            <textarea
              name="shipping_info"
              value={formData.shipping_info}
              onChange={handleInputChange}
              rows="2"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* Images */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Product Images</h2>
          
          {/* Image URL Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Add Image URL
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
              />
              <button type="button" onClick={addImageUrl} className="btn btn-outline">Add URL</button>
            </div>
          </div>

          {/* File Upload */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Or Upload Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ marginBottom: '0.5rem' }}
            />
            {uploading && <p>Uploading images...</p>}
          </div>

          {/* Image Carousel Preview */}
          {formData.images.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Image Preview (Auto-sliding every 0.6s)</h3>
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '600px', 
                height: '400px', 
                margin: '0 auto',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid var(--border-color)'
              }}>
                {formData.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Product ${index + 1}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: index === currentImageIndex ? 1 : 0,
                      transition: 'opacity 0.6s ease-in-out',
                      zIndex: index === currentImageIndex ? 1 : 0
                    }}
                  />
                ))}
                {formData.images.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10
                  }}>
                    {formData.images.map((_, index) => (
                      <div
                        key={index}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image List */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>All Images ({formData.images.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {formData.images.map((image, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', border: index === currentImageIndex ? '3px solid #22c55e' : '1px solid var(--border-color)' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '25px',
                      height: '25px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Sizes</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="Add size"
              style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            />
            <button type="button" onClick={addSize} className="btn btn-outline">Add</button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {formData.size.map((size, index) => (
              <span key={index} style={{ background: 'var(--light-color)', padding: '0.5rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {size}
                <button type="button" onClick={() => removeSize(index)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Colors</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="Add color"
              style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            />
            <button type="button" onClick={addColor} className="btn btn-outline">Add</button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {formData.color.map((color, index) => (
              <span key={index} style={{ background: 'var(--light-color)', padding: '0.5rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {color}
                <button type="button" onClick={() => removeColor(index)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Features</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add feature"
              style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            />
            <button type="button" onClick={addFeature} className="btn btn-outline">Add</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {formData.features.map((feature, index) => (
              <li key={index} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>• {feature}</span>
                <button type="button" onClick={() => removeFeature(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Status Flags */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              Active
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="is_new_arrival"
                checked={formData.is_new_arrival}
                onChange={handleInputChange}
              />
              New Arrival
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
              />
              Featured
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
