const express = require('express');
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', authenticate, async (req, res) => {
  const client = await require('../config/database').pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      first_name,
      last_name,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      payment_method
    } = req.body;

    // Get cart items
    const cartResult = await client.query(
      `SELECT c.*, p.name, p.images, p.price, p.discount_price,
        COALESCE(p.discount_price, p.price) as final_price
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1 AND p.is_active = true`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate totals
    const subtotal = cartResult.rows.reduce((sum, item) => {
      return sum + (parseFloat(item.final_price) * item.quantity);
    }, 0);
    const shippingThreshold = 5000;
    const shipping = subtotal >= shippingThreshold ? 0 : 200;
    const total = subtotal + shipping;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${req.user.id}`;

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (
        user_id, order_number, total_amount, shipping_amount, subtotal,
        first_name, last_name, email, phone,
        address_line1, address_line2, city, state, postal_code, country, payment_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        req.user.id, orderNumber, total, shipping, subtotal,
        first_name, last_name, email, phone,
        address_line1, address_line2 || null, city, state, postal_code, country || 'India', payment_method
      ]
    );

    const order = orderResult.rows[0];

    // Create order items and update stock
    for (const item of cartResult.rows) {
      // Check stock availability
      const productCheck = await client.query(
        'SELECT stock FROM products WHERE id = $1',
        [item.product_id]
      );

      if (productCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Product ${item.name} not found` });
      }

      const currentStock = productCheck.rows[0].stock || 0;
      if (currentStock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.name}. Available: ${currentStock}, Requested: ${item.quantity}` 
        });
      }

      // Create order item
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_image, price, quantity, size, color, subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          order.id,
          item.product_id,
          item.name,
          item.images && item.images.length > 0 ? item.images[0] : null,
          item.final_price,
          item.quantity,
          item.size || null,
          item.color || null,
          parseFloat(item.final_price) * item.quantity
        ]
      );

      // Decrease stock
      await client.query(
        'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    // Get complete order details
    const orderDetailsResult = await client.query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_image', oi.product_image,
            'price', oi.price,
            'quantity', oi.quantity,
            'size', oi.size,
            'color', oi.color,
            'subtotal', oi.subtotal
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id`,
      [order.id]
    );

    res.status(201).json({
      message: 'Order created successfully',
      order: orderDetailsResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// Get user orders
router.get('/user', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_image', oi.product_image,
            'price', oi.price,
            'quantity', oi.quantity,
            'size', oi.size,
            'color', oi.color,
            'subtotal', oi.subtotal
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;