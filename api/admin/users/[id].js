const { query } = require('../../_lib/db');
const { authenticateAdmin } = require('../../_lib/auth');
const { corsHeaders, handleCors } = require('../../_lib/cors');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;
  if (req.method !== 'GET') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const { id } = req.query;

    const userResult = await query('SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = $1', [id]);

    if (userResult.rows.length === 0) {
      return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: 'User not found' }) };
    }

    const ordersResult = await query('SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = $1', [id]);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        user: userResult.rows[0],
        stats: { totalOrders: parseInt(ordersResult.rows[0].count), totalSpent: parseFloat(ordersResult.rows[0].total) }
      })
    };
  } catch (error) {
    console.error('User details error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to fetch user details' }) };
  }
};
