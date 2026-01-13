const { query } = require('../_lib/db');
const { authenticate } = require('../_lib/auth');
const { corsHeaders, handleCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;
  if (req.method !== 'GET') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const authResult = await authenticate(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const result = await query(
      `SELECT o.*, json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name, 'product_image', oi.product_image, 'price', oi.price, 'quantity', oi.quantity, 'size', oi.size, 'color', oi.color, 'subtotal', oi.subtotal)) as items
      FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.user_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`,
      [authResult.user.id]
    );

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ orders: result.rows }) };
  } catch (error) {
    console.error('Get user orders error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to fetch orders' }) };
  }
};
