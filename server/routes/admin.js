const express = require('express');
const { query } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication
router.use(authenticateAdmin);

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Total users
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Total products
    const productsResult = await query('SELECT COUNT(*) as count FROM products');
    const totalProducts = parseInt(productsResult.rows[0].count);

    // Total orders
    const ordersResult = await query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].count);

    // Total revenue
    const revenueResult = await query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != \'cancelled\''
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].total || 0);

    // Monthly revenue
    const monthlyRevenueResult = await query(
      `SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month DESC`
    );

    // Average order value
    const avgOrderResult = await query(
      'SELECT COALESCE(AVG(total_amount), 0) as avg FROM orders WHERE status != \'cancelled\''
    );
    const avgOrderValue = parseFloat(avgOrderResult.rows[0].avg || 0);

    // Orders by status
    const ordersByStatusResult = await query(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    );

    // Recent orders
    const recentOrdersResult = await query(
      `SELECT o.*, u.email, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10`
    );

    // Top products
    const topProductsResult = await query(
      `SELECT 
        p.id, p.name, p.images,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY p.id, p.name, p.images
      ORDER BY total_sold DESC
      LIMIT 10`
    );

    res.json({
      analytics: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        avgOrderValue: avgOrderValue.toFixed(2),
        monthlyRevenue: monthlyRevenueResult.rows,
        ordersByStatus: ordersByStatusResult.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count);
          return acc;
        }, {}),
        recentOrders: recentOrdersResult.rows,
        topProducts: topProductsResult.rows
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all products (admin view - includes inactive)
router.get('/products', async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (status !== undefined && status !== '') {
      whereConditions.push(`is_active = $${paramIndex}`);
      params.push(status === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const productsResult = await query(
      `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      params.slice(0, params.length - 2)
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      products: productsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create new product
router.post('/products', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discount_price,
      category,
      occasion_type,
      collection_name,
      images,
      size,
      color,
      material,
      features,
      specifications,
      shipping_info,
      stock,
      is_active,
      is_new_arrival,
      is_featured
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const result = await query(
      `INSERT INTO products (
        name, description, price, discount_price, category, occasion_type, collection_name,
        images, size, color, material, features, specifications, shipping_info,
        stock, is_active, is_new_arrival, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        name, description || null, price, discount_price || null, category || null, occasion_type || null, collection_name || null,
        images || [], size || [], color || [], material || null, features || [], 
        specifications ? JSON.stringify(specifications) : null, shipping_info || null,
        stock || 0, is_active !== undefined ? is_active : true,
        is_new_arrival || false, is_featured || false
      ]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discount_price,
      category,
      occasion_type,
      collection_name,
      images,
      size,
      color,
      material,
      features,
      specifications,
      shipping_info,
      stock,
      is_active,
      is_new_arrival,
      is_featured
    } = req.body;

    const result = await query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        discount_price = $4,
        category = COALESCE($5, category),
        occasion_type = $6,
        collection_name = COALESCE($7, collection_name),
        images = COALESCE($8, images),
        size = COALESCE($9, size),
        color = COALESCE($10, color),
        material = COALESCE($11, material),
        features = COALESCE($12, features),
        specifications = $13,
        shipping_info = COALESCE($14, shipping_info),
        stock = COALESCE($15, stock),
        is_active = COALESCE($16, is_active),
        is_new_arrival = COALESCE($17, is_new_arrival),
        is_featured = COALESCE($18, is_featured),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING *`,
      [
        name, description, price, discount_price, category, occasion_type || null, collection_name,
        images, size, color, material, features,
        specifications ? JSON.stringify(specifications) : null, shipping_info,
        stock, is_active, is_new_arrival, is_featured, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Toggle product status
router.put('/products/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE products SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, is_active',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product status updated',
      is_active: result.rows[0].is_active
    });
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({ error: 'Failed to toggle product status' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (status) {
      whereConditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(o.order_number ILIKE $${paramIndex} OR o.email ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const ordersResult = await query(
      `SELECT o.*, u.email, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id ${whereClause}`,
      params.slice(0, params.length - 2)
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      orders: ordersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await query(
      `SELECT o.*, u.email, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    res.json({
      order: {
        ...orderResult.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('Order details error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Order status updated',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    let whereClause = '';
    let params = [];
    let paramIndex = 1;

    if (search) {
      whereClause = `WHERE email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const usersResult = await query(
      `SELECT id, email, first_name, last_name, phone, created_at 
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params.slice(0, params.length - 2)
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      users: usersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await query(
      'SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const ordersResult = await query(
      'SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = $1',
      [id]
    );

    res.json({
      user: userResult.rows[0],
      stats: {
        totalOrders: parseInt(ordersResult.rows[0].count),
        totalSpent: parseFloat(ordersResult.rows[0].total)
      }
    });
  } catch (error) {
    console.error('User details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

module.exports = router;