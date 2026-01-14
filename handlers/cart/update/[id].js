const { query } = require('../../_lib/db');
const { authenticate } = require('../../_lib/auth');
const { corsHeaders, handleCors } = require('../../_lib/cors');
const { parseBody } = require('../../_lib/request');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  if (req.method !== 'PUT') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };
    }

    const { id } = req.query;
    const { quantity } = parseBody(req);

    if (!quantity || quantity < 1) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Valid quantity is required' }) };
    }

    const checkResult = await query('SELECT * FROM cart WHERE id = $1 AND user_id = $2', [id, authResult.user.id]);
    if (checkResult.rows.length === 0) {
      return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: 'Cart item not found' }) };
    }

    await query('UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [quantity, id]);

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ message: 'Cart updated' }) };
  } catch (error) {
    console.error('Update cart error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to update cart' }) };
  }
};

