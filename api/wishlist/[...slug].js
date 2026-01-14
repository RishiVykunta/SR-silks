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
