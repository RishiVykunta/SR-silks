const { query } = require('../_lib/db');
const { authenticate } = require('../_lib/auth');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { parseBody } = require('../_lib/request');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };
    }

    const { product_id, quantity = 1, size, color } = parseBody(req);

    if (!product_id) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Product ID is required' }) };
    }

    const productResult = await query('SELECT * FROM products WHERE id = $1 AND is_active = true', [product_id]);
    if (productResult.rows.length === 0) {
      return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: 'Product not found' }) };
    }

    const existingResult = await query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2 AND size = $3 AND color = $4',
      [authResult.user.id, product_id, size || null, color || null]
    );

    if (existingResult.rows.length > 0) {
      const newQuantity = existingResult.rows[0].quantity + quantity;
      await query('UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newQuantity, existingResult.rows[0].id]);
    } else {
      await query('INSERT INTO cart (user_id, product_id, quantity, size, color) VALUES ($1, $2, $3, $4, $5)',
        [authResult.user.id, product_id, quantity, size || null, color || null]);
    }

    return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ message: 'Item added to cart' }) };
  } catch (error) {
    console.error('Add to cart error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to add item to cart' }) };
  }
};

