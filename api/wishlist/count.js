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

    const result = await query('SELECT COUNT(*) as count FROM wishlist WHERE user_id = $1', [authResult.user.id]);
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ count: parseInt(result.rows[0].count) }) };
  } catch (error) {
    console.error('Wishlist count error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to get wishlist count' }) };
  }
};
