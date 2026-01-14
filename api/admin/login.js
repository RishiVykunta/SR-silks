const { runHandler } = require('../../handlers/_lib/vercel-adapter');
const handler = require('../../handlers/auth/admin/login');

module.exports = async (req, res) => {
  return runHandler(handler, req, res);
};
