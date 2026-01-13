const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user cart
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, p.name, p.images, p.price, p.discount_price,
        COALESCE(p.discount_price, p.price) as final_price,
        (COALESCE(p.discount_price, p.price) * c.quantity) as item_total
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1 AND p.is_active = true
      ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    // Calculate totals
    const subtotal = result.rows.reduce((sum, item) => sum + parseFloat(item.item_total || 0), 0);
    const shippingThreshold = 5000;
    const shipping = subtotal >= shippingThreshold ? 0 : 200;
    const total = subtotal + shipping;

    res.json({
      items: result.rows,
      summary: {
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        freeShippingThreshold: shippingThreshold,
        freeShippingProgress: Math.min((subtotal / shippingThreshold) * 100, 100)
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', authenticate, async (req, res) => {
  try {
    const { product_id, quantity = 1, size, color } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists and is active
    const productResult = await query('SELECT * FROM products WHERE id = $1 AND is_active = true', [product_id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already exists in cart
    const existingResult = await query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3 AND color = $4',
      [req.user.id, product_id, size || null, color || null]
    );

    if (existingResult.rows.length > 0) {
      // Update quantity
      const newQuantity = existingResult.rows[0].quantity + quantity;
      await query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQuantity, existingResult.rows[0].id]
      );
    } else {
      // Add new item
      await query(
        'INSERT INTO cart (user_id, product_id, quantity, size, color) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, product_id, quantity, size || null, color || null]
      );
    }

    res.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/update/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    // Verify cart item belongs to user
    const checkResult = await query('SELECT * FROM cart WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await query(
      'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, id]
    );

    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/remove/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify cart item belongs to user
    const checkResult = await query('SELECT * FROM cart WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await query('DELETE FROM cart WHERE id = $1', [id]);

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear entire cart
router.delete('/clear', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Get cart count
router.get('/count', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM cart WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Cart count error:', error);
    res.status(500).json({ error: 'Failed to get cart count' });
  }
});

module.exports = router;