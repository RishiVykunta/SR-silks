const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      collection, 
      search,
      min_price,
      max_price,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    let whereConditions = ['is_active = true'];
    let params = [];
    let paramIndex = 1;

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (collection) {
      // Check if collection matches occasion types (Formal, Party, Casual, Traditional, Special Occasions)
      const occasionTypes = ['Formal', 'Party', 'Casual', 'Traditional', 'Special Occasions'];
      if (occasionTypes.includes(collection)) {
        // Filter by occasion_type for these collections
        whereConditions.push(`occasion_type = $${paramIndex}`);
        params.push(collection);
        paramIndex++;
      } else {
        // For other collections (like Celebrate), filter by collection_name
        whereConditions.push(`collection_name = $${paramIndex}`);
        params.push(collection);
        paramIndex++;
      }
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (min_price) {
      const discountPrice = `COALESCE(discount_price, price)`;
      whereConditions.push(`${discountPrice} >= $${paramIndex}`);
      params.push(min_price);
      paramIndex++;
    }

    if (max_price) {
      const discountPrice = `COALESCE(discount_price, price)`;
      whereConditions.push(`${discountPrice} <= $${paramIndex}`);
      params.push(max_price);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const validSortColumns = ['name', 'price', 'created_at', 'discount_price'];
    const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get products
    const productsResult = await query(
      `SELECT *, 
        COALESCE(discount_price, price) as final_price,
        CASE WHEN discount_price IS NOT NULL THEN ROUND(((price - discount_price) / price * 100)::numeric, 0) ELSE 0 END as discount_percentage
      FROM products 
      ${whereClause} 
      ORDER BY ${sortColumn} ${sortOrder} 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      params.slice(0, params.length - 2)
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      products: productsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get new arrivals
router.get('/new-arrivals', async (req, res) => {
  try {
    const result = await query(
      `SELECT *, 
        COALESCE(discount_price, price) as final_price,
        CASE WHEN discount_price IS NOT NULL THEN ROUND(((price - discount_price) / price * 100)::numeric, 0) ELSE 0 END as discount_percentage
      FROM products 
      WHERE is_active = true AND is_new_arrival = true 
      ORDER BY created_at DESC 
      LIMIT 20`
    );

    res.json({ products: result.rows });
  } catch (error) {
    console.error('New arrivals error:', error);
    res.status(500).json({ error: 'Failed to fetch new arrivals' });
  }
});

// Get celebrate collection with price filter
router.get('/celebrate', async (req, res) => {
  try {
    const { price_filter } = req.query;
    let whereClause = "is_active = true AND collection_name = 'Celebrate'";
    let params = [];

    if (price_filter) {
      const price = parseInt(price_filter);
      if (price === 10) {
        whereClause += ' AND COALESCE(discount_price, price) <= 10000';
      } else if (price === 20) {
        whereClause += ' AND COALESCE(discount_price, price) > 10000 AND COALESCE(discount_price, price) <= 20000';
      } else if (price === 30) {
        whereClause += ' AND COALESCE(discount_price, price) > 20000 AND COALESCE(discount_price, price) <= 30000';
      } else if (price === 50) {
        whereClause += ' AND COALESCE(discount_price, price) > 50000';
      }
    }

    const result = await query(
      `SELECT *, 
        COALESCE(discount_price, price) as final_price,
        CASE WHEN discount_price IS NOT NULL THEN ROUND(((price - discount_price) / price * 100)::numeric, 0) ELSE 0 END as discount_percentage
      FROM products 
      WHERE ${whereClause}
      ORDER BY created_at DESC`
    );

    res.json({ products: result.rows });
  } catch (error) {
    console.error('Celebrate collection error:', error);
    res.status(500).json({ error: 'Failed to fetch celebrate collection' });
  }
});

// Get all categories
router.get('/categories/list', async (req, res) => {
  try {
    const result = await query(
      'SELECT DISTINCT category FROM products WHERE is_active = true AND category IS NOT NULL ORDER BY category'
    );

    res.json({ categories: result.rows.map(r => r.category) });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT *, 
        COALESCE(discount_price, price) as final_price,
        CASE WHEN discount_price IS NOT NULL THEN ROUND(((price - discount_price) / price * 100)::numeric, 0) ELSE 0 END as discount_percentage
      FROM products 
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get related products (same category, different ID)
    const relatedResult = await query(
      `SELECT *, 
        COALESCE(discount_price, price) as final_price
      FROM products 
      WHERE category = $1 AND id != $2 AND is_active = true 
      LIMIT 4`,
      [result.rows[0].category, id]
    );

    res.json({
      product: result.rows[0],
      relatedProducts: relatedResult.rows
    });
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;