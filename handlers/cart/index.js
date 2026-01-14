const { query } = require('../_lib/db');
const { authenticate } = require('../_lib/auth');
const { corsHeaders, handleCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  if (req.method !== 'GET') {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };
    }

    const result = await query(
      `SELECT c.*, p.name, p.images, p.price, p.discount_price,
        COALESCE(p.discount_price, p.price) as final_price,
        (COALESCE(p.discount_price, p.price) * c.quantity) as item_total
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1 AND p.is_active = true
      ORDER BY c.created_at DESC`,
      [authResult.user.id]
    );

    const subtotal = result.rows.reduce((sum, item) => sum + parseFloat(item.item_total || 0), 0);
    const shippingThreshold = 5000;
    const shipping = subtotal >= shippingThreshold ? 0 : 200;
    const total = subtotal + shipping;

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        items: result.rows,
        summary: {
          subtotal: subtotal.toFixed(2),
          shipping: shipping.toFixed(2),
          total: total.toFixed(2),
          freeShippingThreshold: shippingThreshold,
          freeShippingProgress: Math.min((subtotal / shippingThreshold) * 100, 100)
        }
      })
    };
  } catch (error) {
    console.error('Get cart error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to fetch cart' }) };
  }
};

