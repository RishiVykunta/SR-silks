const { query } = require('../_lib/db');
const { corsHeaders, handleCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  // Handle CORS
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  if (req.method !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { id } = req.query;

    const result = await query(
      `SELECT *, 
        COALESCE(discount_price, price) as final_price,
        CASE WHEN discount_price IS NOT NULL THEN ROUND(((price - discount_price) / price * 100)::numeric, 0) ELSE 0 END as discount_percentage
      FROM products 
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Product not found' })
      };
    }

    // Get related products (same category, different ID)
    const relatedResult = await query(
      `SELECT *, 
        COALESCE(discount_price, price) as final_price
      FROM products 
      WHERE category = $1 AND id != $2 AND is_active = true 
      LIMIT 4`,
      [result.rows[0].category, id]
    );

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        product: result.rows[0],
        relatedProducts: relatedResult.rows
      })
    };
  } catch (error) {
    console.error('Product detail error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to fetch product' })
    };
  }
};
