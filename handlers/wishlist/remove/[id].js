const { query } = require('../../_lib/db');
const { authenticate } = require('../../_lib/auth');
const { corsHeaders, handleCors } = require('../../_lib/cors');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;
  if (req.method !== 'DELETE') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const authResult = await authenticate(req);
    if (authResult.error) {
      return {
        statusCode: authResult.error.status,
        headers: corsHeaders(),
        body: JSON.stringify({ error: authResult.error.message })
      };
    }

    const itemId = req.query?.id;
    if (!itemId) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Wishlist item ID is required' })
      };
    }

    // Verify the wishlist item belongs to the user
    const checkResult = await query(
      'SELECT * FROM wishlist WHERE id = $1 AND user_id = $2',
      [itemId, authResult.user.id]
    );

    if (checkResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: corsHeaders(),
        body: JSON.stringify({ error: 'Wishlist item not found' })
      };
    }

    // Delete the wishlist item
    await query('DELETE FROM wishlist WHERE id = $1', [itemId]);

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ message: 'Item removed from wishlist' })
    };
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Failed to remove from wishlist' })
    };
  }
};
