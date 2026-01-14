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
    const result = await query(
      `SELECT *, 
        COALESCE(discount_price, price) as final_price,
        CASE WHEN discount_price IS NOT NULL THEN ROUND(((price - discount_price) / price * 100)::numeric, 0) ELSE 0 END as discount_percentage
      FROM products 
      WHERE is_active = true AND is_new_arrival = true 
      ORDER BY created_at DESC 
      LIMIT 20`
    );

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ products: result.rows })
    };
  } catch (error) {
    console.error('New arrivals error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to fetch new arrivals' })
    };
  }
};

