const { query } = require('../_lib/db');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { getQuery } = require('../_lib/request');

module.exports = async (req, res) => {
  // Handle CORS
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  if (req.method !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const queryParams = getQuery(req);
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
    } = queryParams;

    let whereConditions = ['is_active = true'];
    let params = [];
    let paramIndex = 1;

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (collection) {
      // Normalize collection name: convert hyphens to spaces (e.g., "Special-Occasions" -> "Special Occasions")
      const normalizedCollection = collection.replace(/-/g, ' ');
      
      // Check if collection matches occasion types FIRST (Formal, Party, Casual, Traditional, Special Occasions)
      // These should be filtered by occasion_type field
      const occasionTypes = ['Formal', 'Party', 'Casual', 'Traditional', 'Special Occasions'];
      if (occasionTypes.includes(normalizedCollection)) {
        // Filter by occasion_type for these collections
        whereConditions.push(`occasion_type = $${paramIndex}`);
        params.push(normalizedCollection);
        paramIndex++;
      } else {
        // Check if collection matches categories (Silk, Banarasi, Designer, Bridal)
        // Note: Party is NOT in categories - it's an occasion type
        const categories = ['Silk', 'Banarasi', 'Designer', 'Bridal'];
        if (categories.includes(normalizedCollection)) {
          // Filter by category for these collections
          whereConditions.push(`category = $${paramIndex}`);
          params.push(normalizedCollection);
          paramIndex++;
        } else {
          // For other collections (like Celebrate), filter by collection_name
          whereConditions.push(`collection_name = $${paramIndex}`);
          params.push(normalizedCollection);
          paramIndex++;
        }
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

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        products: productsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      })
    };
  } catch (error) {
    console.error('Products error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to fetch products' })
    };
  }
};

