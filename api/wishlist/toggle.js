const { query } = require('../_lib/db');
const { authenticate } = require('../_lib/auth');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { parseBody } = require('../_lib/request');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;
  if (req.method !== 'POST') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const authResult = await authenticate(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const { product_id } = parseBody(req);
    if (!product_id) return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Product ID is required' }) };

    const existingResult = await query('SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2', [authResult.user.id, product_id]);

    if (existingResult.rows.length > 0) {
      await query('DELETE FROM wishlist WHERE id = $1', [existingResult.rows[0].id]);
      return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ message: 'Removed from wishlist', inWishlist: false }) };
    } else {
      await query('INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)', [authResult.user.id, product_id]);
      return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ message: 'Added to wishlist', inWishlist: true }) };
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to toggle wishlist' }) };
  }
};
