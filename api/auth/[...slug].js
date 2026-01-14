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
    const match = urlPath.match(/\/api\/auth\/(.+)$/);
    if (match) {
      slug = match[1].split('/');
    }
  }
  
  // Also check req.path if available (Vercel sometimes uses this)
  if (!slug && req.path) {
    const pathMatch = req.path.match(/\/api\/auth\/(.+)$/);
    if (pathMatch) {
      slug = pathMatch[1].split('/');
    }
  }
  
  const parts = Array.isArray(slug) ? slug : (slug ? [slug] : []);
  const key = parts.join('/');
  
  console.log('Auth route:', { url: req.url, slug, parts, key });

  let handler;
  switch (key) {
    case 'login':
      handler = require('../../handlers/auth/login');
      break;
    case 'register':
      handler = require('../../handlers/auth/register');
      break;
    case 'profile':
      handler = require('../../handlers/auth/profile');
      break;
    case 'admin/login':
      handler = require('../../handlers/auth/admin/login');
      break;
    default:
      return notFound(req, res);
  }

  return runHandler(handler, req, res);
};

