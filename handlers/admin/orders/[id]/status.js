const { query } = require('../../../_lib/db');
const { authenticateAdmin } = require('../../../_lib/auth');
const { corsHeaders, handleCors } = require('../../../_lib/cors');
const { parseBody } = require('../../../_lib/request');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;
  if (req.method !== 'PUT') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const { id } = req.query;
    const { status } = parseBody(req);

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Invalid status' }) };
    }

    const result = await query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [status, id]);

    if (result.rows.length === 0) {
      return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: 'Order not found' }) };
    }

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ message: 'Order status updated', order: result.rows[0] }) };
  } catch (error) {
    console.error('Update order status error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to update order status' }) };
  }
};
