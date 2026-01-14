const { query } = require('../../../_lib/db');
const { authenticateAdmin } = require('../../../_lib/auth');
const { corsHeaders, handleCors } = require('../../../_lib/cors');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;
  if (req.method !== 'PUT') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const { id } = req.query;
    const result = await query('UPDATE products SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, is_active', [id]);

    if (result.rows.length === 0) {
      return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: 'Product not found' }) };
    }

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ message: 'Product status updated', is_active: result.rows[0].is_active }) };
  } catch (error) {
    console.error('Toggle product status error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to toggle product status' }) };
  }
};
