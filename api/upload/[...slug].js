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
    const match = urlPath.match(/^\/api\/upload\/(.+)$/);
    if (match) {
      slug = match[1].split('/');
    }
  }
  
  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const key = parts.join('/');
  
  console.log('Upload route:', { url: req.url, slug, parts, key });

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
