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
    const match = urlPath.match(/^\/api\/cart\/(.+)$/);
    if (match) {
      slug = match[1].split('/');
    } else if (urlPath === '/api/cart' || urlPath === '/api/cart/') {
      slug = '';
    }
  }
  
  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const key = parts.join('/');
  
  console.log('Cart route:', { url: req.url, slug, parts, key });

  let handler;
  switch (key) {
    case '':
      handler = require('../../handlers/cart/index');
      break;
    case 'add':
      handler = require('../../handlers/cart/add');
      break;
    case 'clear':
      handler = require('../../handlers/cart/clear');
      break;
    case 'count':
      handler = require('../../handlers/cart/count');
      break;
    default:
      if (parts.length === 2 && parts[0] === 'remove' && parts[1]) {
        req.query = { ...(req.query || {}), id: parts[1] };
        handler = require('../../handlers/cart/remove/[id]');
        break;
      }
      if (parts.length === 2 && parts[0] === 'update' && parts[1]) {
        req.query = { ...(req.query || {}), id: parts[1] };
        handler = require('../../handlers/cart/update/[id]');
        break;
      }
      return notFound(req, res);
  }

  return runHandler(handler, req, res);
};

