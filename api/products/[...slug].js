const { runHandler } = require('../../handlers/_lib/vercel-adapter');

function notFound(req, res) {
  return res.status(404).json({ error: 'Not found', path: req.url, query: req.query });
}

module.exports = async (req, res) => {
  // Extract slug from query or URL path
  let slug = req.query?.slug;
  
  // If slug not in query, parse from URL path
  if (!slug && req.url) {
    const urlPath = req.url.split('?')[0];
    // Handle both /api/products and /api/products/ paths
    if (urlPath === '/api/products' || urlPath === '/api/products/') {
      slug = '';
    } else {
      const match = urlPath.match(/^\/api\/products\/(.+)$/);
      if (match) {
        slug = match[1].split('/');
      } else {
        // If no match, try to get from req.path or req.url
        const pathMatch = (req.path || req.url || '').match(/\/api\/products\/(.+)$/);
        if (pathMatch) {
          slug = pathMatch[1].split('/');
        }
      }
    }
  }
  
  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const key = parts.join('/');
  
  console.log('Products route:', { url: req.url, slug, parts, key });

  let handler;
  switch (key) {
    case '':
      handler = require('../../handlers/products/index');
      break;
    case 'new-arrivals':
      handler = require('../../handlers/products/new-arrivals');
      break;
    case 'celebrate':
      handler = require('../../handlers/products/celebrate');
      break;
    case 'categories/list':
      handler = require('../../handlers/products/categories/list');
      break;
    default:
      // /api/products/:id
      if (parts.length === 1 && parts[0]) {
        req.query = { ...(req.query || {}), id: parts[0] };
        handler = require('../../handlers/products/[id]');
        break;
      }
      return notFound(req, res);
  }

  return runHandler(handler, req, res);
};

