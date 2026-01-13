const { query } = require('../../_lib/db');
const { corsHeaders, handleCors } = require('../../_lib/cors');

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
      'SELECT DISTINCT category FROM products WHERE is_active = true AND category IS NOT NULL ORDER BY category'
    );

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ categories: result.rows.map(r => r.category) })
    };
  } catch (error) {
    console.error('Categories error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to fetch categories' })
    };
  }
};
