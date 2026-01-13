const { query } = require('../../_lib/db');
const { authenticate } = require('../../_lib/auth');
const { corsHeaders, handleCors } = require('../../_lib/cors');

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

    const { id } = req.query;
    const checkResult = await query('SELECT * FROM cart WHERE id = $1 AND user_id = $2', [id, authResult.user.id]);
    if (checkResult.rows.length === 0) {
      return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: 'Cart item not found' }) };
    }

    await query('DELETE FROM cart WHERE id = $1', [id]);
    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ message: 'Item removed from cart' }) };
  } catch (error) {
    console.error('Remove from cart error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to remove item from cart' }) };
  }
};
