import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../config/api';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Load wishlist on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWishlist();
    } else {
      loadGuestWishlist();
    }
  }, [isAuthenticated, user]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      setWishlistItems(response.data.items || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGuestWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem('guestWishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Error loading guest wishlist:', error);
    }
  };

  const saveGuestWishlist = (items) => {
    localStorage.setItem('guestWishlist', JSON.stringify(items));
  };

  const toggleWishlist = async (product) => {
    try {
      if (isAuthenticated) {
        const response = await api.post('/wishlist/toggle', {
          product_id: product.id
        });
        await loadWishlist();
        return { success: true, inWishlist: response.data.inWishlist };
      } else {
        // Guest wishlist
        const existingIndex = wishlistItems.findIndex(
          item => item.product_id === product.id
        );

        let newItems;
        if (existingIndex >= 0) {
          newItems = wishlistItems.filter(item => item.product_id !== product.id);
        } else {
          newItems = [
            ...wishlistItems,
            {
              id: Date.now(),
              product_id: product.id,
              product: product,
              name: product.name,
              images: product.images,
              price: product.price,
              discount_price: product.discount_price,
              final_price: product.discount_price || product.price
            }
          ];
        }

        setWishlistItems(newItems);
        saveGuestWishlist(newItems);
        return { success: true, inWishlist: existingIndex < 0 };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to toggle wishlist'
      };
    }
  };

  const addToWishlist = async (product) => {
    try {
      if (isAuthenticated) {
        await api.post('/wishlist/add', { product_id: product.id });
        await loadWishlist();
      } else {
        const newItems = [
          ...wishlistItems,
          {
            id: Date.now(),
            product_id: product.id,
            product: product,
            name: product.name,
            images: product.images,
            price: product.price,
            discount_price: product.discount_price,
            final_price: product.discount_price || product.price
          }
        ];
        setWishlistItems(newItems);
        saveGuestWishlist(newItems);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to wishlist'
      };
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      if (isAuthenticated) {
        await api.delete(`/wishlist/remove/${itemId}`);
        await loadWishlist();
      } else {
        const newItems = wishlistItems.filter(item => item.id !== itemId);
        setWishlistItems(newItems);
        saveGuestWishlist(newItems);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove from wishlist'
      };
    }
  };

  const clearWishlist = async () => {
    try {
      if (isAuthenticated) {
        // Note: API might not have clear endpoint, so remove items individually
        for (const item of wishlistItems) {
          await api.delete(`/wishlist/remove/${item.id}`);
        }
        setWishlistItems([]);
      } else {
        setWishlistItems([]);
        localStorage.removeItem('guestWishlist');
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to clear wishlist'
      };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const wishlistCount = wishlistItems.length;

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    loadWishlist,
    isInWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};