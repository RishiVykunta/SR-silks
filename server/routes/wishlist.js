const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user wishlist
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT w.*, p.name, p.images, p.price, p.discount_price,
        COALESCE(p.discount_price, p.price) as final_price,
        CASE WHEN p.discount_price IS NOT NULL THEN ROUND(((p.price - p.discount_price) / p.price * 100)::numeric, 0) ELSE 0 END as discount_percentage
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1 AND p.is_active = true
      ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist
router.post('/add', authenticate, async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const productResult = await query('SELECT * FROM products WHERE id = $1 AND is_active = true', [product_id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if already in wishlist
    const existingResult = await query(
      'SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    await query(
      'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
      [req.user.id, product_id]
    );

    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/remove/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify wishlist item belongs to user
    const checkResult = await query('SELECT * FROM wishlist WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    await query('DELETE FROM wishlist WHERE id = $1', [id]);

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Toggle wishlist (add if not exists, remove if exists)
router.post('/toggle', authenticate, async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const existingResult = await query(
      'SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingResult.rows.length > 0) {
      await query('DELETE FROM wishlist WHERE id = $1', [existingResult.rows[0].id]);
      res.json({ message: 'Removed from wishlist', inWishlist: false });
    } else {
      await query(
        'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
        [req.user.id, product_id]
      );
      res.json({ message: 'Added to wishlist', inWishlist: true });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ error: 'Failed to toggle wishlist' });
  }
});

// Get wishlist count
router.get('/count', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT COUNT(*) as count FROM wishlist WHERE user_id = $1',
      [req.user.id]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Wishlist count error:', error);
    res.status(500).json({ error: 'Failed to get wishlist count' });
  }
});

module.exports = router;