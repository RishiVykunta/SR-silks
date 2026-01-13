const { query } = require('../_lib/db');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { getQuery } = require('../_lib/request');

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
    const queryParams = getQuery(req);
    const { price_filter } = queryParams;
    let whereClause = "is_active = true AND collection_name = 'Celebrate'";
    let params = [];

    if (price_filter) {
      const price = parseInt(price_filter);
      if (price === 10) {
        whereClause += ' AND COALESCE(discount_price, price) <= 10000';
      } else if (price === 20) {
        whereClause += ' AND COALESCE(discount_price, price) > 10000 AND COALESCE(discount_price, price) <= 20000';
      } else if (price === 30) {
        whereClause += ' AND COALESCE(discount_price, price) > 20000 AND COALESCE(discount_price, price) <= 30000';
      } else if (price === 50) {
        whereClause += ' AND COALESCE(discount_price, price) > 50000';
      }
    }

    const result = await query(
      `SELECT *, 
        COALESCE(discount_price, price) as final_price,
        CASE WHEN discount_price IS NOT NULL THEN ROUND(((price - discount_price) / price * 100)::numeric, 0) ELSE 0 END as discount_percentage
      FROM products 
      WHERE ${whereClause}
      ORDER BY created_at DESC`,
      params
    );

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ products: result.rows })
    };
  } catch (error) {
    console.error('Celebrate collection error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to fetch celebrate collection' })
    };
  }
};
