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
    case 'image':
      handler = require('../../handlers/upload/image');
      break;
    case 'images':
      handler = require('../../handlers/upload/images');
      break;
    default:
      if (parts.length === 2 && parts[0] === 'image' && parts[1]) {
        req.query = { ...(req.query || {}), publicId: parts[1] };
        handler = require('../../handlers/upload/image/[publicId]');
        break;
      }
      return notFound(req, res);
  }

  return runHandler(handler, req, res);
};
