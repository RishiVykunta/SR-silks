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

