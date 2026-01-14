const { query } = require('../_lib/db');
const { authenticateAdmin } = require('../_lib/auth');
const { corsHeaders, handleCors } = require('../_lib/cors');

module.exports = async (req, res) => {
  const corsResponse = handleCors(req, res);
  if (corsResponse) return corsResponse;
  if (req.method !== 'GET') return { statusCode: 405, headers: corsHeaders(), body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const authResult = await authenticateAdmin(req);
    if (authResult.error) return { statusCode: authResult.error.status, headers: corsHeaders(), body: JSON.stringify({ error: authResult.error.message }) };

    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    const productsResult = await query('SELECT COUNT(*) as count FROM products');
    const totalProducts = parseInt(productsResult.rows[0].count);

    const ordersResult = await query('SELECT COUNT(*) as count FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].count);

    const revenueResult = await query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'");
    const totalRevenue = parseFloat(revenueResult.rows[0].total || 0);

    const monthlyRevenueResult = await query(
      `SELECT DATE_TRUNC('month', created_at) as month, COALESCE(SUM(total_amount), 0) as revenue
      FROM orders WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month ORDER BY month DESC`
    );

    const avgOrderResult = await query("SELECT COALESCE(AVG(total_amount), 0) as avg FROM orders WHERE status != 'cancelled'");
    const avgOrderValue = parseFloat(avgOrderResult.rows[0].avg || 0);

    const ordersByStatusResult = await query('SELECT status, COUNT(*) as count FROM orders GROUP BY status');

    const recentOrdersResult = await query(
      `SELECT o.*, u.email, u.first_name, u.last_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10`
    );

    const topProductsResult = await query(
      `SELECT p.id, p.name, p.images, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as total_revenue
      FROM order_items oi JOIN products p ON oi.product_id = p.id JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled' GROUP BY p.id, p.name, p.images ORDER BY total_sold DESC LIMIT 10`
    );

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({
        analytics: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue.toFixed(2),
          avgOrderValue: avgOrderValue.toFixed(2),
          monthlyRevenue: monthlyRevenueResult.rows,
          ordersByStatus: ordersByStatusResult.rows.reduce((acc, row) => {
            acc[row.status] = parseInt(row.count);
            return acc;
          }, {}),
          recentOrders: recentOrdersResult.rows,
          topProducts: topProductsResult.rows
        }
      })
    };
  } catch (error) {
    console.error('Dashboard error:', error);
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ error: 'Failed to fetch dashboard data' }) };
  }
};
