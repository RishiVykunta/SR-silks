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
    const { search, page = 1, limit = 20 } = queryParams;

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
      `SELECT id, email, first_name, last_name, phone, created_at FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    const countResult = await query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params.slice(0, params.length - 2));
    const total = parseInt(countResult.rows[0].total);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        users: usersResult.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
      })
    };
  } catch (error) {
    console.error('Admin users error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to fetch users' }) };
  }
};
