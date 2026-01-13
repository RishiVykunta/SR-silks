const { getClient } = require('../_lib/db');
const { authenticate } = require('../_lib/auth');
const { corsHeaders, handleCors } = require('../_lib/cors');
const { parseBody } = require('../_lib/request');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;

  if (req.method === 'POST') {
    // Create order
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const authResult = await authenticate(req);
      if (authResult.error) {
        await client.query('ROLLBACK');
        return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };
      }

      const body = parseBody(req);
      const { first_name, last_name, email, phone, address_line1, address_line2, city, state, postal_code, country, payment_method } = body;

      const cartResult = await client.query(
        `SELECT c.*, p.name, p.images, p.price, p.discount_price, COALESCE(p.discount_price, p.price) as final_price
        FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1 AND p.is_active = true`,
        [authResult.user.id]
      );

      if (cartResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: 'Cart is empty' }) };
      }

      const subtotal = cartResult.rows.reduce((sum, item) => sum + (parseFloat(item.final_price) * item.quantity), 0);
      const shippingThreshold = 5000;
      const shipping = subtotal >= shippingThreshold ? 0 : 200;
      const total = subtotal + shipping;
      const orderNumber = `ORD-${Date.now()}-${authResult.user.id}`;

      const orderResult = await client.query(
        `INSERT INTO orders (user_id, order_number, total_amount, shipping_amount, subtotal, first_name, last_name, email, phone, address_line1, address_line2, city, state, postal_code, country, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
        [authResult.user.id, orderNumber, total, shipping, subtotal, first_name, last_name, email, phone, address_line1, address_line2 || null, city, state, postal_code, country || 'India', payment_method]
      );

      const order = orderResult.rows[0];

      for (const item of cartResult.rows) {
        const productCheck = await client.query('SELECT stock FROM products WHERE id = $1', [item.product_id]);
        if (productCheck.rows.length === 0 || (productCheck.rows[0].stock || 0) < item.quantity) {
          await client.query('ROLLBACK');
          return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ error: `Insufficient stock for ${item.name}` }) };
        }

        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, size, color, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [order.id, item.product_id, item.name, item.images && item.images.length > 0 ? item.images[0] : null, item.final_price, item.quantity, item.size || null, item.color || null, parseFloat(item.final_price) * item.quantity]
        );

        await client.query('UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [item.quantity, item.product_id]);
      }

      await client.query('DELETE FROM cart WHERE user_id = $1', [authResult.user.id]);
      await client.query('COMMIT');

      const orderDetailsResult = await client.query(
        `SELECT o.*, json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name, 'product_image', oi.product_image, 'price', oi.price, 'quantity', oi.quantity, 'size', oi.size, 'color', oi.color, 'subtotal', oi.subtotal)) as items
        FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.id = $1 GROUP BY o.id`,
        [order.id]
      );

      return { statusCode: 201, headers: corsHeaders(), body: JSON.stringify({ message: 'Order created successfully', order: orderDetailsResult.rows[0] }) };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create order error:', error);
      return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to create order' }) };
    } finally {
      client.release();
    }
  } else if (req.method === 'GET') {
    // This would be for /api/orders/user - handled separately
    return { statusCode: 404, headers: corsHeaders(), body: JSON.stringify({ error: 'Not found' }) };
  } else {
    return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };
  }
};
