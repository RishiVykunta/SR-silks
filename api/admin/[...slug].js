const { runHandler } = require('../../handlers/_lib/vercel-adapter');

function notFound(req, res) {
  return res.status(404).json({ error: 'Not found' });
}

module.exports = async (req, res) => {
  const slug = req.query?.slug;
  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const key = parts.join('/');

  let handler;
  switch (key) {
    case 'dashboard':
      handler = require('../../handlers/admin/dashboard');
      break;
    case 'products':
      handler = require('../../handlers/admin/products/index');
      break;
    case 'orders':
      handler = require('../../handlers/admin/orders/index');
      break;
    case 'users':
      handler = require('../../handlers/admin/users/index');
      break;
    default:
      if (parts.length === 2 && parts[0] === 'products' && parts[1]) {
        req.query = { ...(req.query || {}), id: parts[1] };
        handler = require('../../handlers/admin/products/[id]');
        break;
      }
      if (parts.length === 3 && parts[0] === 'products' && parts[1] && parts[2] === 'toggle-status') {
        req.query = { ...(req.query || {}), id: parts[1] };
        handler = require('../../handlers/admin/products/[id]/toggle-status');
        break;
      }
      if (parts.length === 2 && parts[0] === 'orders' && parts[1]) {
        req.query = { ...(req.query || {}), id: parts[1] };
        handler = require('../../handlers/admin/orders/[id]');
        break;
      }
      if (parts.length === 3 && parts[0] === 'orders' && parts[1] && parts[2] === 'status') {
        req.query = { ...(req.query || {}), id: parts[1] };
        handler = require('../../handlers/admin/orders/[id]/status');
        break;
      }
      if (parts.length === 2 && parts[0] === 'users' && parts[1]) {
        req.query = { ...(req.query || {}), id: parts[1] };
        handler = require('../../handlers/admin/users/[id]');
        break;
      }
      return notFound(req, res);
  }

  return runHandler(handler, req, res);
};
