const { query } = require('../../_lib/db');
const { authenticateAdmin } = require('../../_lib/auth');
const { corsHeaders, handleCors } = require('../../_lib/cors');
const { parseBody } = require('../../_lib/request');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const { id } = req.query;

    if (req.method === 'GET') {
      const orderResult = await query('SELECT o.*, u.email, u.first_name, u.last_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = $1', [id]);

      if (orderResult.rows.length === 0) {
        return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: 'Order not found' }) };
      }

      const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [id]);

      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify({ order: { ...orderResult.rows[0], items: itemsResult.rows } })
      };
    } else {
      return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    console.error('Order details error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to fetch order details' }) };
  }
};
