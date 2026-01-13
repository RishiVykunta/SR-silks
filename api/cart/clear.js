const { query } = require('../_lib/db');
const { authenticate } = require('../_lib/auth');
const { corsHeaders, handleCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  if (req.method !== 'DELETE') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };
    }

    await query('DELETE FROM cart WHERE user_id = $1', [authResult.user.id]);
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ message: 'Cart cleared' }) };
  } catch (error) {
    console.error('Clear cart error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to clear cart' }) };
  }
};
