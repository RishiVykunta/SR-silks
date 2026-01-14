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
      `SELECT w.*, p.name, p.images, p.price, p.discount_price,
        COALESCE(p.discount_price, p.price) as final_price,
        CASE WHEN p.discount_price IS NOT NULL THEN ROUND(((p.price - p.discount_price) / p.price * 100)::numeric, 0) ELSE 0 END as discount_percentage
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1 AND p.is_active = true
      ORDER BY w.created_at DESC`,
      [authResult.user.id]
    );

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ items: result.rows }) };
  } catch (error) {
    console.error('Get wishlist error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to fetch wishlist' }) };
  }
};
