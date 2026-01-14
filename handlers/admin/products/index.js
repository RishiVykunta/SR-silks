const { query } = require('../../_lib/db');
const { authenticateAdmin } = require('../../_lib/auth');
const { corsHeaders, handleCors } = require('../../_lib/cors');
const { getQuery, parseBody } = require('../../_lib/request');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    if (req.method === 'GET') {
      const queryParams = getQuery(req);
      const { search, category, status, page = 1, limit = 20 } = queryParams;

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

      const countResult = await query(`SELECT COUNT(*) as total FROM products ${whereClause}`, params.slice(0, params.length - 2));
      const total = parseInt(countResult.rows[0].total);

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({
          products: productsResult.rows,
          pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
        })
      };
    } else if (req.method === 'POST') {
      const body = parseBody(req);
      const { name, description, price, discount_price, category, occasion_type, collection_name, images, size, color, material, features, specifications, shipping_info, stock, is_active, is_new_arrival, is_featured } = body;

      if (!name || !price) {
        return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Name and price are required' }) };
      }

      const result = await query(
        `INSERT INTO products (name, description, price, discount_price, category, occasion_type, collection_name, images, size, color, material, features, specifications, shipping_info, stock, is_active, is_new_arrival, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
        [name, description || null, price, discount_price || null, category || null, occasion_type || null, collection_name || null, images || [], size || [], color || [], material || null, features || [], specifications ? JSON.stringify(specifications) : null, shipping_info || null, stock || 0, is_active !== undefined ? is_active : true, is_new_arrival || false, is_featured || false]
      );

      return {
        statusCode: 201,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Product created successfully', product: result.rows[0] })
      };
    } else {
      return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    console.error('Admin products error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to process request' }) };
  }
};
