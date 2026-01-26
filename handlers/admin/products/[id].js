const { query } = require('../../_lib/db');
const { authenticateAdmin } = require('../../_lib/auth');
const { corsHeaders, handleCors } = require('../../_lib/cors');
const { parseBody } = require('../../_lib/request');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const { id } = req.query;

    if (req.method === 'PUT') {
      const body = parseBody(req);
      const { name, description, price, discount_price, category, occasion_type, collection_name, images, size, color, material, features, specifications, shipping_info, stock, is_active, is_new_arrival, is_featured } = body;

      // Trim string fields to remove any extra whitespace
      const trimmedOccasionType = occasion_type && typeof occasion_type === 'string' ? occasion_type.trim() || null : null;
      const trimmedCategory = category && typeof category === 'string' ? category.trim() || null : null;
      const trimmedCollectionName = collection_name && typeof collection_name === 'string' ? collection_name.trim() || null : null;

      const result = await query(
        `UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description), price = COALESCE($3, price), discount_price = $4, category = COALESCE($5, category), occasion_type = $6, collection_name = COALESCE($7, collection_name), images = COALESCE($8, images), size = COALESCE($9, size), color = COALESCE($10, color), material = COALESCE($11, material), features = COALESCE($12, features), specifications = $13, shipping_info = COALESCE($14, shipping_info), stock = COALESCE($15, stock), is_active = COALESCE($16, is_active), is_new_arrival = COALESCE($17, is_new_arrival), is_featured = COALESCE($18, is_featured), updated_at = CURRENT_TIMESTAMP WHERE id = $19 RETURNING *`,
        [name, description, price, discount_price, trimmedCategory, trimmedOccasionType, trimmedCollectionName, images, size, color, material, features, specifications ? JSON.stringify(specifications) : null, shipping_info, stock, is_active, is_new_arrival, is_featured, id]
      );

      if (result.rows.length === 0) {
        return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: 'Product not found' }) };
      }

      return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ message: 'Product updated successfully', product: result.rows[0] }) };
    } else if (req.method === 'DELETE') {
      const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: 'Product not found' }) };
      }

      return { statusCode: 200, headers: corsHeaders(), body: JSON.stringify({ message: 'Product deleted successfully' }) };
    } else {
      return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    console.error('Admin product operation error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to process request' }) };
  }
};
