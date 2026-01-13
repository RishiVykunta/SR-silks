const { query } = require('../../_lib/db');
const { authenticateAdmin } = require('../../_lib/auth');
const { corsHeaders, handleCors } = require('../../_lib/cors');
const { getQuery } = require('../../_lib/request');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;
  if (req.method !== 'GET') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const queryParams = getQuery(req);
    const { status, search, page = 1, limit = 20 } = queryParams;

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
      `SELECT o.*, u.email, u.first_name, u.last_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ${whereClause} ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const countResult = await query(`SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id ${whereClause}`, params.slice(0, params.length - 2));
    const total = parseInt(countResult.rows[0].total);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        orders: ordersResult.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
      })
    };
  } catch (error) {
    console.error('Admin orders error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to fetch orders' }) };
  }
};
