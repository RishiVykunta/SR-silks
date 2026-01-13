const { query } = require('../_lib/db');
const { authenticate } = require('../_lib/auth');
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
    // Authenticate user
    const authResult = await authenticate(req);
    if (authResult.error) {
      return {
        statusCode: authResult.error.status,
        headers: corsHeaders(),
        body: JSON.stringify({ error: authResult.error.message })
      };
    }

    const result = await query(
      'SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = $1',
      [authResult.user.id]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ user: result.rows[0] })
    };
  } catch (error) {
    console.error('Profile error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to fetch profile' })
    };
  }
};
