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

