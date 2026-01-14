const { runHandler } = require('../../handlers/_lib/vercel-adapter');

function notFound(req, res) {
  return res.status(404).json({ error: 'Not found', path: req.url, query: req.query });
}

module.exports = async (req, res) => {
  // Extract slug from query or URL path
  let slug = req.query?.slug;
  
  // If slug not in query, parse from URL path
  if (!slug && req.url) {
    const urlPath = req.url.split('?')[0]; // Remove query string
    const match = urlPath.match(/\/api\/admin\/(.+)$/);
    if (match) {
      slug = match[1].split('/');
    }
  }
  
  // Also check req.path if available (Vercel sometimes uses this)
  if (!slug && req.path) {
    const pathMatch = req.path.match(/\/api\/admin\/(.+)$/);
    if (pathMatch) {
      slug = pathMatch[1].split('/');
    }
  }
  
  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const key = parts.join('/');
  
  console.log('Admin route:', { url: req.url, slug, parts, key });

  let handler;
  switch (key) {
    case 'login':
      handler = require('../../handlers/auth/admin/login');
      break;
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
