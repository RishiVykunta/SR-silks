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
    const match = urlPath.match(/^\/api\/wishlist\/(.+)$/);
    if (match) {
      slug = match[1].split('/');
    } else if (urlPath === '/api/wishlist' || urlPath === '/api/wishlist/') {
      slug = '';
    }
  }
  
  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const key = parts.join('/');
  
  console.log('Wishlist route:', { url: req.url, slug, parts, key });

  let handler;
  switch (key) {
    case '':
      handler = require('../../handlers/wishlist/index');
      break;
    case 'toggle':
      handler = require('../../handlers/wishlist/toggle');
      break;
    case 'count':
      handler = require('../../handlers/wishlist/count');
      break;
    default:
      return notFound(req, res);
  }

  return runHandler(handler, req, res);
};
